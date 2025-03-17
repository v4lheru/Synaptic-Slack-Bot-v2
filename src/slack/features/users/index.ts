/**
 * User Features
 * 
 * Implements features using the following permissions:
 * - users:read
 * - users:read.email
 */

import { App } from '@slack/bolt';
import { logger, logEmoji } from '../../../utils/logger';

export class UserFeatures {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * List users in the workspace
     * 
     * @param limit Maximum number of users to return per page
     * @returns Promise resolving to the list of users
     */
    async listUsers(limit: number = 100): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Listing users`);
            const result = await this.app.client.users.list({
                limit
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error listing users`, { error });
            throw error;
        }
    }

    /**
     * Get user information
     * 
     * @param userId The ID of the user
     * @returns Promise resolving to the user information
     */
    async getUserInfo(userId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Getting user info: ${userId}`);
            const result = await this.app.client.users.info({
                user: userId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error getting user info: ${userId}`, { error });
            throw error;
        }
    }

    /**
     * Look up a user by email address
     * 
     * @param email The email address to look up
     * @returns Promise resolving to the user information
     */
    async lookupUserByEmail(email: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Looking up user by email: ${email}`);
            const result = await this.app.client.users.lookupByEmail({
                email
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error looking up user by email: ${email}`, { error });
            throw error;
        }
    }
}
