/**
 * Slack API Utilities
 * 
 * This module provides utilities for making Slack API calls with fallback mechanisms.
 * It handles rate limiting and other errors by trying different approaches.
 */

import axios from 'axios';
import { App } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { logger, logEmoji } from '../../utils/logger';
import { env } from '../../config/environment';
import { RateLimitError, ExternalApiError } from '../../utils/error-handler';

/**
 * Interface for Slack API method parameters
 */
export interface SlackApiParams {
    [key: string]: any;
}

/**
 * Interface for WebAPI options
 */
export interface WebApiOptions {
    baseUrl?: string;
    timeout?: number;
    retryAfter?: number;
    useUserToken?: boolean; // Whether to use the user token instead of the bot token
}

/**
 * Default WebAPI options
 */
const DEFAULT_WEB_API_OPTIONS: WebApiOptions = {
    baseUrl: 'https://slack.com/api',
    timeout: 30000, // 30 seconds
    useUserToken: false, // Default to using the bot token
};

/**
 * Make a Slack API call with fallback mechanism
 * 
 * This function will:
 * 1. Try to use the Bolt SDK client
 * 2. If that fails with a rate limit error, try using the WebAPI directly
 * 3. If that fails too, report an error
 * 
 * @param app The Slack app instance
 * @param method The Slack API method to call (e.g., 'conversations.list')
 * @param params The parameters to pass to the method
 * @param options Options for the WebAPI fallback
 * @returns Promise resolving to the API response
 */
export async function callSlackApi(
    app: App,
    method: string,
    params: SlackApiParams,
    options: WebApiOptions = DEFAULT_WEB_API_OPTIONS
): Promise<any> {
    try {
        // Step 1: Try using the Bolt SDK client
        const tokenType = options.useUserToken ? 'user' : 'bot';
        logger.info(`${logEmoji.slack} Calling Slack API method: ${method} with ${tokenType} token`);

        // Call the method using the Bolt SDK client
        // We need to use the any type here because the WebClient methods are dynamically accessed
        const result = await (app.client as any).apiCall(method, params);

        return result;
    } catch (error: any) {
        // Check if it's a rate limit error (HTTP 429)
        if (error.code === 'slack_webapi_platform_error' && error.data?.error === 'ratelimited') {
            const retryAfter = parseInt(error.headers?.['retry-after'] || '30', 10);

            logger.warn(
                `${logEmoji.warning} Rate limit exceeded for Slack API method: ${method}. ` +
                `Retry after: ${retryAfter} seconds. Falling back to WebAPI.`,
                { error }
            );

            // Step 2: Try using the WebAPI directly
            try {
                return await callSlackWebApi(
                    method,
                    params,
                    {
                        ...options,
                        retryAfter,
                    }
                );
            } catch (webApiError) {
                // If WebAPI also fails, throw an error
                logger.error(
                    `${logEmoji.error} WebAPI fallback also failed for method: ${method}`,
                    { error: webApiError }
                );

                throw new RateLimitError(
                    `Rate limit exceeded for Slack API method: ${method}. Both primary and fallback mechanisms failed.`,
                    {
                        method,
                        params,
                        originalError: error,
                        webApiError,
                    }
                );
            }
        }

        // For other errors, just throw them
        logger.error(`${logEmoji.error} Error calling Slack API method: ${method}`, { error });
        throw error;
    }
}

/**
 * Call the Slack WebAPI directly
 * 
 * @param method The Slack API method to call (e.g., 'conversations.list')
 * @param params The parameters to pass to the method
 * @param options Options for the WebAPI call
 * @returns Promise resolving to the API response
 */
async function callSlackWebApi(
    method: string,
    params: SlackApiParams,
    options: WebApiOptions = DEFAULT_WEB_API_OPTIONS
): Promise<any> {
    const { baseUrl, timeout, retryAfter, useUserToken } = { ...DEFAULT_WEB_API_OPTIONS, ...options };

    // If retryAfter is specified, wait for that amount of time
    if (retryAfter) {
        logger.info(`${logEmoji.info} Waiting for ${retryAfter} seconds before retrying...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    }

    try {
        // Determine which token to use
        const token = useUserToken ? env.SLACK_USER_TOKEN : env.SLACK_BOT_TOKEN;
        const tokenType = useUserToken ? 'user' : 'bot';

        logger.info(`${logEmoji.slack} Calling Slack WebAPI method: ${method} with ${tokenType} token`);

        // Make the API call using axios
        const response = await axios({
            method: 'post',
            url: `${baseUrl}/${method}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json; charset=utf-8',
            },
            data: params,
            timeout,
        });

        // Check if the API call was successful
        if (!response.data.ok) {
            throw new Error(response.data.error || 'Unknown error');
        }

        return response.data;
    } catch (error: any) {
        // Check if it's a rate limit error (HTTP 429)
        if (error.response?.status === 429) {
            const retryAfter = parseInt(error.response.headers['retry-after'] || '30', 10);

            throw new RateLimitError(
                `Rate limit exceeded for Slack WebAPI method: ${method}. Retry after: ${retryAfter} seconds.`,
                {
                    method,
                    params,
                    retryAfter,
                    originalError: error,
                }
            );
        }

        // For other errors, throw an ExternalApiError
        throw new ExternalApiError(
            `Error calling Slack WebAPI method: ${method}. ${error.message}`,
            {
                method,
                params,
                originalError: error,
            }
        );
    }
}
