/**
 * Slack App Configuration
 * 
 * This module initializes and configures the Slack Bolt app.
 * It sets up the app with the appropriate tokens and middleware.
 */

import { App, LogLevel } from '@slack/bolt';
import { logger, logEmoji } from '../utils/logger';
import { env } from '../config/environment';
import { registerMiddleware } from './middleware';
import { SLACK_CONFIG } from '../config/constants';

// Map Winston log levels to Bolt log levels
const getBoltLogLevel = (): LogLevel => {
    switch (env.LOG_LEVEL) {
        case 'debug':
            return LogLevel.DEBUG;
        case 'info':
            return LogLevel.INFO;
        case 'warn':
            return LogLevel.WARN;
        case 'error':
            return LogLevel.ERROR;
        default:
            return LogLevel.INFO;
    }
};

// Create and configure the Slack app
export const app = new App({
    token: env.SLACK_BOT_TOKEN,
    signingSecret: env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: env.SLACK_APP_TOKEN,
    port: 3003, // Use a different port for the socket mode
    logLevel: getBoltLogLevel(),
    logger: {
        debug: (...msgs) => logger.debug(msgs.join(' ')),
        info: (...msgs) => logger.info(msgs.join(' ')),
        warn: (...msgs) => logger.warn(msgs.join(' ')),
        error: (...msgs) => logger.error(msgs.join(' ')),
        setLevel: () => { }, // No-op as we're using our own logger
        getLevel: () => getBoltLogLevel(),
        setName: () => { }, // No-op
    },
    customRoutes: [
        {
            path: '/health',
            method: ['GET'],
            handler: (req, res) => {
                res.writeHead(200);
                res.end('Health check: OK');
            },
        },
        {
            path: '/api/process-message',
            method: ['POST'],
            handler: (req, res) => {
                // Import the API handler dynamically to avoid circular dependencies
                const { processApiMessage } = require('../api/handler');
                processApiMessage(req, res);
            },
        },
    ],
});

// Initialize the app
function initializeApp() {
    try {
        // Register middleware
        registerMiddleware(app);

        // Import event handlers
        require('./events');

        // Store the original start method
        const originalStart = app.start.bind(app);

        // Create a new start method that logs when the app starts
        app.start = async function () {
            try {
                // Call the original start method
                const server = await originalStart();

                // Log that the app is running
                logger.info(`${logEmoji.slack} Slack Bolt app is running!`);

                // Return the server
                return server;
            } catch (error) {
                logger.error(`${logEmoji.error} Failed to start Slack Bolt app`, { error });
                throw error;
            }
        };

        logger.info(`${logEmoji.slack} Slack app initialized successfully`);
    } catch (error) {
        logger.error(`${logEmoji.error} Failed to initialize Slack app`, { error });
        throw error;
    }
}

// Initialize the app
initializeApp();

// Export the initialized app
export default app;
