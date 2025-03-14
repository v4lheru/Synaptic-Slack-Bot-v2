/**
 * Reaction Features
 * 
 * Implements features using the following permissions:
 * - reactions:write
 */

import { App } from '@slack/bolt';
import { logger, logEmoji } from '../../../utils/logger';

export class ReactionFeatures {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Add a reaction to a message
     * 
     * @param channelId The ID of the channel
     * @param timestamp The timestamp of the message
     * @param name The name of the reaction (emoji)
     * @returns Promise resolving to the add result
     */
    async addReaction(channelId: string, timestamp: string, name: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Adding reaction ${name} to message: ${timestamp} in channel: ${channelId}`);
            const result = await this.app.client.reactions.add({
                channel: channelId,
                timestamp,
                name
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error adding reaction ${name} to message: ${timestamp} in channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Remove a reaction from a message
     * 
     * @param channelId The ID of the channel
     * @param timestamp The timestamp of the message
     * @param name The name of the reaction (emoji)
     * @returns Promise resolving to the remove result
     */
    async removeReaction(channelId: string, timestamp: string, name: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Removing reaction ${name} from message: ${timestamp} in channel: ${channelId}`);
            const result = await this.app.client.reactions.remove({
                channel: channelId,
                timestamp,
                name
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error removing reaction ${name} from message: ${timestamp} in channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Get reactions for a message
     * 
     * @param channelId The ID of the channel
     * @param timestamp The timestamp of the message
     * @returns Promise resolving to the reactions
     */
    async getReactions(channelId: string, timestamp: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Getting reactions for message: ${timestamp} in channel: ${channelId}`);
            const result = await this.app.client.reactions.get({
                channel: channelId,
                timestamp
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error getting reactions for message: ${timestamp} in channel: ${channelId}`, { error });
            throw error;
        }
    }
}
