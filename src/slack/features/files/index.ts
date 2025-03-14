/**
 * File Features
 * 
 * Implements features using the following permissions:
 * - files:read
 * - files:write
 */

import { App } from '@slack/bolt';
import { logger, logEmoji } from '../../../utils/logger';

export class FileFeatures {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Upload a file
     * 
     * @param channelId The ID of the channel to upload to
     * @param file The file content
     * @param filename The filename
     * @param initialComment Optional initial comment
     * @returns Promise resolving to the upload result
     */
    async uploadFile(
        channelId: string,
        file: Buffer | string,
        filename: string,
        initialComment?: string
    ): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Uploading file to channel: ${channelId}`);
            const result = await this.app.client.files.upload({
                channels: channelId,
                file,
                filename,
                initial_comment: initialComment
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error uploading file to channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Get file information
     * 
     * @param fileId The ID of the file
     * @returns Promise resolving to the file information
     */
    async getFileInfo(fileId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Getting file info: ${fileId}`);
            const result = await this.app.client.files.info({
                file: fileId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error getting file info: ${fileId}`, { error });
            throw error;
        }
    }

    /**
     * Delete a file
     * 
     * @param fileId The ID of the file to delete
     * @returns Promise resolving to the delete result
     */
    async deleteFile(fileId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Deleting file: ${fileId}`);
            const result = await this.app.client.files.delete({
                file: fileId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error deleting file: ${fileId}`, { error });
            throw error;
        }
    }

    /**
     * List files in a channel
     * 
     * @param channelId The ID of the channel
     * @param count Maximum number of files to return
     * @returns Promise resolving to the list of files
     */
    async listFiles(channelId: string, count: number = 100): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Listing files in channel: ${channelId}`);
            const result = await this.app.client.files.list({
                channel: channelId,
                count
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error listing files in channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Share a file in a channel
     * 
     * @param fileId The ID of the file to share
     * @param channelId The ID of the channel to share in
     * @returns Promise resolving to the share result
     */
    async shareFile(fileId: string, channelId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Sharing file ${fileId} in channel: ${channelId}`);
            const result = await this.app.client.files.sharedPublicURL({
                file: fileId
            });

            // Now share the file in the channel
            await this.app.client.chat.postMessage({
                channel: channelId,
                text: `Shared file: ${result.file?.permalink || 'No permalink available'}`,
                unfurl_links: true
            });

            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error sharing file ${fileId} in channel: ${channelId}`, { error });
            throw error;
        }
    }
}
