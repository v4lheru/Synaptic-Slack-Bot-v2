/**
 * Channel Management Features
 * 
 * This module implements features using the following permissions:
 * - channels:join
 * - channels:manage
 * - channels:read
 */

import { App } from '@slack/bolt';
import { logger, logEmoji } from '../../../utils/logger';

export class ChannelFeatures {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Get members of a channel
     * 
     * @param channelId The ID of the channel
     * @param limit Maximum number of members to return per page
     * @returns Promise resolving to the members result
     */
    async getChannelMembers(channelId: string, limit: number = 100): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Getting members for channel: ${channelId}`);
            const result = await this.app.client.conversations.members({
                channel: channelId,
                limit
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error getting members for channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Join a public channel
     * 
     * @param channelId The ID of the channel to join
     * @returns Promise resolving to the join result
     */
    async joinChannel(channelId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Joining channel: ${channelId}`);
            const result = await this.app.client.conversations.join({
                channel: channelId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error joining channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Create a new public channel
     * 
     * @param name The name of the channel to create
     * @param isPrivate Whether the channel should be private
     * @param teamId Optional team ID for multi-workspace apps
     * @returns Promise resolving to the creation result
     */
    async createChannel(name: string, isPrivate: boolean = false, teamId?: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Creating ${isPrivate ? 'private' : 'public'} channel: ${name}`);
            const result = await this.app.client.conversations.create({
                name,
                is_private: isPrivate,
                team_id: teamId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error creating channel: ${name}`, { error });
            throw error;
        }
    }

    /**
     * Archive a channel
     * 
     * @param channelId The ID of the channel to archive
     * @returns Promise resolving to the archive result
     */
    async archiveChannel(channelId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Archiving channel: ${channelId}`);
            const result = await this.app.client.conversations.archive({
                channel: channelId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error archiving channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Invite users to a channel
     * 
     * @param channelId The ID of the channel
     * @param userIds Array of user IDs to invite
     * @returns Promise resolving to the invite result
     */
    async inviteToChannel(channelId: string, userIds: string[]): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Inviting users to channel: ${channelId}`, { userIds });
            const result = await this.app.client.conversations.invite({
                channel: channelId,
                users: userIds.join(',')
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error inviting users to channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * List channels in the workspace
     * 
     * @param limit Maximum number of channels to return
     * @param excludeArchived Whether to exclude archived channels
     * @param types Types of channels to include (public_channel, private_channel, mpim, im)
     * @returns Promise resolving to the list of channels
     */
    async listChannels(
        limit: number = 100,
        excludeArchived: boolean = true,
        types: string = 'public_channel,private_channel'
    ): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Listing channels with types: ${types}`);
            const result = await this.app.client.conversations.list({
                limit,
                exclude_archived: excludeArchived,
                types
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error listing channels`, { error });
            throw error;
        }
    }

    /**
     * List public channels in the workspace
     * 
     * @param limit Maximum number of channels to return
     * @param excludeArchived Whether to exclude archived channels
     * @returns Promise resolving to the list of channels
     */
    async listPublicChannels(limit: number = 100, excludeArchived: boolean = true): Promise<any> {
        return this.listChannels(limit, excludeArchived, 'public_channel');
    }

    /**
     * Get channel information
     * 
     * @param channelId The ID of the channel
     * @returns Promise resolving to the channel information
     */
    async getChannelInfo(channelId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Getting channel info: ${channelId}`);
            const result = await this.app.client.conversations.info({
                channel: channelId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error getting channel info: ${channelId}`, { error });
            throw error;
        }
    }
}
