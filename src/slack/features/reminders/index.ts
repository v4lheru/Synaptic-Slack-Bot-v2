/**
 * Reminder Features
 * 
 * Implements features using the following permissions:
 * - reminders:write
 */

import { App } from '@slack/bolt';
import { logger, logEmoji } from '../../../utils/logger';

export class ReminderFeatures {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Add a reminder
     * 
     * @param text The reminder text
     * @param time The time for the reminder (Unix timestamp or natural language like "in 5 minutes")
     * @param userId The ID of the user to remind
     * @returns Promise resolving to the add result
     */
    async addReminder(text: string, time: string | number, userId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Adding reminder for user: ${userId}`);
            const result = await this.app.client.reminders.add({
                text,
                time,
                user: userId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error adding reminder for user: ${userId}`, { error });
            throw error;
        }
    }

    /**
     * Complete a reminder
     * 
     * @param reminderId The ID of the reminder
     * @returns Promise resolving to the complete result
     */
    async completeReminder(reminderId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Completing reminder: ${reminderId}`);
            const result = await this.app.client.reminders.complete({
                reminder: reminderId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error completing reminder: ${reminderId}`, { error });
            throw error;
        }
    }

    /**
     * Delete a reminder
     * 
     * @param reminderId The ID of the reminder
     * @returns Promise resolving to the delete result
     */
    async deleteReminder(reminderId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Deleting reminder: ${reminderId}`);
            const result = await this.app.client.reminders.delete({
                reminder: reminderId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error deleting reminder: ${reminderId}`, { error });
            throw error;
        }
    }

    /**
     * Get information about a reminder
     * 
     * @param reminderId The ID of the reminder
     * @returns Promise resolving to the reminder information
     */
    async getReminderInfo(reminderId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Getting reminder info: ${reminderId}`);
            const result = await this.app.client.reminders.info({
                reminder: reminderId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error getting reminder info: ${reminderId}`, { error });
            throw error;
        }
    }

    /**
     * List reminders for a user
     * 
     * @returns Promise resolving to the list of reminders
     */
    async listReminders(): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Listing reminders`);
            const result = await this.app.client.reminders.list();
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error listing reminders`, { error });
            throw error;
        }
    }
}
