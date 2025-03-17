/**
 * API Handler
 * 
 * This module implements the HTTP API endpoint for Slack bot automation.
 * It handles authentication, request processing, and response formatting.
 */

import { Request, Response } from 'express';
import { env } from '../config/environment';
import { logger, logEmoji } from '../utils/logger';
import { OpenRouterClient } from '../ai/openrouter/client';
import { ApiRequest, ApiResponse, ApiErrorResponse, ApiErrorCode, FunctionResult } from './types';
import { AVAILABLE_FUNCTIONS, handleFunctionCall } from '../mcp/function-calling';
import { ConversationMessage, MessageRole } from '../ai/interfaces/provider';

// Create an instance of the OpenRouter client
const aiClient = new OpenRouterClient();

// Rate limiting map to track requests by IP
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

/**
 * Process a message from the API
 * 
 * This is the main handler for the API endpoint.
 * 
 * @param req The HTTP request
 * @param res The HTTP response
 */
export async function processApiMessage(req: Request, res: Response): Promise<void> {
    try {
        // Get client IP for rate limiting
        const clientIp = req.headers['x-forwarded-for'] ||
            req.socket.remoteAddress ||
            'unknown';

        // Check if API endpoint is enabled
        if (!env.ENABLE_API_ENDPOINT) {
            logger.warn(`${logEmoji.api} API request rejected: API endpoint is disabled`);
            const errorResponse: ApiErrorResponse = {
                success: false,
                error: {
                    code: ApiErrorCode.API_DISABLED,
                    message: 'API endpoint is disabled'
                }
            };
            res.status(403).json(errorResponse);
            return;
        }

        // Validate API key
        const apiKey = req.headers['x-api-key'];
        if (!apiKey || apiKey !== env.API_KEY) {
            logger.warn(`${logEmoji.api} API request rejected: Invalid API key from ${clientIp}`);
            const errorResponse: ApiErrorResponse = {
                success: false,
                error: {
                    code: ApiErrorCode.AUTHENTICATION_FAILED,
                    message: 'Invalid API key'
                }
            };
            res.status(401).json(errorResponse);
            return;
        }

        // Check rate limit
        if (!checkRateLimit(clientIp.toString(), res)) {
            return;
        }

        // Parse and validate request body
        const requestBody = req.body as ApiRequest;
        if (!requestBody || !requestBody.message) {
            logger.warn(`${logEmoji.api} API request rejected: Missing required field 'message'`);
            const errorResponse: ApiErrorResponse = {
                success: false,
                error: {
                    code: ApiErrorCode.MISSING_REQUIRED_FIELD,
                    message: 'Missing required field: message'
                }
            };
            res.status(400).json(errorResponse);
            return;
        }

        // Start timing for performance monitoring
        const startTime = Date.now();

        // Process the message and generate a response
        logger.info(`${logEmoji.api} Processing API request: "${requestBody.message.substring(0, 50)}${requestBody.message.length > 50 ? '...' : ''}"`);
        const result = await processMessageAndGenerateApiResponse(requestBody);

        // Calculate processing time
        const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);

        // Add processing time to metadata
        if (result.metadata) {
            result.metadata.processingTime = `${processingTime}s`;
        } else {
            result.metadata = {
                model: 'unknown',
                processingTime: `${processingTime}s`
            };
        }

        // Send the response
        res.status(200).json(result);

        // Log the successful request
        logger.info(`${logEmoji.api} API request processed successfully in ${processingTime}s`);
    } catch (error) {
        // Log the error
        logger.error(`${logEmoji.error} Error processing API request`, { error });

        // Send an error response
        const errorResponse: ApiErrorResponse = {
            success: false,
            error: {
                code: ApiErrorCode.INTERNAL_ERROR,
                message: 'An internal error occurred while processing the request'
            }
        };
        res.status(500).json(errorResponse);
    }
}

/**
 * Check if a request exceeds the rate limit
 * 
 * @param clientIp The client IP address
 * @param res The HTTP response
 * @returns True if the request is within the rate limit, false otherwise
 */
function checkRateLimit(clientIp: string, res: Response): boolean {
    // Get the current time
    const now = Date.now();

    // Get the rate limit for this client
    let rateLimit = rateLimitMap.get(clientIp);

    // If this is the first request or the reset time has passed, initialize the rate limit
    if (!rateLimit || rateLimit.resetTime < now) {
        rateLimit = {
            count: 1,
            resetTime: now + 60000 // Reset after 1 minute
        };
        rateLimitMap.set(clientIp, rateLimit);
        return true;
    }

    // Increment the request count
    rateLimit.count++;

    // Check if the request count exceeds the rate limit
    if (rateLimit.count > env.API_RATE_LIMIT) {
        logger.warn(`${logEmoji.api} API request rejected: Rate limit exceeded for ${clientIp}`);

        // Calculate time until reset
        const resetInSeconds = Math.ceil((rateLimit.resetTime - now) / 1000);

        // Send rate limit exceeded response
        const errorResponse: ApiErrorResponse = {
            success: false,
            error: {
                code: ApiErrorCode.RATE_LIMIT_EXCEEDED,
                message: `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`
            }
        };

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', env.API_RATE_LIMIT.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', Math.floor(rateLimit.resetTime / 1000).toString());

        // Send the response
        res.status(429).json(errorResponse);
        return false;
    }

    // Update the rate limit in the map
    rateLimitMap.set(clientIp, rateLimit);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', env.API_RATE_LIMIT.toString());
    res.setHeader('X-RateLimit-Remaining', (env.API_RATE_LIMIT - rateLimit.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.floor(rateLimit.resetTime / 1000).toString());

    return true;
}

/**
 * Process a message and generate an API response
 * 
 * This function adapts the existing message processing logic to work with API requests.
 * 
 * @param request The API request
 * @returns Promise resolving to the API response
 */
async function processMessageAndGenerateApiResponse(request: ApiRequest): Promise<ApiResponse> {
    try {
        // Create a minimal conversation history with just a system message and the user message
        const systemMessage: ConversationMessage = {
            role: 'system' as MessageRole,
            content: 'You are a helpful assistant that can perform actions in Slack.',
            timestamp: new Date().toISOString()
        };

        const userMessage: ConversationMessage = {
            role: 'user' as MessageRole,
            content: request.message,
            timestamp: new Date().toISOString()
        };

        const minimalHistory: ConversationMessage[] = [systemMessage, userMessage];

        // Generate a response from the AI
        const aiResponse = await aiClient.generateResponse(
            request.message,
            minimalHistory,
            AVAILABLE_FUNCTIONS
        );

        // Initialize the response
        const apiResponse: ApiResponse = {
            success: true,
            results: [],
            response: aiResponse.content,
            metadata: {
                model: aiResponse.metadata?.model || 'unknown',
                processingTime: '0.0s' // Will be updated later
            }
        };

        // Process function calls if present
        if (aiResponse.functionCalls && aiResponse.functionCalls.length > 0) {
            const functionResults: FunctionResult[] = [];

            for (const functionCall of aiResponse.functionCalls) {
                try {
                    logger.info(`${logEmoji.api} Executing function ${functionCall.name} from API request`);

                    // Execute the function call
                    const result = await handleFunctionCall(functionCall);

                    // Add to results
                    functionResults.push({
                        functionName: functionCall.name,
                        result
                    });

                    logger.debug(`${logEmoji.api} Function ${functionCall.name} result: ${JSON.stringify(result)}`);
                } catch (error) {
                    // Log the error
                    logger.error(`${logEmoji.error} Error executing function ${functionCall.name}`, { error });

                    // Add error result
                    functionResults.push({
                        functionName: functionCall.name,
                        result: {
                            success: false,
                            error: error instanceof Error ? error.message : String(error)
                        }
                    });
                }
            }

            // Add function results to the response
            apiResponse.results = functionResults;
        }

        return apiResponse;
    } catch (error) {
        // Log the error
        logger.error(`${logEmoji.error} Error generating API response`, { error });

        // Return an error response
        throw error;
    }
}
