/**
 * Message Features
 * 
 * Implements features using the following permissions:
 * - chat:write
 * - chat:write.customize
 * - chat:write.public
 * - app_mentions:read
 * - channels:history
 * - groups:history
 * - im:history
 * - mpim:history
 * - metadata.message:read
 */

import { App } from '@slack/bolt';
import { logger, logEmoji } from '../../../utils/logger';
import { callSlackApi } from '../../utils/api';

export class MessageFeatures {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Send a message to a channel
     * 
     * @param channelId The ID of the channel
     * @param text The message text
     * @param blocks Optional Block Kit blocks
     * @param threadTs Optional thread timestamp to reply in a thread
     * @returns Promise resolving to the send result
     */
    async sendMessage(channelId: string, text: string, blocks?: any[], threadTs?: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Sending message to channel: ${channelId}`);
            const result = await callSlackApi(
                this.app,
                'chat.postMessage',
                {
                    channel: channelId,
                    text,
                    blocks,
                    thread_ts: threadTs
                }
            );
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error sending message to channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Send a message with a custom username and icon
     * 
     * @param channelId The ID of the channel
     * @param text The message text
     * @param username Custom username
     * @param iconUrl Custom icon URL
     * @param blocks Optional Block Kit blocks
     * @returns Promise resolving to the send result
     */
    async sendCustomMessage(
        channelId: string,
        text: string,
        username: string,
        iconUrl: string,
        blocks?: any[]
    ): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Sending custom message to channel: ${channelId}`);
            const result = await callSlackApi(
                this.app,
                'chat.postMessage',
                {
                    channel: channelId,
                    text,
                    blocks,
                    username,
                    icon_url: iconUrl
                }
            );
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error sending custom message to channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Send a message to a channel the bot isn't a member of
     * 
     * @param channelId The ID of the channel
     * @param text The message text
     * @param blocks Optional Block Kit blocks
     * @returns Promise resolving to the send result
     */
    async sendPublicMessage(channelId: string, text: string, blocks?: any[]): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Sending public message to channel: ${channelId}`);
            const result = await callSlackApi(
                this.app,
                'chat.postMessage',
                {
                    channel: channelId,
                    text,
                    blocks
                }
            );
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error sending public message to channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Update a message
     * 
     * @param channelId The ID of the channel
     * @param ts The timestamp of the message to update
     * @param text The new message text
     * @param blocks Optional new Block Kit blocks
     * @returns Promise resolving to the update result
     */
    async updateMessage(channelId: string, ts: string, text: string, blocks?: any[]): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Updating message in channel: ${channelId}`);
            const result = await callSlackApi(
                this.app,
                'chat.update',
                {
                    channel: channelId,
                    ts,
                    text,
                    blocks
                }
            );
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error updating message in channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Delete a message
     * 
     * @param channelId The ID of the channel
     * @param ts The timestamp of the message to delete
     * @returns Promise resolving to the delete result
     */
    async deleteMessage(channelId: string, ts: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Deleting message in channel: ${channelId}`);
            const result = await callSlackApi(
                this.app,
                'chat.delete',
                {
                    channel: channelId,
                    ts
                }
            );
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error deleting message in channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Send an ephemeral message (only visible to a specific user)
     * 
     * @param channelId The ID of the channel
     * @param userId The ID of the user who will see the message
     * @param text The message text
     * @param blocks Optional Block Kit blocks
     * @returns Promise resolving to the send result
     */
    async sendEphemeralMessage(channelId: string, userId: string, text: string, blocks?: any[]): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Sending ephemeral message to user: ${userId} in channel: ${channelId}`);
            const result = await callSlackApi(
                this.app,
                'chat.postEphemeral',
                {
                    channel: channelId,
                    user: userId,
                    text,
                    blocks
                }
            );
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error sending ephemeral message to user: ${userId} in channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Schedule a message for future delivery
     * 
     * @param channelId The ID of the channel
     * @param text The message text
     * @param postAt Unix timestamp for when to send the message
     * @param blocks Optional Block Kit blocks
     * @returns Promise resolving to the schedule result
     */
    async scheduleMessage(channelId: string, text: string, postAt: number, blocks?: any[]): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Scheduling message in channel: ${channelId} for: ${new Date(postAt * 1000).toISOString()}`);
            const result = await callSlackApi(
                this.app,
                'chat.scheduleMessage',
                {
                    channel: channelId,
                    text,
                    post_at: postAt,
                    blocks
                }
            );
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error scheduling message in channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Get a permalink to a message
     * 
     * @param channelId The ID of the channel
     * @param messageTs The timestamp of the message
     * @returns Promise resolving to the permalink result
     */
    async getMessagePermalink(channelId: string, messageTs: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Getting permalink for message: ${messageTs} in channel: ${channelId}`);
            const result = await callSlackApi(
                this.app,
                'chat.getPermalink',
                {
                    channel: channelId,
                    message_ts: messageTs
                }
            );
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error getting permalink for message: ${messageTs} in channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Get conversation history
     * 
     * @param channelId The ID of the channel
     * @param limit Maximum number of messages to return
     * @param latest End of time range
     * @param oldest Start of time range
     * @returns Promise resolving to the conversation history
     */
    async getConversationHistory(
        channelId: string,
        limit: number = 100,
        latest?: string,
        oldest?: string
    ): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Getting conversation history for channel: ${channelId}`);
            const result = await callSlackApi(
                this.app,
                'conversations.history',
                {
                    channel: channelId,
                    limit,
                    latest,
                    oldest
                }
            );
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error getting conversation history for channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Get replies in a thread
     * 
     * @param channelId The ID of the channel
     * @param ts The timestamp of the parent message
     * @param limit Maximum number of messages to return
     * @returns Promise resolving to the thread replies
     */
    async getThreadReplies(channelId: string, ts: string, limit: number = 100): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Getting thread replies for message: ${ts} in channel: ${channelId}`);
            const result = await callSlackApi(
                this.app,
                'conversations.replies',
                {
                    channel: channelId,
                    ts,
                    limit
                }
            );
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error getting thread replies for message: ${ts} in channel: ${channelId}`, { error });
            throw error;
        }
    }
}
