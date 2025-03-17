/**
 * API Types
 * 
 * This module defines the types and interfaces for the HTTP API endpoint.
 * It includes request and response formats, error types, and other related interfaces.
 */

/**
 * API request payload interface
 * 
 * Defines the structure of incoming API requests.
 * Simplified to just accept a message, similar to how a user would interact with the Slack bot directly.
 */
export interface ApiRequest {
    /**
     * The message to process (natural language instruction)
     */
    message: string;
}

/**
 * Function result interface
 * 
 * Represents the result of a single function call.
 */
export interface FunctionResult {
    /**
     * The name of the function that was called
     */
    functionName: string;

    /**
     * The result of the function call
     */
    result: {
        /**
         * Whether the function call was successful
         */
        success: boolean;

        /**
         * Additional result properties
         */
        [key: string]: any;
    };
}

/**
 * API response payload interface
 * 
 * Defines the structure of successful API responses.
 */
export interface ApiResponse {
    /**
     * Whether the request was successful
     */
    success: boolean;

    /**
     * The results of any function calls
     */
    results?: FunctionResult[];

    /**
     * The text response from the AI
     */
    response?: string;

    /**
     * Metadata about the response
     */
    metadata?: {
        /**
         * The AI model used to generate the response
         */
        model: string;

        /**
         * The time taken to process the request
         */
        processingTime: string;
    };
}

/**
 * API error response interface
 * 
 * Defines the structure of error responses.
 */
export interface ApiErrorResponse {
    /**
     * Always false for error responses
     */
    success: false;

    /**
     * Error details
     */
    error: {
        /**
         * Error code
         */
        code: string;

        /**
         * Error message
         */
        message: string;
    };
}

/**
 * Error codes
 * 
 * Defines the possible error codes that can be returned by the API.
 */
export enum ApiErrorCode {
    AUTHENTICATION_FAILED = 'authentication_failed',
    INVALID_REQUEST = 'invalid_request',
    MISSING_REQUIRED_FIELD = 'missing_required_field',
    API_DISABLED = 'api_disabled',
    RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
    INTERNAL_ERROR = 'internal_error',
}
