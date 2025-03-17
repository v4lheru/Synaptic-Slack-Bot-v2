/**
 * Environment Configuration
 * 
 * This module loads and validates environment variables required for the application.
 * It uses dotenv to load variables from the .env file and provides a type-safe way
 * to access them throughout the application.
 */

import dotenv from 'dotenv';
import { logger } from '../utils/logger';

// Environment variable interface
export interface EnvironmentVariables {
    // Slack
    SLACK_BOT_TOKEN: string;
    SLACK_USER_TOKEN: string;
    SLACK_SIGNING_SECRET: string;
    SLACK_APP_TOKEN: string;

    // OpenRouter
    OPENROUTER_API_KEY: string;

    // MCP
    MCP_SERVER_URL: string;
    MCP_AUTH_TOKEN: string;

    // App Configuration
    NODE_ENV: 'development' | 'production' | 'test';
    LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}

// Default values for optional environment variables
const DEFAULT_ENV = {
    NODE_ENV: 'development',
    LOG_LEVEL: 'info',
} as const;

// Required environment variables
const REQUIRED_ENV_VARS = [
    'SLACK_BOT_TOKEN',
    'SLACK_SIGNING_SECRET',
    'SLACK_APP_TOKEN',
    'OPENROUTER_API_KEY',
];

/**
 * Load environment variables from .env file and validate required variables
 */
export function loadEnvironment(): EnvironmentVariables {
    // Load environment variables from .env file
    dotenv.config();

    // Check for required environment variables
    const missingVars = REQUIRED_ENV_VARS.filter(
        (name) => !process.env[name]
    );

    if (missingVars.length > 0) {
        const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }

    // Return environment variables with defaults for optional ones
    return {
        // Slack
        SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
        SLACK_USER_TOKEN: process.env.SLACK_USER_TOKEN!,
        SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET!,
        SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN!,

        // OpenRouter
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY!,

        // MCP
        MCP_SERVER_URL: process.env.MCP_SERVER_URL || 'http://localhost:3000',
        MCP_AUTH_TOKEN: process.env.MCP_AUTH_TOKEN || '',

        // App Configuration
        NODE_ENV: (process.env.NODE_ENV as EnvironmentVariables['NODE_ENV']) || DEFAULT_ENV.NODE_ENV,
        LOG_LEVEL: (process.env.LOG_LEVEL as EnvironmentVariables['LOG_LEVEL']) || DEFAULT_ENV.LOG_LEVEL,
    };
}

// Export singleton instance of environment variables
export const env = loadEnvironment();
