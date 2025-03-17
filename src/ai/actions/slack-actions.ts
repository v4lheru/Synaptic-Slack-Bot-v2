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
 * User-related actions
 */

/**
 * List users in the workspace
 * 
 * @param limit Maximum number of users to return
 * @returns Promise resolving to the list of users
 */
export async function listUsers(limit: number = 100): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to list users`);
        const features = getFeatures();
        const result = await features.users.listUsers(limit);
        return {
            success: true,
            users: result.members,
            message: `Successfully retrieved ${result.members?.length || 0} users`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error listing users`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Get user information
 * 
 * @param userId The ID of the user
 * @returns Promise resolving to the user information
 */
export async function getUserInfo(userId: string): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to get user info: ${userId}`);
        const features = getFeatures();
        const result = await features.users.getUserInfo(userId);
        return {
            success: true,
            user: result.user,
            message: `Successfully retrieved information for user ${result.user?.name || userId}`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error getting user info: ${userId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Look up a user by email address
 * 
 * @param email The email address to look up
 * @returns Promise resolving to the user information
 */
export async function lookupUserByEmail(email: string): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to look up user by email: ${email}`);
        const features = getFeatures();
        const result = await features.users.lookupUserByEmail(email);
        return {
            success: true,
            user: result.user,
            message: `Successfully found user ${result.user?.name || ''} with email ${email}`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error looking up user by email: ${email}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Admin-related actions
 */

/**
 * Invite users to a channel (admin level)
 * 
 * @param channelId The ID of the channel
 * @param userIds Array of user IDs to invite
 * @returns Promise resolving to the invite result
 */
export async function adminInviteUsersToChannel(channelId: string, userIds: string[]): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested admin invite users to channel: ${channelId}`);
        const features = getFeatures();

        // Ensure we have at least one user ID
        if (!userIds.length) {
            throw new Error('At least one user ID is required');
        }

        const result = await features.admin.inviteUsersToChannel(channelId, userIds);
        return {
            success: true,
            channelId,
            invitedUsers: userIds,
            message: `Successfully invited ${userIds.length} user(s) to channel (admin level)`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error admin inviting users to channel: ${channelId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Invite a user to the workspace
 * 
 * @param email The email address of the user to invite
 * @param channelIds Array of channel IDs to invite the user to
 * @param teamId The ID of the team (for Enterprise Grid)
 * @param customMessage Custom invitation message
 * @returns Promise resolving to the invite result
 */
export async function inviteUserToWorkspace(
    email: string,
    channelIds: string[] = [],
    teamId: string = '',
    customMessage?: string
): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to invite user to workspace: ${email}`);
        const features = getFeatures();
        const result = await features.admin.inviteUserToWorkspace(email, channelIds, teamId, customMessage);
        return {
            success: true,
            email,
            message: `Successfully invited ${email} to the workspace`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error inviting user to workspace: ${email}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Assign a user to a workspace
 * 
 * @param teamId The ID of the team to assign the user to
 * @param userId The ID of the user to assign
 * @returns Promise resolving to the assign result
 */
export async function assignUserToWorkspace(teamId: string, userId: string): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to assign user to workspace: ${userId} to ${teamId}`);
        const features = getFeatures();
        const result = await features.admin.assignUserToWorkspace(teamId, userId);
        return {
            success: true,
            teamId,
            userId,
            message: `Successfully assigned user ${userId} to workspace ${teamId}`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error assigning user to workspace: ${userId} to ${teamId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Search for channels (admin level)
 * 
 * @param query The search query
 * @param teamIds Array of team IDs to search in
 * @param limit Maximum number of results to return
 * @returns Promise resolving to the search result
 */
export async function searchChannels(
    query: string,
    teamIds?: string[],
    limit: number = 100
): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to search channels with query: ${query}`);
        const features = getFeatures();
        const result = await features.admin.searchChannels(query, teamIds, limit);
        return {
            success: true,
            channels: result.channels,
            message: `Successfully found ${result.channels?.length || 0} channels matching "${query}"`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error searching channels with query: ${query}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Archive a channel (admin level)
 * 
 * @param channelId The ID of the channel to archive
 * @returns Promise resolving to the archive result
 */
export async function adminArchiveChannel(channelId: string): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to archive channel (admin level): ${channelId}`);
        const features = getFeatures();
        const result = await features.admin.archiveChannel(channelId);
        return {
            success: true,
            channelId,
            message: `Successfully archived channel (admin level)`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error archiving channel (admin level): ${channelId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Unarchive a channel (admin level)
 * 
 * @param channelId The ID of the channel to unarchive
 * @returns Promise resolving to the unarchive result
 */
export async function unarchiveChannel(channelId: string): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to unarchive channel: ${channelId}`);
        const features = getFeatures();
        const result = await features.admin.unarchiveChannel(channelId);
        return {
            success: true,
            channelId,
            message: `Successfully unarchived channel`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error unarchiving channel: ${channelId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Search-related actions
 */

/**
 * Search for messages
 * 
 * @param query The search query
 * @param count Maximum number of results to return
 * @param sort Sort order (score or timestamp)
 * @param sortDir Sort direction (asc or desc)
 * @returns Promise resolving to the search result
 */
export async function searchMessages(
    query: string,
    count: number = 20,
    sort: 'score' | 'timestamp' = 'score',
    sortDir: 'asc' | 'desc' = 'desc'
): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to search messages with query: ${query}`);
        const features = getFeatures();
        const result = await features.search.searchMessages(query, count, sort, sortDir);
        return {
            success: true,
            messages: result.messages?.matches,
            total: result.messages?.total,
            message: `Successfully found ${result.messages?.total || 0} messages matching "${query}"`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error searching messages with query: ${query}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Bookmark-related actions
 */

/**
 * Add a bookmark to a channel
 * 
 * @param channelId The ID of the channel
 * @param title The title of the bookmark
 * @param link The URL of the bookmark
 * @param emoji Optional emoji for the bookmark
 * @returns Promise resolving to the add result
 */
export async function addBookmark(
    channelId: string,
    title: string,
    link: string,
    emoji?: string
): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to add bookmark to channel: ${channelId}`);
        const features = getFeatures();
        const result = await features.bookmarks.addBookmark(channelId, title, link, emoji);
        return {
            success: true,
            channelId,
            bookmarkId: result.bookmark?.id,
            message: `Successfully added bookmark "${title}" to channel`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error adding bookmark to channel: ${channelId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * List bookmarks in a channel
 * 
 * @param channelId The ID of the channel
 * @returns Promise resolving to the list of bookmarks
 */
export async function listBookmarks(channelId: string): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to list bookmarks in channel: ${channelId}`);
        const features = getFeatures();
        const result = await features.bookmarks.listBookmarks(channelId);
        return {
            success: true,
            channelId,
            bookmarks: result.bookmarks,
            message: `Successfully retrieved ${result.bookmarks?.length || 0} bookmarks from channel`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error listing bookmarks in channel: ${channelId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Message-related actions (additional)
 */

/**
 * Send an ephemeral message (only visible to a specific user)
 * 
 * @param channelId The ID of the channel
 * @param userId The ID of the user who will see the message
 * @param text The message text
 * @returns Promise resolving to the send result
 */
export async function sendEphemeralMessage(channelId: string, userId: string, text: string): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to send ephemeral message to user: ${userId} in channel: ${channelId}`);
        const features = getFeatures();
        const result = await features.messages.sendEphemeralMessage(channelId, userId, text);
        return {
            success: true,
            channelId,
            userId,
            message: `Successfully sent ephemeral message to user in channel`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error sending ephemeral message to user: ${userId} in channel: ${channelId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Schedule a message for future delivery
 * 
 * @param channelId The ID of the channel
 * @param text The message text
 * @param postAt Unix timestamp for when to send the message
 * @returns Promise resolving to the schedule result
 */
export async function scheduleMessage(channelId: string, text: string, postAt: number): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to schedule message in channel: ${channelId} for: ${new Date(postAt * 1000).toISOString()}`);
        const features = getFeatures();
        const result = await features.messages.scheduleMessage(channelId, text, postAt);
        return {
            success: true,
            channelId,
            scheduledMessageId: result.scheduled_message_id,
            postAt: postAt,
            message: `Successfully scheduled message for ${new Date(postAt * 1000).toISOString()}`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error scheduling message in channel: ${channelId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Get a permalink to a message
 * 
 * @param channelId The ID of the channel
 * @param messageTs The timestamp of the message
 * @returns Promise resolving to the permalink result
 */
export async function getMessagePermalink(channelId: string, messageTs: string): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to get permalink for message: ${messageTs} in channel: ${channelId}`);
        const features = getFeatures();
        const result = await features.messages.getMessagePermalink(channelId, messageTs);
        return {
            success: true,
            channelId,
            messageTs,
            permalink: result.permalink,
            message: `Successfully retrieved permalink for message`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error getting permalink for message: ${messageTs} in channel: ${channelId}`, { error });
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Get members of a channel
 * 
 * @param channelId The ID of the channel
 * @returns Promise resolving to the members result
 */
export async function getChannelMembers(channelId: string): Promise<any> {
    try {
        logger.info(`${logEmoji.ai} AI requested to get members for channel: ${channelId}`);
        const features = getFeatures();
        const result = await features.channels.getChannelMembers(channelId);
        return {
            success: true,
            channelId,
            members: result.members,
            message: `Successfully retrieved ${result.members?.length || 0} members from channel`
        };
    } catch (error) {
        logger.error(`${logEmoji.error} Error getting members for channel: ${channelId}`, { error });
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
