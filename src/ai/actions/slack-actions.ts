/**
 * Slack Actions
 * 
 * This module defines functions that the AI can call to perform actions in Slack.
 * It serves as the "brains" that can understand user requests and execute the appropriate actions.
 */

import { getFeatures, SlackFeatures } from '../../slack/features';
import { logger, logEmoji } from '../../utils/logger';

/**
 * Channel-related actions
 */

/**
 * Create a new channel
 * 
 * @param name The name of the channel to create
 * @param isPrivate Whether the channel should be private
 * @returns Promise resolving to the creation result
 */
export async function createChannel(name: string, isPrivate: boolean = false): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to create channel: ${name}`);
        const features = getFeatures();
        const result = await features.channels.createChannel(name, isPrivate);
        return {
            success: true,
            channelId: result.channel?.id,
            channelName: result.channel?.name,
            message: `Successfully created ${isPrivate ? 'private' : 'public'} channel #${result.channel?.name}`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error creating channel: ${name}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Invite users to a channel
 * 
 * @param channelId The ID of the channel
 * @param userIds Array of user IDs to invite
 * @returns Promise resolving to the invite result
 */
export async function inviteToChannel(channelId: string, userIds: string[]): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to invite users to channel: ${channelId}`);
        const features = getFeatures();
        const result = await features.channels.inviteToChannel(channelId, userIds);
        return {
            success: true,
            channelId: result.channel?.id,
            channelName: result.channel?.name,
            invitedUsers: userIds,
            message: `Successfully invited ${userIds.length} user(s) to channel`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error inviting users to channel: ${channelId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Archive a channel
 * 
 * @param channelId The ID of the channel to archive
 * @returns Promise resolving to the archive result
 */
export async function archiveChannel(channelId: string): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to archive channel: ${channelId}`);
        const features = getFeatures();
        const result = await features.channels.archiveChannel(channelId);
        return {
            success: true,
            channelId,
            message: `Successfully archived channel`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error archiving channel: ${channelId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Message-related actions
 */

/**
 * Send a message to a channel
 * 
 * @param channelId The ID of the channel
 * @param text The message text
 * @param threadTs Optional thread timestamp to reply in a thread
 * @returns Promise resolving to the send result
 */
export async function sendMessage(channelId: string, text: string, threadTs?: string): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to send message to channel: ${channelId}`);
        const features = getFeatures();
        const result = await features.messages.sendMessage(channelId, text, undefined, threadTs);
        return {
            success: true,
            channelId,
            messageTs: result.ts,
            message: `Successfully sent message to channel`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error sending message to channel: ${channelId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Send a direct message to a user
 * 
 * @param userId The ID of the user
 * @param text The message text
 * @returns Promise resolving to the send result
 */
export async function sendDirectMessage(userId: string, text: string): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to send direct message to user: ${userId}`);
        const features = getFeatures();
        const result = await features.directMessages.sendDirectMessage(userId, text);
        return {
            success: true,
            userId,
            channelId: result.channel,
            messageTs: result.ts,
            message: `Successfully sent direct message to user`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error sending direct message to user: ${userId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * File-related actions
 */

/**
 * Upload a file to a channel
 * 
 * @param channelId The ID of the channel
 * @param fileContent The file content as a string
 * @param filename The filename
 * @param initialComment Optional initial comment
 * @returns Promise resolving to the upload result
 */
export async function uploadFile(
    channelId: string,
    fileContent: string,
    filename: string,
    initialComment?: string
): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to upload file to channel: ${channelId}`);
        const features = getFeatures();
        const result = await features.files.uploadFile(channelId, fileContent, filename, initialComment);
        return {
            success: true,
            channelId,
            fileId: result.file?.id,
            fileName: result.file?.name,
            message: `Successfully uploaded file ${filename} to channel`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error uploading file to channel: ${channelId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Reaction-related actions
 */

/**
 * Add a reaction to a message
 * 
 * @param channelId The ID of the channel
 * @param messageTs The timestamp of the message
 * @param reaction The name of the reaction (emoji)
 * @returns Promise resolving to the add result
 */
export async function addReaction(channelId: string, messageTs: string, reaction: string): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to add reaction to message: ${messageTs} in channel: ${channelId}`);
        const features = getFeatures();
        const result = await features.reactions.addReaction(channelId, messageTs, reaction);
        return {
            success: true,
            channelId,
            messageTs,
            reaction,
            message: `Successfully added reaction ${reaction} to message`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error adding reaction to message: ${messageTs} in channel: ${channelId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Reminder-related actions
 */

/**
 * Add a reminder for a user
 * 
 * @param text The reminder text
 * @param time The time for the reminder (Unix timestamp or natural language like "in 5 minutes")
 * @param userId The ID of the user to remind
 * @returns Promise resolving to the add result
 */
export async function addReminder(text: string, time: string | number, userId: string): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to add reminder for user: ${userId}`);
        const features = getFeatures();
        const result = await features.reminders.addReminder(text, time, userId);
        return {
            success: true,
            userId,
            reminderId: result.reminder?.id,
            text: result.reminder?.text,
            time: result.reminder?.time,
            message: `Successfully added reminder for user`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error adding reminder for user: ${userId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Complex actions that combine multiple operations
 */

/**
 * Create a channel and invite users
 * 
 * @param name The name of the channel to create
 * @param userIds Array of user IDs to invite
 * @param isPrivate Whether the channel should be private
 * @returns Promise resolving to the result
 */
export async function createChannelAndInviteUsers(
    name: string,
    userIds: string[],
    isPrivate: boolean = false
): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to create channel and invite users: ${name}`);

        // Create the channel
        const createResult = await createChannel(name, isPrivate);
        if (!createResult.success) {
            return createResult;
        }

        // Invite users to the channel
        const channelId = createResult.channelId;
        const inviteResult = await inviteToChannel(channelId, userIds);

        return {
            success: true,
            channelId,
            channelName: createResult.channelName,
            invitedUsers: userIds,
            message: `Successfully created channel #${createResult.channelName} and invited ${userIds.length} user(s)`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error creating channel and inviting users: ${name}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Send a message to multiple channels
 * 
 * @param channelIds Array of channel IDs
 * @param text The message text
 * @returns Promise resolving to the result
 */
export async function sendMessageToMultipleChannels(channelIds: string[], text: string): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to send message to multiple channels`);

        const results = [];
        const failures = [];

        for (const channelId of channelIds) {
            try {
                const result = await sendMessage(channelId, text);
                if (result.success) {
                    results.push({
                        channelId,
                        messageTs: result.messageTs
                    });
                } else {
                    failures.push({
                        channelId,
                        error: result.error
                    });
                }
            } catch (error) {
                failures.push({
                    channelId,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        return {
            success: failures.length === 0,
            successCount: results.length,
            failureCount: failures.length,
            results,
            failures,
            message: `Successfully sent message to ${results.length} channel(s)${failures.length > 0 ? `, failed for ${failures.length} channel(s)` : ''}`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error sending message to multiple channels`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
