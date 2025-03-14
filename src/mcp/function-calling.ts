/**
 * MCP Function Calling
 * 
 * This module implements function calling between the AI and MCP server.
 * It defines function schemas, handles function execution, and processes results.
 */

import { FunctionDefinition, FunctionCall } from '../ai/interfaces/provider';
import { mcpClient, MCPRequest, MCPResponse } from './client';
import { logger, logEmoji } from '../utils/logger';
import { SLACK_FUNCTIONS, handleSlackFunctionCall } from './slack-functions';
import { initializeFeatures } from '../slack/features';
import { app } from '../slack/app';

/**
 * Call Agent function definition
 * 
 * This is the main function that the AI can call to interact with the MCP server.
 */
export const CALL_AGENT_FUNCTION: FunctionDefinition = {
    name: 'callAgent',
    description: 'Call the MCP server to perform an action',
    parameters: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                description: 'The action to perform on the MCP server',
            },
            parameters: {
                type: 'object',
                description: 'Parameters for the action',
                additionalProperties: true,
            },
        },
        required: ['action', 'parameters'],
    },
};

/**
 * Get Sales Data function definition
 * 
 * Example function for retrieving sales data from the MCP server.
 */
export const GET_SALES_DATA_FUNCTION: FunctionDefinition = {
    name: 'getSalesData',
    description: 'Retrieve sales data for a specific timeframe',
    parameters: {
        type: 'object',
        properties: {
            timeframe: {
                type: 'string',
                description: 'The timeframe to retrieve data for (e.g., "Q1", "2023", "last_month")',
            },
            year: {
                type: 'number',
                description: 'The year to retrieve data for',
            },
            format: {
                type: 'string',
                description: 'The format of the data (e.g., "summary", "detailed")',
                enum: ['summary', 'detailed', 'chart'],
            },
        },
        required: ['timeframe'],
    },
};

/**
 * Get User Info function definition
 * 
 * Example function for retrieving user information from the MCP server.
 */
export const GET_USER_INFO_FUNCTION: FunctionDefinition = {
    name: 'getUserInfo',
    description: 'Retrieve information about a user',
    parameters: {
        type: 'object',
        properties: {
            userId: {
                type: 'string',
                description: 'The ID of the user to retrieve information for',
            },
            fields: {
                type: 'array',
                description: 'The fields to retrieve (e.g., "name", "email", "department")',
                items: {
                    type: 'string',
                },
            },
        },
        required: ['userId'],
    },
};

/**
 * Create Ticket function definition
 * 
 * Example function for creating a ticket in the MCP server.
 */
export const CREATE_TICKET_FUNCTION: FunctionDefinition = {
    name: 'createTicket',
    description: 'Create a new ticket in the ticketing system',
    parameters: {
        type: 'object',
        properties: {
            title: {
                type: 'string',
                description: 'The title of the ticket',
            },
            description: {
                type: 'string',
                description: 'The description of the ticket',
            },
            priority: {
                type: 'string',
                description: 'The priority of the ticket',
                enum: ['low', 'medium', 'high', 'critical'],
            },
            assignee: {
                type: 'string',
                description: 'The ID of the user to assign the ticket to',
            },
            dueDate: {
                type: 'string',
                description: 'The due date of the ticket in ISO format (YYYY-MM-DD)',
            },
        },
        required: ['title', 'description'],
    },
};

/**
 * All available functions
 */
export const AVAILABLE_FUNCTIONS: FunctionDefinition[] = [
    CALL_AGENT_FUNCTION,
    GET_SALES_DATA_FUNCTION,
    GET_USER_INFO_FUNCTION,
    CREATE_TICKET_FUNCTION,
    ...SLACK_FUNCTIONS,
];

/**
 * Initialize the function calling system
 */
export function initializeFunctionCalling(): void {
    // Initialize Slack features
    initializeFeatures(app);

    logger.info(`${logEmoji.mcp} Function calling system initialized with ${AVAILABLE_FUNCTIONS.length} available functions`);
}

/**
 * Function call handler
 * 
 * This function handles function calls from the AI and executes them on the MCP server
 * or routes them to the appropriate handler.
 * 
 * @param functionCall The function call from the AI
 * @returns Promise resolving to the result of the function call
 */
export async function handleFunctionCall(functionCall: FunctionCall): Promise<any> {
    try {
        logger.info(`${logEmoji.mcp} Handling function call: ${functionCall.name}`);

        // Handle the callAgent function
        if (functionCall.name === 'callAgent') {
            return handleCallAgentFunction(functionCall);
        }

        // Check if this is a Slack function
        const isSlackFunction = SLACK_FUNCTIONS.some(fn => fn.name === functionCall.name);
        if (isSlackFunction) {
            return handleSlackFunctionCall(functionCall);
        }

        // Handle other functions by mapping them to callAgent
        const mcpRequest: MCPRequest = {
            action: functionCall.name,
            parameters: functionCall.arguments,
        };

        return handleMCPRequest(mcpRequest);
    } catch (error) {
        logger.error(`${logEmoji.error} Error handling function call: ${functionCall.name}`, { error });
        return {
            error: `Failed to execute function: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Handle the callAgent function
 * 
 * @param functionCall The function call from the AI
 * @returns Promise resolving to the result of the function call
 */
async function handleCallAgentFunction(functionCall: FunctionCall): Promise<any> {
    try {
        const { action, parameters } = functionCall.arguments;

        if (!action || typeof action !== 'string') {
            throw new Error('Invalid action: action must be a string');
        }

        if (!parameters || typeof parameters !== 'object') {
            throw new Error('Invalid parameters: parameters must be an object');
        }

        const mcpRequest: MCPRequest = {
            action,
            parameters,
        };

        return handleMCPRequest(mcpRequest);
    } catch (error) {
        logger.error(`${logEmoji.error} Error handling callAgent function`, { error });
        return {
            error: `Failed to execute callAgent: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Handle an MCP request
 * 
 * @param request The MCP request
 * @returns Promise resolving to the result of the request
 */
async function handleMCPRequest(request: MCPRequest): Promise<any> {
    try {
        // Call the MCP server with retry logic
        const response = await mcpClient.callWithRetry(request);

        // Handle asynchronous operations
        if (response.status === 'pending' && response.operationId) {
            logger.info(`${logEmoji.mcp} MCP operation pending, waiting for completion: ${response.operationId}`);

            // Wait for the operation to complete
            const finalResponse = await mcpClient.waitForOperation(response.operationId);

            // Return the final response
            if (finalResponse.status === 'success') {
                return finalResponse.data || { success: true };
            } else {
                return {
                    error: finalResponse.error?.message || 'Unknown error',
                    code: finalResponse.error?.code,
                };
            }
        }

        // Handle immediate responses
        if (response.status === 'success') {
            return response.data || { success: true };
        } else {
            return {
                error: response.error?.message || 'Unknown error',
                code: response.error?.code,
            };
        }
    } catch (error) {
        logger.error(`${logEmoji.error} Error handling MCP request`, { error });
        return {
            error: `Failed to execute MCP request: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Format function call results for inclusion in AI responses
 * 
 * @param functionName The name of the function that was called
 * @param result The result of the function call
 * @returns Formatted result string
 */
export function formatFunctionCallResult(functionName: string, result: any): string {
    try {
        // Format error results
        if (result && result.error) {
            return `Error executing function ${functionName}: ${result.error}`;
        }

        // Format success results with a more user-friendly message
        let userFriendlyMessage = '';

        // Add a user-friendly message based on the function name and result
        if (result && result.success) {
            switch (functionName) {
                case 'createChannel':
                    userFriendlyMessage = `I've created the channel #${result.channelName} for you.`;
                    break;
                case 'inviteToChannel':
                    userFriendlyMessage = `I've invited ${result.invitedUsers?.length || 0} user(s) to the channel.`;
                    break;
                case 'archiveChannel':
                    userFriendlyMessage = `I've archived the channel as requested.`;
                    break;
                case 'sendMessage':
                    userFriendlyMessage = `I've sent your message to the channel.`;
                    break;
                case 'sendDirectMessage':
                    userFriendlyMessage = `I've sent your direct message to the user.`;
                    break;
                case 'uploadFile':
                    userFriendlyMessage = `I've uploaded the file ${result.fileName || 'to the channel'}.`;
                    break;
                case 'addReaction':
                    userFriendlyMessage = `I've added the ${result.reaction} reaction to the message.`;
                    break;
                case 'addReminder':
                    userFriendlyMessage = `I've set a reminder for the user.`;
                    break;
                case 'createChannelAndInviteUsers':
                    userFriendlyMessage = `I've created the channel #${result.channelName} and invited ${result.invitedUsers?.length || 0} user(s).`;
                    break;
                case 'sendMessageToMultipleChannels':
                    userFriendlyMessage = `I've sent your message to ${result.successCount} channel(s).`;
                    break;
                default:
                    // If the result has a message property, use that
                    if (result.message) {
                        userFriendlyMessage = result.message;
                    } else {
                        userFriendlyMessage = `I've successfully completed the ${functionName} action.`;
                    }
            }

            // Add the user-friendly message to the result
            result.message = userFriendlyMessage;
        }

        return `Function ${functionName} result: ${JSON.stringify(result, null, 2)}`;
    } catch (error) {
        logger.error(`${logEmoji.error} Error formatting function call result`, { error });
        return `Function ${functionName} result: [Error formatting result]`;
    }
}
