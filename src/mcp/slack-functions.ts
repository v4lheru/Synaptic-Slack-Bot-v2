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
 * Get Channel Members function definition
 */
export const GET_CHANNEL_MEMBERS_FUNCTION: FunctionDefinition = {
    name: 'getChannelMembers',
    description: 'Get members of a Slack channel',
    parameters: {
        type: 'object',
        properties: {
            channelId: {
                type: 'string',
                description: 'The ID of the channel',
            },
        },
        required: ['channelId'],
    },
};

/**
 * List Users function definition
 */
export const LIST_USERS_FUNCTION: FunctionDefinition = {
    name: 'listUsers',
    description: 'List users in the Slack workspace',
    parameters: {
        type: 'object',
        properties: {
            limit: {
                type: 'number',
                description: 'Maximum number of users to return',
            },
        },
        required: [],
    },
};

/**
 * Get User Info function definition
 */
export const GET_USER_INFO_FUNCTION: FunctionDefinition = {
    name: 'getUserInfo',
    description: 'Get information about a Slack user',
    parameters: {
        type: 'object',
        properties: {
            userId: {
                type: 'string',
                description: 'The ID of the user',
            },
        },
        required: ['userId'],
    },
};

/**
 * Lookup User By Email function definition
 */
export const LOOKUP_USER_BY_EMAIL_FUNCTION: FunctionDefinition = {
    name: 'lookupUserByEmail',
    description: 'Look up a Slack user by email address',
    parameters: {
        type: 'object',
        properties: {
            email: {
                type: 'string',
                description: 'The email address to look up',
            },
        },
        required: ['email'],
    },
};

/**
 * Admin Invite Users To Channel function definition
 */
export const ADMIN_INVITE_USERS_TO_CHANNEL_FUNCTION: FunctionDefinition = {
    name: 'adminInviteUsersToChannel',
    description: 'Invite users to a Slack channel (admin level)',
    parameters: {
        type: 'object',
        properties: {
            channelId: {
                type: 'string',
                description: 'The ID of the channel',
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
 * Invite User To Workspace function definition
 */
export const INVITE_USER_TO_WORKSPACE_FUNCTION: FunctionDefinition = {
    name: 'inviteUserToWorkspace',
    description: 'Invite a user to the Slack workspace',
    parameters: {
        type: 'object',
        properties: {
            email: {
                type: 'string',
                description: 'The email address of the user to invite',
            },
            channelIds: {
                type: 'array',
                description: 'Array of channel IDs to invite the user to',
                items: {
                    type: 'string',
                },
            },
            teamId: {
                type: 'string',
                description: 'The ID of the team (for Enterprise Grid)',
            },
            customMessage: {
                type: 'string',
                description: 'Custom invitation message',
            },
        },
        required: ['email'],
    },
};

/**
 * Assign User To Workspace function definition
 */
export const ASSIGN_USER_TO_WORKSPACE_FUNCTION: FunctionDefinition = {
    name: 'assignUserToWorkspace',
    description: 'Assign a user to a Slack workspace',
    parameters: {
        type: 'object',
        properties: {
            teamId: {
                type: 'string',
                description: 'The ID of the team to assign the user to',
            },
            userId: {
                type: 'string',
                description: 'The ID of the user to assign',
            },
        },
        required: ['teamId', 'userId'],
    },
};

/**
 * Search Channels function definition
 */
export const SEARCH_CHANNELS_FUNCTION: FunctionDefinition = {
    name: 'searchChannels',
    description: 'Search for Slack channels',
    parameters: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'The search query',
            },
            teamIds: {
                type: 'array',
                description: 'Array of team IDs to search in',
                items: {
                    type: 'string',
                },
            },
            limit: {
                type: 'number',
                description: 'Maximum number of results to return',
            },
        },
        required: ['query'],
    },
};

/**
 * Admin Archive Channel function definition
 */
export const ADMIN_ARCHIVE_CHANNEL_FUNCTION: FunctionDefinition = {
    name: 'adminArchiveChannel',
    description: 'Archive a Slack channel (admin level)',
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
 * Unarchive Channel function definition
 */
export const UNARCHIVE_CHANNEL_FUNCTION: FunctionDefinition = {
    name: 'unarchiveChannel',
    description: 'Unarchive a Slack channel',
    parameters: {
        type: 'object',
        properties: {
            channelId: {
                type: 'string',
                description: 'The ID of the channel to unarchive',
            },
        },
        required: ['channelId'],
    },
};

/**
 * Search Messages function definition
 */
export const SEARCH_MESSAGES_FUNCTION: FunctionDefinition = {
    name: 'searchMessages',
    description: 'Search for messages in Slack',
    parameters: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'The search query',
            },
            count: {
                type: 'number',
                description: 'Maximum number of results to return',
            },
            sort: {
                type: 'string',
                description: 'Sort order (score or timestamp)',
                enum: ['score', 'timestamp'],
            },
            sortDir: {
                type: 'string',
                description: 'Sort direction (asc or desc)',
                enum: ['asc', 'desc'],
            },
        },
        required: ['query'],
    },
};

/**
 * Add Bookmark function definition
 */
export const ADD_BOOKMARK_FUNCTION: FunctionDefinition = {
    name: 'addBookmark',
    description: 'Add a bookmark to a Slack channel',
    parameters: {
        type: 'object',
        properties: {
            channelId: {
                type: 'string',
                description: 'The ID of the channel',
            },
            title: {
                type: 'string',
                description: 'The title of the bookmark',
            },
            link: {
                type: 'string',
                description: 'The URL of the bookmark',
            },
            emoji: {
                type: 'string',
                description: 'Optional emoji for the bookmark',
            },
        },
        required: ['channelId', 'title', 'link'],
    },
};

/**
 * List Bookmarks function definition
 */
export const LIST_BOOKMARKS_FUNCTION: FunctionDefinition = {
    name: 'listBookmarks',
    description: 'List bookmarks in a Slack channel',
    parameters: {
        type: 'object',
        properties: {
            channelId: {
                type: 'string',
                description: 'The ID of the channel',
            },
        },
        required: ['channelId'],
    },
};

/**
 * Send Ephemeral Message function definition
 */
export const SEND_EPHEMERAL_MESSAGE_FUNCTION: FunctionDefinition = {
    name: 'sendEphemeralMessage',
    description: 'Send an ephemeral message (only visible to a specific user)',
    parameters: {
        type: 'object',
        properties: {
            channelId: {
                type: 'string',
                description: 'The ID of the channel',
            },
            userId: {
                type: 'string',
                description: 'The ID of the user who will see the message',
            },
            text: {
                type: 'string',
                description: 'The message text',
            },
        },
        required: ['channelId', 'userId', 'text'],
    },
};

/**
 * Schedule Message function definition
 */
export const SCHEDULE_MESSAGE_FUNCTION: FunctionDefinition = {
    name: 'scheduleMessage',
    description: 'Schedule a message for future delivery',
    parameters: {
        type: 'object',
        properties: {
            channelId: {
                type: 'string',
                description: 'The ID of the channel',
            },
            text: {
                type: 'string',
                description: 'The message text',
            },
            postAt: {
                type: 'number',
                description: 'Unix timestamp for when to send the message',
            },
        },
        required: ['channelId', 'text', 'postAt'],
    },
};

/**
 * Get Message Permalink function definition
 */
export const GET_MESSAGE_PERMALINK_FUNCTION: FunctionDefinition = {
    name: 'getMessagePermalink',
    description: 'Get a permalink to a Slack message',
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
        },
        required: ['channelId', 'messageTs'],
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
    GET_CHANNEL_MEMBERS_FUNCTION,
    LIST_USERS_FUNCTION,
    GET_USER_INFO_FUNCTION,
    LOOKUP_USER_BY_EMAIL_FUNCTION,
    ADMIN_INVITE_USERS_TO_CHANNEL_FUNCTION,
    INVITE_USER_TO_WORKSPACE_FUNCTION,
    ASSIGN_USER_TO_WORKSPACE_FUNCTION,
    SEARCH_CHANNELS_FUNCTION,
    ADMIN_ARCHIVE_CHANNEL_FUNCTION,
    UNARCHIVE_CHANNEL_FUNCTION,
    SEARCH_MESSAGES_FUNCTION,
    ADD_BOOKMARK_FUNCTION,
    LIST_BOOKMARKS_FUNCTION,
    SEND_EPHEMERAL_MESSAGE_FUNCTION,
    SCHEDULE_MESSAGE_FUNCTION,
    GET_MESSAGE_PERMALINK_FUNCTION,
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
