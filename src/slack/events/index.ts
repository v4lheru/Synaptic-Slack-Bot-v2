/**
 * Slack Event Handlers
 * 
 * This module registers event handlers for various Slack events.
 * It serves as the entry point for all event-related functionality.
 */

import { app } from '../app';
import { logger, logEmoji } from '../../utils/logger';
import { OpenRouterClient } from '../../ai/openrouter/client';
import { contextManager } from '../../ai/context/manager';
import * as conversationUtils from '../utils/conversation';
import * as blockKit from '../utils/block-kit';
import { AVAILABLE_FUNCTIONS, handleFunctionCall, formatFunctionCallResult } from '../../mcp/function-calling';
import { DEFAULT_MODEL } from '../../ai/openrouter/models';
import { FunctionCall } from '../../ai/interfaces/provider';
import { ThreadInfo } from '../utils/conversation';

// Create an instance of the OpenRouter client
const aiClient = new OpenRouterClient();

// Get the bot's user ID (will be populated after the app starts)
let botUserId: string | undefined;

// Initialize the bot user ID
app.event('app_home_opened', async ({ client }) => {
    try {
        if (!botUserId) {
            const authInfo = await client.auth.test();
            botUserId = authInfo.user_id;
            logger.info(`${logEmoji.slack} Bot user ID initialized: ${botUserId}`);
        }
    } catch (error) {
        logger.error(`${logEmoji.error} Error initializing bot user ID`, { error });
    }
});

/**
 * Process a message and generate an AI response
 * 
 * @param threadInfo Thread information
 * @param messageText Message text
 * @param client Slack client
 * @returns Promise resolving to the AI response
 */
async function processMessageAndGenerateResponse(
    threadInfo: ThreadInfo,
    messageText: string,
    client: any
): Promise<void> {
    try {
        // Send a thinking message
        const thinkingMessageTs = await conversationUtils.sendThinkingMessage(app, threadInfo);

        // Initialize context from history if needed
        if (!botUserId) {
            const authInfo = await client.auth.test();
            botUserId = authInfo.user_id || '';
            logger.info(`${logEmoji.slack} Bot user ID initialized: ${botUserId}`);
        }
        await conversationUtils.initializeContextFromHistory(app, threadInfo, botUserId || '');

        // Add the user message to the conversation context
        conversationUtils.addUserMessageToThread(threadInfo, messageText);

        // Get the conversation history
        const conversationHistory = conversationUtils.getThreadHistory(threadInfo);

        // Generate a response from the AI
        const aiResponse = await aiClient.generateResponse(
            messageText,
            conversationHistory,
            AVAILABLE_FUNCTIONS
        );

        // Determine if this is a function call request or a regular conversation
        let functionResults: string[] = [];
        let finalResponse = aiResponse.content;
        let showFunctionResults = true;

        if (aiResponse.functionCalls && aiResponse.functionCalls.length > 0) {
            // This is a function call request
            functionResults = await processFunctionCalls(aiResponse.functionCalls);

            // Create a more conversational response based on function results
            if (functionResults.length > 0) {
                // Check if all function calls were successful
                const allSuccessful = functionResults.every(result => !result.includes('Error executing function'));

                if (allSuccessful) {
                    // Extract success messages from function results
                    const successMessages = functionResults.map(result => {
                        // Extract the function name and result from the formatted string
                        const match = result.match(/Function (\w+) result: (.*)/s);
                        if (match) {
                            const functionName = match[1];
                            const functionResult = JSON.parse(match[2]);

                            // Return a user-friendly message based on the function name and result
                            if (functionResult.message) {
                                return functionResult.message;
                            } else if (functionResult.success) {
                                return `I've successfully completed the ${functionName} action.`;
                            }
                        }
                        return null;
                    }).filter(Boolean);

                    // Create a conversational response
                    if (successMessages.length > 0) {
                        finalResponse = successMessages.join("\n\n");

                        // If the original AI response is not empty and not a default message, append it
                        if (aiResponse.content &&
                            aiResponse.content.trim() !== "" &&
                            aiResponse.content !== "I don't have a response at this time.") {
                            finalResponse += "\n\n" + aiResponse.content;
                        }
                    }
                }
            }
        } else {
            // This is a regular conversation, use the AI response directly
            finalResponse = aiResponse.content;
            // Don't show function results for regular conversations
            showFunctionResults = false;
        }

        // Update the thinking message with the final response
        await conversationUtils.updateThinkingMessageWithAIResponse(
            app,
            threadInfo,
            thinkingMessageTs,
            finalResponse,
            aiResponse.metadata,
            showFunctionResults ? functionResults : []
        );
    } catch (error) {
        logger.error(`${logEmoji.error} Error processing message and generating response`, { error });
        await conversationUtils.sendErrorMessage(
            app,
            threadInfo,
            'Error Generating Response',
            'There was an error generating a response. Please try again later.',
            error instanceof Error ? error.message : String(error)
        );
    }
}

/**
 * Process function calls from the AI
 * 
 * @param functionCalls Array of function calls
 * @returns Promise resolving to an array of function results
 */
async function processFunctionCalls(functionCalls: FunctionCall[]): Promise<string[]> {
    const results: string[] = [];

    for (const functionCall of functionCalls) {
        try {
            logger.info(`${logEmoji.mcp} Processing function call: ${functionCall.name}`);

            // Execute the function call
            const result = await handleFunctionCall(functionCall);

            // Format the result
            const formattedResult = formatFunctionCallResult(functionCall.name, result);
            results.push(formattedResult);
        } catch (error) {
            logger.error(`${logEmoji.error} Error processing function call: ${functionCall.name}`, { error });
            results.push(`Error executing function ${functionCall.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    return results;
}

// Handle message events
app.message(async ({ message, client }) => {
    try {
        logger.debug(`${logEmoji.slack} Received message event: ${JSON.stringify(message)}`);

        // Ensure we have a proper message with a user and text
        if (!('user' in message) || !message.user || !('text' in message) || !message.text) {
            logger.debug(`${logEmoji.slack} Ignoring message without user or text content`);
            return;
        }

        // Ignore messages from the bot itself
        if (botUserId && message.user === botUserId) {
            return;
        }

        // Create thread info
        const threadInfo: ThreadInfo = {
            channelId: message.channel,
            threadTs: 'thread_ts' in message && message.thread_ts ? message.thread_ts : message.ts,
            userId: message.user,
        };

        // Process the message and generate a response
        await processMessageAndGenerateResponse(threadInfo, message.text, client);
    } catch (error) {
        logger.error(`${logEmoji.error} Error handling message event`, { error });
    }
});

// Handle app_mention events
app.event('app_mention', async ({ event, client }) => {
    try {
        logger.debug(`${logEmoji.slack} Received app_mention event: ${JSON.stringify(event)}`);

        // Create thread info
        const threadInfo: ThreadInfo = {
            channelId: event.channel,
            threadTs: 'thread_ts' in event && event.thread_ts ? event.thread_ts : event.ts,
            userId: event.user,
        };

        // Process the message and generate a response
        await processMessageAndGenerateResponse(threadInfo, event.text, client);
    } catch (error) {
        logger.error(`${logEmoji.error} Error handling app_mention event`, { error });
    }
});

// Handle assistant_thread_started events
app.event('assistant_thread_started', async ({ event, client }) => {
    try {
        logger.debug(`${logEmoji.slack} Received assistant_thread_started event: ${JSON.stringify(event)}`);

        // Type assertion for the event object to handle potential structure variations
        const assistantEvent = event as any;
        const channelId = assistantEvent.channel || '';
        const threadTs = assistantEvent.ts || '';
        const userId = assistantEvent.user || '';

        if (!channelId || !threadTs) {
            logger.warn(`${logEmoji.warning} Missing channel or thread info in assistant_thread_started event`);
            return;
        }

        // Create thread info
        const threadInfo: ThreadInfo = {
            channelId,
            threadTs,
            userId,
        };

        // Create a new context for this thread
        contextManager.createContext(threadTs, channelId, userId);

        // Send a welcome message
        await client.chat.postMessage({
            channel: channelId,
            thread_ts: threadTs,
            ...blockKit.aiResponseMessage(
                "Hello! I'm your AI assistant. How can I help you today?"
            )
        });
    } catch (error) {
        logger.error(`${logEmoji.error} Error handling assistant_thread_started event`, { error });
    }
});

// Handle assistant_thread_context_changed events
app.event('assistant_thread_context_changed', async ({ event }) => {
    try {
        logger.debug(`${logEmoji.slack} Received assistant_thread_context_changed event: ${JSON.stringify(event)}`);

        // Type assertion for the event object
        const contextEvent = event as any;
        const channelId = contextEvent.channel || '';
        const threadTs = contextEvent.thread_ts || '';
        const contextPayload = contextEvent.context_payload;

        if (!channelId || !threadTs) {
            logger.warn(`${logEmoji.warning} Missing channel or thread info in assistant_thread_context_changed event`);
            return;
        }

        // Update the system message if context payload is provided
        if (contextPayload && typeof contextPayload === 'string') {
            conversationUtils.updateSystemMessageForThread(
                { channelId, threadTs },
                contextPayload
            );
            logger.info(`${logEmoji.slack} Updated system message for thread ${threadTs} with new context`);
        }
    } catch (error) {
        logger.error(`${logEmoji.error} Error handling assistant_thread_context_changed event`, { error });
    }
});

logger.info(`${logEmoji.slack} Slack event handlers registered`);
