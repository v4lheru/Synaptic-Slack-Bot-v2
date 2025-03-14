/**
 * Direct Message Features
 * 
 * Implements features using the following permissions:
 * - im:read
 * - im:write
 * - im:history
 */

import { App } from '@slack/bolt';
import { logger, logEmoji } from '../../../utils/logger';

export class DirectMessageFeatures {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Open a direct message with a user
     * 
     * @param userId The ID of the user
     * @returns Promise resolving to the open result
     */
    async openDirectMessage(userId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Opening direct message with user: ${userId}`);
            const result = await this.app.client.conversations.open({
                users: userId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error opening direct message with user: ${userId}`, { error });
            throw error;
        }
    }

    /**
     * List direct messages
     * 
     * @param limit Maximum number of direct messages to return
     * @returns Promise resolving to the list of direct messages
     */
    async listDirectMessages(limit: number = 100): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Listing direct messages`);
            const result = await this.app.client.conversations.list({
                limit,
                types: 'im'
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error listing direct messages`, { error });
            throw error;
        }
    }

    /**
     * Get direct message history
     * 
     * @param channelId The ID of the direct message channel
     * @param limit Maximum number of messages to return
     * @returns Promise resolving to the direct message history
     */
    async getDirectMessageHistory(channelId: string, limit: number = 100): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Getting direct message history for channel: ${channelId}`);
            const result = await this.app.client.conversations.history({
                channel: channelId,
                limit
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error getting direct message history for channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Send a direct message to a user
     * 
     * @param userId The ID of the user
     * @param text The message text
     * @param blocks Optional Block Kit blocks
     * @returns Promise resolving to the send result
     */
    async sendDirectMessage(userId: string, text: string, blocks?: any[]): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Sending direct message to user: ${userId}`);

            // First, open a DM channel with the user
            const openResult = await this.openDirectMessage(userId);

            if (!openResult.channel || !openResult.channel.id) {
                throw new Error(`Failed to open direct message channel with user: ${userId}`);
            }

            // Then send the message to the DM channel
            const channelId = openResult.channel.id;
            const result = await this.app.client.chat.postMessage({
                channel: channelId,
                text,
                blocks
            });

            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error sending direct message to user: ${userId}`, { error });
            throw error;
        }
    }
}
