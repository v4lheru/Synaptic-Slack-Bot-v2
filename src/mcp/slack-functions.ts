/**
 * Slack Function Definitions
 * 
 * This module defines function schemas for Slack-related actions that the AI can call.
 * These functions are integrated with the Slack features and actions.
 */

import { FunctionDefinition, FunctionCall } from '../ai/interfaces/provider';
import { logger, logEmoji } from '../utils/logger';
import * as slackActions from '../ai/actions/slack-actions';

/**
 * Create Channel function definition
 */
export const CREATE_CHANNEL_FUNCTION: FunctionDefinition = {
    name: 'createChannel',
    description: 'Create a new Slack channel',
    parameters: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                description: 'The name of the channel to create (lowercase, no spaces, use hyphens)',
            },
            isPrivate: {
                type: 'boolean',
                description: 'Whether the channel should be private',
            },
        },
        required: ['name'],
    },
};

/**
 * Invite to Channel function definition
 */
export const INVITE_TO_CHANNEL_FUNCTION: FunctionDefinition = {
    name: 'inviteToChannel',
    description: 'Invite users to a Slack channel',
    parameters: {
        type: 'object',
        properties: {
            channelId: {
                type: 'string',
                description: 'The ID of the channel to invite users to',
            },
            userIds: {
                type: 'array',
                description: 'Array of user IDs to invite',
                items: {
                    type: 'string',
                },
            },
        },
        required: ['channelId', 'userIds'],
    },
};

/**
 * Archive Channel function definition
 */
export const ARCHIVE_CHANNEL_FUNCTION: FunctionDefinition = {
    name: 'archiveChannel',
    description: 'Archive a Slack channel',
    parameters: {
        type: 'object',
        properties: {
            channelId: {
                type: 'string',
                description: 'The ID of the channel to archive',
            },
        },
        required: ['channelId'],
    },
};

/**
 * Send Message function definition
 */
export const SEND_MESSAGE_FUNCTION: FunctionDefinition = {
    name: 'sendMessage',
    description: 'Send a message to a Slack channel',
    parameters: {
        type: 'object',
        properties: {
            channelId: {
                type: 'string',
                description: 'The ID of the channel to send the message to',
            },
            text: {
                type: 'string',
                description: 'The message text',
            },
            threadTs: {
                type: 'string',
                description: 'Optional thread timestamp to reply in a thread',
            },
        },
        required: ['channelId', 'text'],
    },
};

/**
 * Send Direct Message function definition
 */
export const SEND_DM_FUNCTION: FunctionDefinition = {
    name: 'sendDirectMessage',
    description: 'Send a direct message to a Slack user',
    parameters: {
        type: 'object',
        properties: {
            userId: {
                type: 'string',
                description: 'The ID of the user to send the message to',
            },
            text: {
                type: 'string',
                description: 'The message text',
            },
        },
        required: ['userId', 'text'],
    },
};

/**
 * Upload File function definition
 */
export const UPLOAD_FILE_FUNCTION: FunctionDefinition = {
    name: 'uploadFile',
    description: 'Upload a file to a Slack channel',
    parameters: {
        type: 'object',
        properties: {
            channelId: {
                type: 'string',
                description: 'The ID of the channel to upload the file to',
            },
            fileContent: {
                type: 'string',
                description: 'The file content as a string',
            },
            filename: {
                type: 'string',
                description: 'The filename',
            },
            initialComment: {
                type: 'string',
                description: 'Optional initial comment',
            },
        },
        required: ['channelId', 'fileContent', 'filename'],
    },
};

/**
 * Add Reaction function definition
 */
export const ADD_REACTION_FUNCTION: FunctionDefinition = {
    name: 'addReaction',
    description: 'Add a reaction to a Slack message',
    parameters: {
        type: 'object',
        properties: {
            channelId: {
                type: 'string',
                description: 'The ID of the channel',
            },
            messageTs: {
                type: 'string',
                description: 'The timestamp of the message',
            },
            reaction: {
                type: 'string',
                description: 'The name of the reaction (emoji)',
            },
        },
        required: ['channelId', 'messageTs', 'reaction'],
    },
};

/**
 * Add Reminder function definition
 */
export const ADD_REMINDER_FUNCTION: FunctionDefinition = {
    name: 'addReminder',
    description: 'Add a reminder for a Slack user',
    parameters: {
        type: 'object',
        properties: {
            text: {
                type: 'string',
                description: 'The reminder text',
            },
            time: {
                type: 'string',
                description: 'The time for the reminder (Unix timestamp or natural language like "in 5 minutes")',
            },
            userId: {
                type: 'string',
                description: 'The ID of the user to remind',
            },
        },
        required: ['text', 'time', 'userId'],
    },
};

/**
 * Create Channel and Invite Users function definition
 */
export const CREATE_CHANNEL_AND_INVITE_FUNCTION: FunctionDefinition = {
    name: 'createChannelAndInviteUsers',
    description: 'Create a new Slack channel and invite users to it',
    parameters: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                description: 'The name of the channel to create (lowercase, no spaces, use hyphens)',
            },
            userIds: {
                type: 'array',
                description: 'Array of user IDs to invite',
                items: {
                    type: 'string',
                },
            },
            isPrivate: {
                type: 'boolean',
                description: 'Whether the channel should be private',
            },
        },
        required: ['name', 'userIds'],
    },
};

/**
 * Send Message to Multiple Channels function definition
 */
export const SEND_MESSAGE_TO_MULTIPLE_CHANNELS_FUNCTION: FunctionDefinition = {
    name: 'sendMessageToMultipleChannels',
    description: 'Send a message to multiple Slack channels',
    parameters: {
        type: 'object',
        properties: {
            channelIds: {
                type: 'array',
                description: 'Array of channel IDs',
                items: {
                    type: 'string',
                },
            },
            text: {
                type: 'string',
                description: 'The message text',
            },
        },
        required: ['channelIds', 'text'],
    },
};

/**
 * All available Slack functions
 */
export const SLACK_FUNCTIONS: FunctionDefinition[] = [
    CREATE_CHANNEL_FUNCTION,
    INVITE_TO_CHANNEL_FUNCTION,
    ARCHIVE_CHANNEL_FUNCTION,
    SEND_MESSAGE_FUNCTION,
    SEND_DM_FUNCTION,
    UPLOAD_FILE_FUNCTION,
    ADD_REACTION_FUNCTION,
    ADD_REMINDER_FUNCTION,
    CREATE_CHANNEL_AND_INVITE_FUNCTION,
    SEND_MESSAGE_TO_MULTIPLE_CHANNELS_FUNCTION,
];

/**
 * Handle Slack function calls
 * 
 * @param functionCall The function call from the AI
 * @returns Promise resolving to the result of the function call
 */
export async function handleSlackFunctionCall(functionCall: FunctionCall): Promise<any> {
    try {
        logger.info(`${logEmoji.slack} Handling Slack function call: ${functionCall.name}`);

        // Check if the function exists in slackActions
        const actionFunction = (slackActions as any)[functionCall.name];

        if (typeof actionFunction !== 'function') {
            throw new Error(`Unknown Slack function: ${functionCall.name}`);
        }

        // Call the function with the arguments
        return await actionFunction(...Object.values(functionCall.arguments));
    } catch (error) {
        logger.error(`${logEmoji.error} Error handling Slack function call: ${functionCall.name}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
