/**
 * Search Features
 * 
 * Implements features using the following permissions:
 * - search:read
 */

import { App } from '@slack/bolt';
import { logger, logEmoji } from '../../../utils/logger';

export class SearchFeatures {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Search for messages
     * 
     * @param query The search query
     * @param count Maximum number of results to return
     * @param sort Sort order (score or timestamp)
     * @param sortDir Sort direction (asc or desc)
     * @returns Promise resolving to the search result
     */
    async searchMessages(
        query: string,
        count: number = 20,
        sort: 'score' | 'timestamp' = 'score',
        sortDir: 'asc' | 'desc' = 'desc'
    ): Promise<any> {
        try {
            logger.info(`${logEmoji.slack} Searching messages with query: ${query}`);
            const result = await this.app.client.search.messages({
                query,
                count,
                sort,
                sort_dir: sortDir
            });
            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error searching messages with query: ${query}`, { error });
            throw error;
        }
    }
}
