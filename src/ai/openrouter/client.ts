/**
 * OpenRouter Client
 * 
 * This module implements the OpenRouter API client.
 * It handles communication with the OpenRouter API for generating AI responses.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
    AIProvider,
    AIResponse,
    ConversationMessage,
    FunctionCall,
    FunctionDefinition,
    GenerateOptions,
    MessageContent,
    ModelInfo
} from '../interfaces/provider';
import { DEFAULT_MODEL, getAllModels, getModelInfo, OpenRouterModelId } from './models';
import { env } from '../../config/environment';
import { logger, logEmoji } from '../../utils/logger';

/**
 * OpenRouter API configuration
 */
interface OpenRouterConfig {
    apiKey: string;
    baseUrl: string;
    defaultModel: string;
    defaultTemperature: number;
    defaultMaxTokens: number;
    defaultTopP: number;
    httpTimeout: number;
}

/**
 * OpenRouter API message content format for text
 */
interface OpenRouterTextContent {
    type: 'text';
    text: string;
}

/**
 * OpenRouter API message content format for images
 */
interface OpenRouterImageContent {
    type: 'image_url';
    image_url: {
        url: string;
        detail?: 'low' | 'high' | 'auto';
    };
}

/**
 * OpenRouter API message content format
 */
type OpenRouterMessageContent = OpenRouterTextContent | OpenRouterImageContent;

/**
 * OpenRouter API message format
 */
interface OpenRouterMessage {
    role: string;
    content: string | OpenRouterMessageContent[];
    name?: string;
}

/**
 * OpenRouter API tool function format
 */
interface OpenRouterToolFunction {
    name: string;
    description: string;
    parameters: Record<string, any>;
}

/**
 * OpenRouter API tool format
 */
interface OpenRouterTool {
    type: 'function';
    function: OpenRouterToolFunction;
}

/**
 * OpenRouter API tool choice format
 */
interface OpenRouterToolChoice {
    type: 'function';
    function: {
        name: string;
    };
}

/**
 * OpenRouter API provider routing format
 */
interface OpenRouterProvider {
    order?: string[];
    allow_fallbacks?: boolean;
    require_parameters?: boolean;
    data_collection?: 'allow' | 'deny';
    ignore?: string[];
    quantizations?: string[];
    sort?: 'price' | 'throughput' | 'latency';
}

/**
 * OpenRouter API request format
 */
interface OpenRouterRequest {
    model: string;
    messages: OpenRouterMessage[];
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    stream?: boolean;
    tools?: OpenRouterTool[];
    tool_choice?: 'auto' | 'none' | OpenRouterToolChoice;
    provider?: OpenRouterProvider;
}

/**
 * OpenRouter API tool call format
 */
interface OpenRouterToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}

/**
 * OpenRouter API response choice format
 */
interface OpenRouterResponseChoice {
    message: {
        content: string | null;
        role: string;
        tool_calls?: OpenRouterToolCall[];
    };
    finish_reason: string;
}

/**
 * OpenRouter API error format
 */
interface OpenRouterError {
    message: string;
    code?: string;
    type?: string;
    param?: string;
}

/**
 * OpenRouter API response format
 */
interface OpenRouterResponse {
    id?: string;
    choices?: OpenRouterResponseChoice[];
    model?: string;
    error?: OpenRouterError;
}

/**
 * Implementation of the AIProvider interface for OpenRouter
 */
export class OpenRouterClient implements AIProvider {
    public readonly name = 'OpenRouter';
    private readonly client: AxiosInstance;
    private readonly config: OpenRouterConfig;

    /**
     * Create a new OpenRouter client
     */
    constructor() {
        this.config = {
            apiKey: env.OPENROUTER_API_KEY,
            baseUrl: 'https://openrouter.ai/api/v1',
            defaultModel: DEFAULT_MODEL,
            defaultTemperature: 0.7,
            defaultMaxTokens: 1024,
            defaultTopP: 0.9,
            httpTimeout: 60000, // 60 seconds
        };

        // Create axios client with default configuration
        this.client = axios.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.httpTimeout,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
                'HTTP-Referer': 'https://slack-bot.example.com', // Replace with actual domain in production
                'X-Title': 'Multi-Provider AI Slack Bot',
            },
        });

        logger.info(`${logEmoji.ai} OpenRouter client initialized`);
    }

    /**
     * Generate a response from OpenRouter
     * 
     * @param prompt The user's prompt or query (text or multimodal content)
     * @param conversationHistory Previous messages in the conversation
     * @param functions Optional function definitions for function calling
     * @param options Optional generation parameters
     * @returns A promise resolving to the AI response
     */
    public async generateResponse(
        prompt: string | MessageContent[],
        conversationHistory: ConversationMessage[],
        functions?: FunctionDefinition[],
        options?: GenerateOptions
    ): Promise<AIResponse> {
        try {
            // Format the request
            const modelId = options?.model || this.config.defaultModel;
            const temperature = options?.temperature || this.config.defaultTemperature;
            const maxTokens = options?.maxTokens || this.config.defaultMaxTokens;
            const topP = options?.topP || this.config.defaultTopP;
            const stream = options?.stream || false;

            // Format messages from conversation history
            const messages: OpenRouterMessage[] = conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content,
                name: msg.name,
            }));

            // Add the user prompt
            messages.push({
                role: 'user',
                content: prompt,
            });

            // Format tools if functions are provided
            // Only include essential functions to reduce token usage
            let essentialFunctions: FunctionDefinition[] = [];

            if (functions) {
                const promptText = typeof prompt === 'string' ? prompt.toLowerCase() : '';

                // Determine which functions to include based on the prompt
                if (promptText.includes('meeting') && promptText.includes('summary')) {
                    // For meeting summaries, only include search and message functions
                    essentialFunctions = functions.filter(fn =>
                        fn.name === 'searchChannels' ||
                        fn.name === 'sendMessage'
                    );
                } else if (promptText.includes('channel') && (promptText.includes('create') || promptText.includes('new'))) {
                    // For channel creation, include relevant functions
                    essentialFunctions = functions.filter(fn =>
                        fn.name === 'createChannel' ||
                        fn.name === 'inviteToChannel' ||
                        fn.name === 'createChannelAndInviteUsers'
                    );
                } else if (promptText.includes('message') || promptText.includes('send') || promptText.includes('post')) {
                    // For sending messages
                    essentialFunctions = functions.filter(fn =>
                        fn.name === 'sendMessage' ||
                        fn.name === 'sendDirectMessage' ||
                        fn.name === 'searchChannels'
                    );
                } else if (promptText.includes('search')) {
                    // For search operations
                    essentialFunctions = functions.filter(fn =>
                        fn.name === 'searchChannels' ||
                        fn.name === 'searchMessages'
                    );
                } else if (promptText.includes('user') || promptText.includes('member')) {
                    // For user-related operations
                    essentialFunctions = functions.filter(fn =>
                        fn.name === 'listUsers' ||
                        fn.name === 'getUserInfo' ||
                        fn.name === 'lookupUserByEmail'
                    );
                } else {
                    // For other cases, include a minimal set of common functions
                    essentialFunctions = functions.filter(fn =>
                        ['searchChannels', 'sendMessage', 'createChannel', 'inviteToChannel'].includes(fn.name)
                    );
                }

                // If we couldn't determine specific functions, include a minimal set
                if (essentialFunctions.length === 0) {
                    essentialFunctions = functions.filter(fn =>
                        ['searchChannels', 'sendMessage'].includes(fn.name)
                    );
                }

                // Limit to at most 5 functions to reduce token usage
                essentialFunctions = essentialFunctions.slice(0, 5);
            }

            const openRouterTools = essentialFunctions?.map(fn => ({
                type: 'function' as const,
                function: {
                    name: fn.name,
                    description: fn.description,
                    parameters: fn.parameters,
                }
            }));

            // Create request payload
            const requestPayload: OpenRouterRequest = {
                model: modelId,
                messages,
                temperature,
                max_tokens: maxTokens,
                top_p: topP,
                stream,
            };

            // Add tools if provided
            if (openRouterTools && openRouterTools.length > 0) {
                requestPayload.tools = openRouterTools;
                requestPayload.tool_choice = 'auto';

                // Add provider routing to ensure we use a provider that supports tool use
                requestPayload.provider = {
                    // Require that the provider supports all parameters (including tools)
                    require_parameters: true,
                    // Sort by throughput to get the fastest provider
                    sort: 'throughput'
                };

                // Override the model to use GPT-4o which is known to support tool calls
                requestPayload.model = 'openai/gpt-4o';
            }

            // Log request (excluding sensitive data)
            logger.debug(`${logEmoji.ai} OpenRouter request: ${JSON.stringify({
                ...requestPayload,
                messages: `[${requestPayload.messages.length} messages]`,
            })}`);

            // Log the full request payload for debugging
            logger.debug(`${logEmoji.ai} Full OpenRouter request payload: ${JSON.stringify(requestPayload)}`);

            let response;
            try {
                // Make the API request
                response = await this.client.post<OpenRouterResponse>(
                    '/chat/completions',
                    requestPayload
                );

                // Log the raw response for debugging
                logger.info(`${logEmoji.ai} Raw OpenRouter response: ${JSON.stringify(response.data, null, 2)}`);
            } catch (apiError) {
                // Handle API errors (network issues, authentication errors, etc.)
                if (axios.isAxiosError(apiError) && apiError.response) {
                    // Log the error response
                    logger.error(`${logEmoji.error} OpenRouter API error: ${apiError.response.status} ${apiError.response.statusText}`, {
                        data: apiError.response.data
                    });

                    // Check for specific error types
                    if (apiError.response.status === 401) {
                        throw new Error('Authentication failed: Invalid API key or expired token');
                    } else if (apiError.response.status === 402) {
                        throw new Error('Insufficient credits: Your OpenRouter account needs more credits');
                    } else if (apiError.response.status === 429) {
                        throw new Error('Rate limit exceeded: Too many requests to OpenRouter API');
                    } else if (apiError.response.status >= 500) {
                        throw new Error('OpenRouter server error: The service might be experiencing issues');
                    }

                    // Throw the error with the response data if available
                    if (apiError.response.data && apiError.response.data.error) {
                        throw new Error(`OpenRouter API error: ${apiError.response.data.error.message || JSON.stringify(apiError.response.data)}`);
                    }
                }

                // For other errors, just rethrow with a generic message
                throw new Error(`Failed to connect to OpenRouter API: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
            }

            // Extract the response
            const result = response.data;

            // Check if the response has the expected structure
            if (!result) {
                logger.error(`${logEmoji.error} Invalid response from OpenRouter: response is null or undefined`);
                throw new Error('Invalid response from OpenRouter: response is null or undefined');
            }

            logger.info(`${logEmoji.ai} OpenRouter response structure: ${JSON.stringify({
                hasChoices: !!result.choices,
                isChoicesArray: Array.isArray(result.choices),
                choicesLength: result.choices ? result.choices.length : 0
            })}`);

            if (!result.choices || !Array.isArray(result.choices) || result.choices.length === 0) {
                // If we have an error in the response, log it
                if (result.error) {
                    logger.error(`${logEmoji.error} OpenRouter API error: ${JSON.stringify(result.error)}`);
                    throw new Error(`OpenRouter API error: ${result.error.message || JSON.stringify(result.error)}`);
                }

                // Otherwise, log the full response for debugging
                logger.error(`${logEmoji.error} Invalid response from OpenRouter: missing or empty choices array`, {
                    responseData: JSON.stringify(result, null, 2)
                });

                // For now, let's create a fallback response
                return {
                    content: "I'm sorry, I couldn't generate a response at this time. Please try again later.",
                    metadata: {
                        model: "fallback",
                        finishReason: "error"
                    }
                };
            }

            const choice = result.choices[0];

            if (!choice || !choice.message) {
                logger.error(`${logEmoji.error} Invalid response from OpenRouter: missing message in choice`, {
                    choice: JSON.stringify(choice)
                });
                throw new Error('Invalid response from OpenRouter: missing message');
            }

            const message = choice.message;

            // Parse tool calls if present
            let functionCalls: FunctionCall[] | undefined;
            if (message.tool_calls && message.tool_calls.length > 0) {
                functionCalls = [];
                for (const toolCall of message.tool_calls) {
                    if (toolCall.type === 'function') {
                        try {
                            const args = JSON.parse(toolCall.function.arguments);
                            functionCalls.push({
                                name: toolCall.function.name,
                                arguments: args,
                            });
                        } catch (error) {
                            logger.error(`${logEmoji.error} Error parsing tool call arguments`, { error });
                            // If parsing fails, provide the raw string
                            functionCalls.push({
                                name: toolCall.function.name,
                                arguments: { raw: toolCall.function.arguments },
                            });
                        }
                    }
                }
            }

            // Import the convertMarkdownToSlackFormatting function
            const { convertMarkdownToSlackFormatting } = require('./formatter');

            // Get the content with a fallback for empty content
            let content = message.content || "I don't have a response at this time.";

            // Convert any Markdown formatting to Slack formatting
            content = convertMarkdownToSlackFormatting(content);

            // Create the response
            const aiResponse: AIResponse = {
                content,
                functionCalls,
                metadata: {
                    model: result.model,
                    finishReason: choice.finish_reason,
                },
            };

            logger.debug(`${logEmoji.ai} OpenRouter response: ${JSON.stringify({
                content: aiResponse.content.substring(0, 100) + (aiResponse.content.length > 100 ? '...' : ''),
                functionCalls: aiResponse.functionCalls ? `[${aiResponse.functionCalls.length} calls]` : 'none',
                metadata: aiResponse.metadata,
            })}`);

            return aiResponse;
        } catch (error) {
            logger.error(`${logEmoji.error} Error generating response from OpenRouter`, { error });
            throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Check if the provider supports function calling
     * 
     * @returns True if function calling is supported
     */
    public supportsFunctionCalling(): boolean {
        return true;
    }

    /**
     * Get available models from OpenRouter
     * 
     * @returns A promise resolving to an array of model information
     */
    public async getAvailableModels(): Promise<ModelInfo[]> {
        try {
            // In a production environment, you might want to fetch this from OpenRouter's API
            // For now, we'll use the static list
            return getAllModels();
        } catch (error) {
            logger.error(`${logEmoji.error} Error fetching available models from OpenRouter`, { error });
            throw new Error(`Failed to fetch available models: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
