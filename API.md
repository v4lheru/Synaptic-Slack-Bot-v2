# Slack Bot HTTP API Documentation

This document provides detailed information about the HTTP API endpoint for Slack bot automation.

## Overview

The API endpoint allows external tools like n8n to send natural language instructions to the Slack bot. The bot processes these instructions just like it would process messages in Slack, executing functions and returning results.

## Authentication

All API requests require an API key for authentication.

- The API key should be provided in the `X-API-Key` header.
- The API key is configured in the `.env` file as `API_KEY`.

## Rate Limiting

The API implements rate limiting to prevent abuse:

- The default rate limit is 100 requests per minute per IP address.
- This can be configured in the `.env` file as `API_RATE_LIMIT`.
- Rate limit headers are included in the response:
  - `X-RateLimit-Limit`: The maximum number of requests allowed per minute
  - `X-RateLimit-Remaining`: The number of requests remaining in the current window
  - `X-RateLimit-Reset`: The time at which the rate limit window resets (Unix timestamp)

## Endpoint

### POST /api/process-message

Process a natural language message and execute any requested functions.

#### Request

```http
POST /api/process-message
Content-Type: application/json
X-API-Key: your-api-key-here

{
  "message": "Create a channel called project-discussion, invite @user1 and @user2, and send a welcome message"
}
```

#### Request Body

| Field    | Type   | Required | Description                                   |
|----------|--------|----------|-----------------------------------------------|
| message  | string | Yes      | The natural language instruction to process   |

#### Response

```json
{
  "success": true,
  "results": [
    {
      "functionName": "createChannel",
      "result": {
        "success": true,
        "channelId": "C87654321",
        "channelName": "project-discussion",
        "message": "I've created the channel #project-discussion for you."
      }
    },
    {
      "functionName": "inviteToChannel",
      "result": {
        "success": true,
        "channelId": "C87654321",
        "invitedUsers": ["U11111111", "U22222222"],
        "message": "I've invited 2 user(s) to the channel."
      }
    },
    {
      "functionName": "sendMessage",
      "result": {
        "success": true,
        "channelId": "C87654321",
        "messageTs": "1234567890.123456",
        "message": "I've sent your message to the channel."
      }
    }
  ],
  "response": "I've created the channel #project-discussion, invited the users, and sent a welcome message.",
  "metadata": {
    "model": "openai/gpt-4o",
    "processingTime": "1.2s"
  }
}
```

#### Response Body

| Field       | Type    | Description                                                |
|-------------|---------|------------------------------------------------------------|
| success     | boolean | Whether the request was successful                         |
| results     | array   | Array of function call results (if any functions were called) |
| response    | string  | The text response from the AI                              |
| metadata    | object  | Metadata about the response                                |

#### Function Result Object

| Field        | Type    | Description                                   |
|--------------|---------|-----------------------------------------------|
| functionName | string  | The name of the function that was called      |
| result       | object  | The result of the function call               |
| result.success | boolean | Whether the function call was successful    |
| result.*     | various | Additional result properties specific to the function |

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "authentication_failed",
    "message": "Invalid API key"
  }
}
```

#### Error Codes

| Code                   | Description                                           |
|------------------------|-------------------------------------------------------|
| authentication_failed  | Invalid API key                                       |
| invalid_request        | Invalid request format                                |
| missing_required_field | Missing required field in request                     |
| api_disabled           | API endpoint is disabled                              |
| rate_limit_exceeded    | Rate limit exceeded                                   |
| internal_error         | An internal error occurred while processing the request |

## n8n Integration Example

In n8n, create an HTTP Request node with:

- Method: POST
- URL: https://your-bot-url/api/process-message
- Headers:
  - Content-Type: application/json
  - X-API-Key: your-api-key
- Body: JSON with the message

Example n8n HTTP Request node configuration:

```json
{
  "parameters": {
    "method": "POST",
    "url": "https://your-bot-url/api/process-message",
    "authentication": "none",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "X-API-Key",
          "value": "your-api-key-here"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "message",
          "value": "Create a channel called project-discussion and invite @user1 and @user2"
        }
      ]
    }
  }
}
```

## Security Considerations

- Always use HTTPS for production deployments
- Store the API key securely
- Consider implementing IP whitelisting for production environments
- Regularly rotate the API key
- Monitor API usage for unusual patterns

## Troubleshooting

- If you receive a 401 error, check that your API key is correct
- If you receive a 403 error, check that the API endpoint is enabled in the `.env` file
- If you receive a 429 error, you have exceeded the rate limit
- If you receive a 500 error, check the server logs for more information
