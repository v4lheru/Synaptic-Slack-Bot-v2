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
import { FunctionCall, ConversationMessage } from '../../ai/interfaces/provider';
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

        // Get the conversation history - but only include system message and current user message
        // to minimize token usage
        const fullHistory = conversationUtils.getThreadHistory(threadInfo);

        // Extract only the system message and the current user message
        const systemMessage = fullHistory.find(msg => msg.role === 'system');
        const userMessage = fullHistory[fullHistory.length - 1]; // Last message is the current user message

        // Create a minimal conversation history with just these messages
        const minimalHistory = [];
        if (systemMessage) minimalHistory.push(systemMessage);
        if (userMessage) minimalHistory.push(userMessage);

        // Generate a response from the AI with minimal history
        const aiResponse = await aiClient.generateResponse(
            messageText,
            minimalHistory,
            AVAILABLE_FUNCTIONS
        );

        // Determine if this is a function call request or a regular conversation
        let functionResults: string[] = [];
        let finalResponse = aiResponse.content;
        let showFunctionResults = true;

        if (aiResponse.functionCalls && aiResponse.functionCalls.length > 0) {
            // This is a function call request
            functionResults = await processFunctionCalls(
                aiResponse.functionCalls,
                threadInfo,
                minimalHistory
            );

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
 * @param threadInfo Thread information for follow-up responses
 * @param conversationHistory Current conversation history
 * @returns Promise resolving to an array of function results
 */
async function processFunctionCalls(
    functionCalls: FunctionCall[],
    threadInfo?: ThreadInfo,
    conversationHistory?: any[]
): Promise<string[]> {
    const results: string[] = [];
    const functionResults: any[] = [];

    for (const functionCall of functionCalls) {
        try {
            logger.info(`${logEmoji.mcp} Processing function call: ${functionCall.name}`);

            // Execute the function call
            const result = await handleFunctionCall(functionCall);
            functionResults.push({ name: functionCall.name, result });

            // Format the result
            const formattedResult = formatFunctionCallResult(functionCall.name, result);
            results.push(formattedResult);

            // Log the result for debugging
            logger.debug(`${logEmoji.mcp} Function call result: ${JSON.stringify(result)}`);
        } catch (error) {
            logger.error(`${logEmoji.error} Error processing function call: ${functionCall.name}`, { error });
            results.push(`Error executing function ${functionCall.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    // If we have thread info and conversation history, check if we need to continue the workflow
    if (threadInfo && conversationHistory && functionResults.length > 0) {
        try {
            // Check if we need to continue the workflow based on the function results
            const continueWorkflow = await shouldContinueWorkflow(functionResults, conversationHistory);

            if (continueWorkflow) {
                logger.info(`${logEmoji.mcp} Continuing workflow with follow-up function calls`);

                // Generate a follow-up response with the function results as context
                const followUpResponse = await generateFollowUpResponse(threadInfo, functionResults, conversationHistory);

                // If the follow-up response has function calls, process them
                if (followUpResponse.functionCalls && followUpResponse.functionCalls.length > 0) {
                    const followUpResults = await processFunctionCalls(
                        followUpResponse.functionCalls,
                        threadInfo,
                        [...conversationHistory, { role: 'assistant', content: JSON.stringify(functionResults) }]
                    );

                    // Add the follow-up results to the original results
                    results.push(...followUpResults);
                }
            }
        } catch (error) {
            logger.error(`${logEmoji.error} Error in workflow continuation`, { error });
        }
    }

    return results;
}

/**
 * Determine if we should continue the workflow based on function results
 * 
 * @param functionResults Array of function results
 * @param conversationHistory Current conversation history
 * @returns Promise resolving to a boolean indicating if we should continue
 */
async function shouldContinueWorkflow(functionResults: any[], conversationHistory: any[]): Promise<boolean> {
    // Check if any of the function calls are part of a multi-step workflow
    const multiStepWorkflows = [
        // Search followed by sending a message
        { first: 'searchChannels', next: 'sendMessage' },
        // Create channel followed by inviting users
        { first: 'createChannel', next: 'inviteToChannel' },
        // Create channel followed by sending a message
        { first: 'createChannel', next: 'sendMessage' },
        // Invite to channel followed by sending a message
        { first: 'inviteToChannel', next: 'sendMessage' },
        // Create channel and invite users followed by sending a message
        { first: 'createChannelAndInviteUsers', next: 'sendMessage' },
        // Any function call that might need a follow-up
        { first: 'searchChannels', next: null },
        { first: 'createChannel', next: null },
        { first: 'inviteToChannel', next: null },
        { first: 'createChannelAndInviteUsers', next: null }
    ];

    // Check if the last function call matches the first step of any workflow
    const lastFunctionCall = functionResults[functionResults.length - 1];

    if (!lastFunctionCall) return false;

    // Check if this function is part of a known workflow
    const matchingWorkflow = multiStepWorkflows.find(workflow =>
        workflow.first === lastFunctionCall.name
    );

    if (!matchingWorkflow) return false;

    // If we have a specific next step, we'll continue
    if (matchingWorkflow.next) return true;

    // For general cases, analyze the conversation to see if it implies a multi-step task
    const userMessages = conversationHistory
        .filter((msg: any) => msg.role === 'user')
        .map((msg: any) => typeof msg.content === 'string' ? msg.content : '');

    const lastUserMessage = userMessages[userMessages.length - 1] || '';

    // Check for phrases that suggest a multi-step task
    const multiStepPhrases = [
        'then', 'after', 'next', 'finally', 'and',
        'post', 'send', 'share', 'create', 'invite',
        'summary', 'summarize', 'channel', 'meeting',
        'welcome'
    ];

    // Check for specific multi-step task patterns
    if (lastUserMessage.toLowerCase().includes('meeting') &&
        lastUserMessage.toLowerCase().includes('summary')) {
        return true;
    }

    // Check for "create channel and invite" pattern
    if (lastUserMessage.toLowerCase().includes('create') &&
        lastUserMessage.toLowerCase().includes('channel') &&
        (lastUserMessage.toLowerCase().includes('invite') ||
            lastUserMessage.toLowerCase().includes('add'))) {
        return true;
    }

    // Check for "create channel and send message" pattern
    if (lastUserMessage.toLowerCase().includes('create') &&
        lastUserMessage.toLowerCase().includes('channel') &&
        (lastUserMessage.toLowerCase().includes('send') ||
            lastUserMessage.toLowerCase().includes('message') ||
            lastUserMessage.toLowerCase().includes('welcome'))) {
        return true;
    }

    // Check for other multi-step phrases
    return multiStepPhrases.some(phrase =>
        lastUserMessage.toLowerCase().includes(phrase.toLowerCase())
    );
}

/**
 * Generate a follow-up response based on function results
 * 
 * @param threadInfo Thread information
 * @param functionResults Array of function results
 * @param conversationHistory Current conversation history
 * @returns Promise resolving to the AI response
 */
async function generateFollowUpResponse(
    threadInfo: ThreadInfo,
    functionResults: any[],
    conversationHistory: any[]
): Promise<any> {
    try {
        // Create a concise prompt with minimal function result data
        // Only include essential information from the function results
        const functionResultsText = functionResults.map(fr => {
            // Extract only the essential information
            const essentialResult = fr.result.success ?
                { success: true, channels: fr.result.channels, message: fr.result.message } :
                { success: false, error: fr.result.error };

            return `${fr.name}: ${JSON.stringify(essentialResult)}`;
        }).join('; ');

        // Extract the original user request from conversation history
        const userMessages = conversationHistory
            .filter((msg: any) => msg.role === 'user')
            .map((msg: any) => typeof msg.content === 'string' ? msg.content : '');

        const originalRequest = userMessages.length > 0 ? userMessages[userMessages.length - 1] : '';

        // Create a more informative prompt that includes the original request
        const prompt = `Original request: "${originalRequest}". Function results: ${functionResultsText}. What's the next step to complete the user's request?`;

        // Create a system message based on the first function call
        let systemContent = `Complete multi-step task. Be concise and execute the next logical function without explanations.

CRITICAL FORMATTING INSTRUCTIONS:
ALL responses MUST use Slack formatting, NOT Markdown. Format all responses using Slack syntax:

*bold text* for emphasis
_italic text_ for definitions
~strikethrough~ when needed
\`code snippets\` for HubSpot-specific terms
- Use manual bullet points (not - or *)
<URL|text> for links with custom text
>text for quotes or important callouts

SACROSANCT ONLY USE SLACK MARKUP - all responses must be formatted for Slack display only.

only BOLD using ONE ASTERISK *TEXT*`;

        if (functionResults.length > 0) {
            const firstFunctionName = functionResults[0].name;

            if (firstFunctionName === 'searchChannels') {
                systemContent = `After finding channels, send a message to the appropriate channel. No explanations - just execute the sendMessage function.

CRITICAL FORMATTING INSTRUCTIONS:
ALL responses MUST use Slack formatting, NOT Markdown. Format all responses using Slack syntax:

*bold text* for emphasis
_italic text_ for definitions
~strikethrough~ when needed
\`code snippets\` for HubSpot-specific terms
- Use manual bullet points (not - or *)
<URL|text> for links with custom text
>text for quotes or important callouts

SACROSANCT ONLY USE SLACK MARKUP - all responses must be formatted for Slack display only.

only BOLD using ONE ASTERISK *TEXT*`;
            } else if (firstFunctionName === 'createChannel') {
                systemContent = `After creating a channel, either invite users or send a welcome message. No explanations - just execute the next function.

CRITICAL FORMATTING INSTRUCTIONS:
ALL responses MUST use Slack formatting, NOT Markdown. Format all responses using Slack syntax:

*bold text* for emphasis
_italic text_ for definitions
~strikethrough~ when needed
\`code snippets\` for HubSpot-specific terms
- Use manual bullet points (not - or *)
<URL|text> for links with custom text
>text for quotes or important callouts

SACROSANCT ONLY USE SLACK MARKUP - all responses must be formatted for Slack display only.

only BOLD using ONE ASTERISK *TEXT*`;
            } else if (firstFunctionName === 'inviteToChannel') {
                systemContent = `After inviting users to a channel, send a welcome message. No explanations - just execute the sendMessage function.

CRITICAL FORMATTING INSTRUCTIONS:
ALL responses MUST use Slack formatting, NOT Markdown. Format all responses using Slack syntax:

*bold text* for emphasis
_italic text_ for definitions
~strikethrough~ when needed
\`code snippets\` for HubSpot-specific terms
- Use manual bullet points (not - or *)
<URL|text> for links with custom text
>text for quotes or important callouts

SACROSANCT ONLY USE SLACK MARKUP - all responses must be formatted for Slack display only.

only BOLD using ONE ASTERISK *TEXT*`;
            } else if (firstFunctionName === 'createChannelAndInviteUsers') {
                systemContent = `After creating a channel and inviting users, send a welcome message. No explanations - just execute the sendMessage function.

CRITICAL FORMATTING INSTRUCTIONS:
ALL responses MUST use Slack formatting, NOT Markdown. Format all responses using Slack syntax:

*bold text* for emphasis
_italic text_ for definitions
~strikethrough~ when needed
\`code snippets\` for HubSpot-specific terms
- Use manual bullet points (not - or *)
<URL|text> for links with custom text
>text for quotes or important callouts

SACROSANCT ONLY USE SLACK MARKUP - all responses must be formatted for Slack display only.

only BOLD using ONE ASTERISK *TEXT*`;
            }
        }

        // Create a minimal conversation history with just the system message and user prompt
        // This significantly reduces token usage
        const updatedHistory: ConversationMessage[] = [
            {
                role: 'system',
                content: systemContent,
                timestamp: new Date().toISOString()
            },
            {
                role: 'user',
                content: prompt,
                timestamp: new Date().toISOString()
            }
        ];

        // Determine which functions to include based on the first function call
        let relevantFunctions = AVAILABLE_FUNCTIONS;

        // Determine which functions to include based on the first function call
        if (functionResults.length > 0) {
            const firstFunctionName = functionResults[0].name;

            if (firstFunctionName === 'searchChannels') {
                // After searching channels, we might want to send a message
                relevantFunctions = AVAILABLE_FUNCTIONS.filter(fn =>
                    fn.name === 'sendMessage'
                );
            } else if (firstFunctionName === 'createChannel') {
                // After creating a channel, we might want to invite users or send a message
                relevantFunctions = AVAILABLE_FUNCTIONS.filter(fn =>
                    fn.name === 'inviteToChannel' || fn.name === 'sendMessage'
                );
            } else if (firstFunctionName === 'inviteToChannel') {
                // After inviting users, we might want to send a welcome message
                relevantFunctions = AVAILABLE_FUNCTIONS.filter(fn =>
                    fn.name === 'sendMessage'
                );
            } else if (firstFunctionName === 'createChannelAndInviteUsers') {
                // After creating a channel and inviting users, we might want to send a message
                relevantFunctions = AVAILABLE_FUNCTIONS.filter(fn =>
                    fn.name === 'sendMessage'
                );
            }
        }

        // Generate a response from the AI with only relevant functions
        return await aiClient.generateResponse(
            prompt,
            updatedHistory,
            relevantFunctions.slice(0, 3) // Limit to at most 3 functions
        );
    } catch (error) {
        logger.error(`${logEmoji.error} Error generating follow-up response`, { error });
        return { content: '', functionCalls: [] };
    }
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
