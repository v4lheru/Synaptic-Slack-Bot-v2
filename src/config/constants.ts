/**
 * Application Constants
 * 
 * This module defines constants used throughout the application.
 * It centralizes configuration values and settings.
 */

/**
 * Application information
 */
export const APP_INFO = {
    NAME: 'Multi-Provider AI Slack Bot',
    VERSION: '1.0.0',
    DESCRIPTION: 'A Slack bot that leverages OpenRouter AI and MCP integration',
};

/**
 * Default system message for AI interactions
 */
export const DEFAULT_SYSTEM_MESSAGE = `You are an AI assistant in a Slack workspace. You are helpful, concise, and friendly.
    
When responding:
- Be clear and to the point
- Format responses using Slack's markdown
- Use bullet points and headings for organization
- Include code blocks with syntax highlighting when sharing code
- Cite sources when providing factual information

You have access to various Slack features and can perform actions such as:
- Creating channels and inviting users
- Sending messages to channels or direct messages to users
- Uploading files to channels
- Adding reactions to messages
- Setting reminders for users

IMPORTANT: You should distinguish between two types of requests:

1. Action Requests: When a user asks you to perform a specific Slack action (like "create a channel", "send a message", etc.), use the appropriate function call to accomplish the task. Don't just describe what you would do - actually perform the action by calling the function.

2. Conversational Requests: When a user asks for information, creative content, or has a general conversation (like "write a haiku", "explain something", etc.), respond directly with your answer without using function calls.

For example:
- If a user says "create a channel called project-discussion", call the createChannel function.
- If a user says "write a haiku about Slack", just respond with the haiku directly.
- If a user says "send a message to #general saying hello", call the sendMessage function.
- If a user says "what's the weather like?", just respond conversationally.

This distinction ensures a natural conversation flow while still allowing you to perform actions when needed.`;

/**
 * OpenRouter configuration
 */
export const OPENROUTER_CONFIG = {
    BASE_URL: 'https://openrouter.ai/api/v1',
    DEFAULT_MODEL: 'openai/gpt-4-turbo',
    DEFAULT_TEMPERATURE: 0.7,
    DEFAULT_MAX_TOKENS: 1024,
    DEFAULT_TOP_P: 0.9,
    HTTP_TIMEOUT: 60000, // 60 seconds
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000, // 1 second
};

/**
 * MCP configuration
 */
export const MCP_CONFIG = {
    DEFAULT_TIMEOUT: 30000, // 30 seconds
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000, // 1 second
    MAX_WAIT_TIME: 60000, // 60 seconds
    POLL_INTERVAL: 1000, // 1 second
};

/**
 * Context management configuration
 */
export const CONTEXT_CONFIG = {
    MAX_CONTEXTS: 1000,
    MAX_MESSAGES_PER_CONTEXT: 50,
    CONTEXT_TTL_HOURS: 24,
};

/**
 * Slack configuration
 */
export const SLACK_CONFIG = {
    MAX_MESSAGE_LENGTH: 40000,
    MAX_BLOCKS_PER_MESSAGE: 50,
    MAX_ATTACHMENTS_PER_MESSAGE: 10,
    THINKING_MESSAGE: 'Thinking...',
    ERROR_TITLE: 'Error',
    ERROR_MESSAGE: 'Something went wrong. Please try again.',
};

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
    MAX_REQUESTS_PER_MINUTE: 50,
    MAX_REQUESTS_PER_HOUR: 1000,
    COOLDOWN_PERIOD_MS: 60000, // 1 minute
};

/**
 * Logging configuration
 */
export const LOGGING_CONFIG = {
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    LOG_FILE_PATH: 'logs/app.log',
    MAX_LOG_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
    MAX_LOG_FILES: 5,
};

/**
 * Security configuration
 */
export const SECURITY_CONFIG = {
    TOKEN_REFRESH_INTERVAL_MS: 24 * 60 * 60 * 1000, // 24 hours
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_PERIOD_MS: 15 * 60 * 1000, // 15 minutes
};

/**
 * Feature flags
 */
export const FEATURE_FLAGS = {
    ENABLE_FUNCTION_CALLING: true,
    ENABLE_STREAMING: false,
    ENABLE_FEEDBACK: true,
    ENABLE_SUGGESTED_PROMPTS: true,
    ENABLE_CONTEXT_MANAGEMENT: true,
};

/**
 * Environment names
 */
export enum Environment {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
    TEST = 'test',
}

/**
 * Get the current environment
 * 
 * @returns The current environment
 */
export function getCurrentEnvironment(): Environment {
    const env = process.env.NODE_ENV?.toLowerCase() || 'development';

    switch (env) {
        case 'production':
            return Environment.PRODUCTION;
        case 'test':
            return Environment.TEST;
        default:
            return Environment.DEVELOPMENT;
    }
}

/**
 * Check if the current environment is development
 * 
 * @returns True if the current environment is development
 */
export function isDevelopment(): boolean {
    return getCurrentEnvironment() === Environment.DEVELOPMENT;
}

/**
 * Check if the current environment is production
 * 
 * @returns True if the current environment is production
 */
export function isProduction(): boolean {
    return getCurrentEnvironment() === Environment.PRODUCTION;
}

/**
 * Check if the current environment is test
 * 
 * @returns True if the current environment is test
 */
export function isTest(): boolean {
    return getCurrentEnvironment() === Environment.TEST;
}
