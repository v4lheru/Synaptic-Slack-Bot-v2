/**
 * Logger Utility
 * 
 * This module provides a centralized logging service using Winston.
 * It configures different log formats and transports based on the environment.
 */

import winston from 'winston';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

// Define log colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Create format for console output
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info: any) => `${info.timestamp} ${info.level}: ${info.message}${info.splat !== undefined ? `${info.splat}` : ''
            }${info.error ? `\n${info.error.stack}` : ''
            }`
    )
);

// Create format for file output (if needed)
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
);

// Determine log level from environment
const logLevel = process.env.LOG_LEVEL || 'info';

// Create the logger instance
export const logger = winston.createLogger({
    level: logLevel,
    levels,
    format: fileFormat,
    transports: [
        // Console transport
        new winston.transports.Console({
            format: consoleFormat,
        }),
        // Uncomment to add file logging if needed
        // new winston.transports.File({
        //     filename: 'logs/error.log',
        //     level: 'error',
        // }),
        // new winston.transports.File({
        //     filename: 'logs/combined.log',
        // }),
    ],
    exitOnError: false,
});

// Export a stream object for Morgan (if used with Express)
export const stream = {
    write: (message: string) => {
        logger.info(message.trim());
    },
};

// Helper function to log errors with stack traces
export const logError = (message: string, error: Error): void => {
    logger.error(message, { error });
};

// Add emojis to make logs more readable
export const logEmoji = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    debug: '🔍',
    slack: '🤖',
    ai: '🧠',
    mcp: '🔌',
    api: '🌐', // HTTP API endpoint
};
