/**
 * Multi-Provider AI Slack Bot with MCP Integration
 * Main Entry Point
 * 
 * This file initializes the Slack bot application, sets up error handling,
 * and starts the bot listening for events.
 */

import { app } from './slack/app';
import { logger, logEmoji } from './utils/logger';
import { loadEnvironment, env } from './config/environment';
import { OpenRouterClient } from './ai/openrouter/client';
import { mcpClient } from './mcp/client';
import { contextManager } from './ai/context/manager';
import { AVAILABLE_FUNCTIONS, initializeFunctionCalling } from './mcp/function-calling';
import { DEFAULT_MODEL } from './ai/openrouter/models';

// Import event handlers
import './slack/events';

// Load environment variables
loadEnvironment();

// Initialize components
async function initializeComponents() {
    try {
        logger.info(`${logEmoji.info} Initializing application components...`);

        // Verify environment variables
        if (!env.SLACK_BOT_TOKEN || !env.SLACK_SIGNING_SECRET || !env.SLACK_APP_TOKEN) {
            throw new Error('Missing required Slack environment variables');
        }

        if (!env.OPENROUTER_API_KEY) {
            throw new Error('Missing required OpenRouter API key');
        }

        if (!env.MCP_SERVER_URL || !env.MCP_AUTH_TOKEN) {
            throw new Error('Missing required MCP server configuration');
        }

        // Log that MCP client is ready
        logger.info(`${logEmoji.mcp} MCP client ready to use`);

        // Initialize AI client
        const aiClient = new OpenRouterClient();
        const models = await aiClient.getAvailableModels();
        logger.info(`${logEmoji.ai} AI client initialized with ${models.length} available models`);
        logger.info(`${logEmoji.ai} Default model: ${DEFAULT_MODEL}`);

        // Initialize function calling system
        initializeFunctionCalling();

        // Log available functions
        logger.info(`${logEmoji.mcp} ${AVAILABLE_FUNCTIONS.length} functions available for AI`);
        AVAILABLE_FUNCTIONS.forEach(fn => {
            logger.debug(`${logEmoji.mcp} Function: ${fn.name} - ${fn.description}`);
        });

        // Initialize context manager
        logger.info(`${logEmoji.ai} Context manager initialized with capacity for ${contextManager.getContextCount()} contexts`);

        logger.info(`${logEmoji.info} All components initialized successfully`);
        return true;
    } catch (error) {
        logger.error(`${logEmoji.error} Error initializing components`, { error });
        throw error;
    }
}

// Start the app
(async () => {
    try {
        // Initialize components
        await initializeComponents();

        // Start the Slack app
        const port = Number(process.env.PORT) || 3001;
        await app.start(port);
        logger.info(`${logEmoji.info} ⚡️ Multi-Provider AI Slack Bot is running on port ${port}!`);
        logger.info(`${logEmoji.info} Environment: ${env.NODE_ENV}`);
        logger.info(`${logEmoji.info} Log level: ${env.LOG_LEVEL}`);

        // Create a separate HTTP server for the API endpoints
        const express = require('express');
        const bodyParser = require('body-parser');
        const { processApiMessage } = require('./api/handler');

        const apiServer = express();
        const apiPort = 3002; // Use a different port for the API server

        // Middleware
        apiServer.use(bodyParser.json());

        // API endpoint
        apiServer.post('/api/process-message', processApiMessage);

        // Start the API server
        apiServer.listen(apiPort, () => {
            logger.info(`${logEmoji.api} API server is running on port ${apiPort}!`);
        });
    } catch (error) {
        logger.error(`${logEmoji.error} Unable to start app`, { error });
        process.exit(1);
    }
})();

// Handle graceful shutdown
const gracefulShutdown = async () => {
    logger.info(`${logEmoji.info} Shutting down gracefully...`);
    try {
        // Perform cleanup tasks
        logger.info(`${logEmoji.info} Cleaning up resources...`);

        // Stop the Slack app
        await app.stop();
        logger.info(`${logEmoji.info} Slack app stopped successfully`);

        // Log final stats
        logger.info(`${logEmoji.ai} Final context count: ${contextManager.getContextCount()}`);

        logger.info(`${logEmoji.info} Shutdown complete`);
        process.exit(0);
    } catch (error) {
        logger.error(`${logEmoji.error} Error during shutdown`, { error });
        process.exit(1);
    }
};

// Listen for termination signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('uncaughtException', (error) => {
    logger.error(`${logEmoji.error} Uncaught exception`, { error });
    gracefulShutdown();
});
process.on('unhandledRejection', (reason) => {
    logger.error(`${logEmoji.error} Unhandled rejection`, { reason });
});

// Log startup
logger.info(`${logEmoji.info} Multi-Provider AI Slack Bot starting up...`);
