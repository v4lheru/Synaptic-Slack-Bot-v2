/**
 * Admin Features
 * 
 * Implements features using the following permissions:
 * - admin.conversations:write
 * - admin.conversations:read
 * - admin.users:write
 */

import { App } from '@slack/bolt';
import { logger, logEmoji } from '../../../utils/logger';

export class AdminFeatures {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Invite users to a channel (admin level)
     * 
     * @param channelId The ID of the channel
     * @param userIds Array of user IDs to invite
     * @returns Promise resolving to the invite result
     */
    async inviteUsersToChannel(channelId: string, userIds: string[]): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Admin inviting users to channel: ${channelId}`, { userIds });

            // Ensure we have at least one user ID
            if (!userIds.length) {
                throw new Error('At least one user ID is required');
            }

            const result = await this.app.client.admin.conversations.invite({
                channel_id: channelId,
                user_ids: userIds as [string, ...string[]]
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error admin inviting users to channel: ${channelId}`, { error });
            throw error;
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
    async inviteUserToWorkspace(
        email: string,
        channelIds: string[] = [],
        teamId: string = '',
        customMessage?: string
    ): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Admin inviting user to workspace: ${email}`);

            const params: any = {
                email
            };

            // Add optional parameters if provided
            if (channelIds.length > 0) {
                params.channel_ids = channelIds as [string, ...string[]];
            }

            if (teamId) {
                params.team_id = teamId;
            }

            if (customMessage) {
                params.custom_message = customMessage;
            }

            const result = await this.app.client.admin.users.invite(params);
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error admin inviting user to workspace: ${email}`, { error });
            throw error;
        }
    }

    /**
     * Assign a user to a workspace
     * 
     * @param teamId The ID of the team to assign the user to
     * @param userId The ID of the user to assign
     * @returns Promise resolving to the assign result
     */
    async assignUserToWorkspace(teamId: string, userId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Admin assigning user: ${userId} to workspace: ${teamId}`);
            const result = await this.app.client.admin.users.assign({
                team_id: teamId,
                user_id: userId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error admin assigning user: ${userId} to workspace: ${teamId}`, { error });
            throw error;
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
    async searchChannels(query: string, teamIds?: string[], limit: number = 100): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Admin searching channels with query: ${query}`);

            const params: any = {
                query,
                limit
            };

            // Add team_ids if provided and ensure it has the correct type
            if (teamIds && teamIds.length > 0) {
                params.team_ids = teamIds as [string, ...string[]];
            }

            const result = await this.app.client.admin.conversations.search(params);
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error admin searching channels with query: ${query}`, { error });
            throw error;
        }
    }

    /**
     * Archive a channel (admin level)
     * 
     * @param channelId The ID of the channel to archive
     * @returns Promise resolving to the archive result
     */
    async archiveChannel(channelId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Admin archiving channel: ${channelId}`);
            const result = await this.app.client.admin.conversations.archive({
                channel_id: channelId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error admin archiving channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Unarchive a channel (admin level)
     * 
     * @param channelId The ID of the channel to unarchive
     * @returns Promise resolving to the unarchive result
     */
    async unarchiveChannel(channelId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Admin unarchiving channel: ${channelId}`);
            const result = await this.app.client.admin.conversations.unarchive({
                channel_id: channelId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error admin unarchiving channel: ${channelId}`, { error });
            throw error;
        }
    }
}
