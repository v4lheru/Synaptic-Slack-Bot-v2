/**
 * Bookmark Features
 * 
 * Implements features using the following permissions:
 * - bookmarks:read
 * - bookmarks:write
 */

import { App } from '@slack/bolt';
import { logger, logEmoji } from '../../../utils/logger';

export class BookmarkFeatures {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Add a bookmark to a channel
     * 
     * @param channelId The ID of the channel
     * @param title The title of the bookmark
     * @param link The URL of the bookmark
     * @param emoji Optional emoji for the bookmark
     * @returns Promise resolving to the add result
     */
    async addBookmark(
        channelId: string,
        title: string,
        link: string,
        emoji?: string
    ): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Adding bookmark to channel: ${channelId}`);

            const params: any = {
                channel_id: channelId,
                title,
                type: 'link',
                link
            };

            if (emoji) {
                params.emoji = emoji;
            }

            const result = await this.app.client.bookmarks.add(params);
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error adding bookmark to channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * List bookmarks in a channel
     * 
     * @param channelId The ID of the channel
     * @returns Promise resolving to the list of bookmarks
     */
    async listBookmarks(channelId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Listing bookmarks in channel: ${channelId}`);
            const result = await this.app.client.bookmarks.list({
                channel_id: channelId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error listing bookmarks in channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Remove a bookmark from a channel
     * 
     * @param channelId The ID of the channel
     * @param bookmarkId The ID of the bookmark
     * @returns Promise resolving to the remove result
     */
    async removeBookmark(channelId: string, bookmarkId: string): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Removing bookmark from channel: ${channelId}`);
            const result = await this.app.client.bookmarks.remove({
                channel_id: channelId,
                bookmark_id: bookmarkId
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error removing bookmark from channel: ${channelId}`, { error });
            throw error;
        }
    }

    /**
     * Edit a bookmark in a channel
     * 
     * @param channelId The ID of the channel
     * @param bookmarkId The ID of the bookmark
     * @param title The new title of the bookmark
     * @param link The new URL of the bookmark
     * @param emoji Optional new emoji for the bookmark
     * @returns Promise resolving to the edit result
     */
    async editBookmark(
        channelId: string,
        bookmarkId: string,
        title: string,
        link: string,
        emoji?: string
    ): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Editing bookmark in channel: ${channelId}`);

            const params: any = {
                channel_id: channelId,
                bookmark_id: bookmarkId,
                title,
                link
            };

            if (emoji) {
                params.emoji = emoji;
            }

            const result = await this.app.client.bookmarks.edit(params);
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error editing bookmark in channel: ${channelId}`, { error });
            throw error;
        }
    }
}
