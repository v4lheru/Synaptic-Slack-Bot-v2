# Instructions for LLM Integration in Synaptic Slack Bot v2

This document provides guidance on working with the AI integration in the Synaptic Slack Bot v2, focusing on the OpenRouter client, function/tool calling capabilities, and the new Slack features.

## What's New in v2

Version 2 introduces significant enhancements to the AI integration:

1. **Expanded Slack Permissions**: The bot now utilizes a comprehensive set of Slack permissions
2. **Modular Feature Architecture**: Features are organized into separate modules for better maintainability
3. **AI Actions Layer**: A new "brains" layer for understanding and executing user requests
4. **Enhanced Conversational Experience**: Improved response handling for both action requests and conversational queries
5. **Intelligent Response Formatting**: Automatically determines when to use function calls vs. direct responses

## OpenRouter Integration

The bot uses OpenRouter as an AI provider gateway, which allows access to various AI models from different providers (OpenAI, Anthropic, etc.) through a unified API.

### Key Components

1. **OpenRouter Client** (`src/ai/openrouter/client.ts`): Handles communication with the OpenRouter API
2. **Function Calling** (`src/mcp/function-calling.ts`): Defines functions that can be called by the AI
3. **Slack Functions** (`src/mcp/slack-functions.ts`): Defines Slack-specific functions for the AI
4. **AI Actions** (`src/ai/actions/slack-actions.ts`): Implements the "brains" layer for executing Slack actions
5. **Context Management** (`src/ai/context/manager.ts`): Manages conversation context for AI interactions

## Slack Features Architecture

The bot now has a modular feature architecture that organizes Slack capabilities into separate modules:

1. **Channels** (`src/slack/features/channels/index.ts`): Channel management features
2. **Messages** (`src/slack/features/messages/index.ts`): Message sending and management
3. **Direct Messages** (`src/slack/features/direct-messages/index.ts`): Direct message features
4. **Files** (`src/slack/features/files/index.ts`): File upload and management
5. **Reactions** (`src/slack/features/reactions/index.ts`): Message reaction features
6. **Reminders** (`src/slack/features/reminders/index.ts`): Reminder setting features

Each feature module implements a specific set of Slack permissions and provides a clean API for the AI actions layer.

## Conversational Intelligence

The bot now intelligently distinguishes between two types of requests:

1. **Action Requests**: When a user asks the bot to perform a specific Slack action (like "create a channel", "send a message", etc.)
2. **Conversational Requests**: When a user asks for information, creative content, or has a general conversation (like "write a haiku", "explain something", etc.)

This distinction is implemented in:
- The system message (`src/config/constants.ts`)
- The event handler (`src/slack/events/index.ts`)

### Response Handling

When the AI calls a function, the response is enhanced with user-friendly messages that explain what was done. This makes the bot feel more conversational even when performing actions.

## Tool Calling Implementation

OpenRouter supports tool calling (previously known as function calling) which allows the AI to trigger specific functions in your application. Here are important details about the implementation:

### Tool Calling Requirements

1. The OpenRouter API requires specific configuration to use tool calling:
   - You must use a model that supports tool calls (e.g., `openai/gpt-4o`)
   - You must configure provider routing to ensure you use a provider that supports tool calls
   - You must use the `tools` parameter instead of the deprecated `functions` parameter

### Implementation Details

The OpenRouter client is configured to:

1. Use the `tools` parameter to define available functions
2. Override the model to `openai/gpt-4o` when tool calling is needed
3. Configure provider routing with:
   ```javascript
   provider: {
     require_parameters: true,
     sort: 'throughput'
   }
   ```

### Response Handling

When the AI calls a tool, the response will include a `tool_calls` array in the message. The client parses this into a `functionCalls` array that can be processed by the application.

## Adding New Slack Features

To add new Slack features:

1. Create a new feature module in `src/slack/features/`
2. Implement the necessary Slack API calls
3. Add the feature to the main features class in `src/slack/features/index.ts`
4. Create corresponding action functions in `src/ai/actions/slack-actions.ts`
5. Define function schemas in `src/mcp/slack-functions.ts`

## Troubleshooting

Common issues and their solutions:

### "No endpoints found that support tool use"

This error occurs when:
1. The model you're using doesn't support tool calls
2. The provider routing isn't configured correctly

Solution: Ensure you're using a model that supports tool calls (like GPT-4o) and that provider routing is configured to require support for all parameters.

### "Cannot read properties of undefined (reading '0')"

This error typically occurs when the response structure from OpenRouter doesn't match what's expected.

Solution: Add robust error handling to check for the existence of properties before accessing them.

### "Invalid blocks" or "must be more than 0 characters"

This error occurs when trying to send a Slack message with empty content.

Solution: The bot now includes safeguards to ensure all text fields in Slack blocks have valid content.

## Making Changes

When modifying the OpenRouter client:

1. Update the interfaces if you're adding new parameters or response fields
2. Add appropriate error handling for all API calls
3. Test with simple function calls before implementing complex functionality
4. Check the OpenRouter documentation for any API changes: https://openrouter.ai/docs

## OpenRouter API Key

The bot uses an OpenRouter API key stored in the `.env` file. Make sure this key has sufficient credits and permissions for the models you want to use.

## Deployment Considerations

When deploying:

1. Ensure your OpenRouter API key is properly set in the environment
2. Consider the cost implications of using different models
3. Implement rate limiting to prevent excessive API usage
4. Monitor API responses for errors and implement appropriate fallbacks

## Future Improvements

Potential enhancements to consider:

1. Implement streaming responses for real-time AI interactions
2. Add support for multimodal inputs (images, etc.)
3. Implement a model fallback strategy for when preferred models are unavailable
4. Add caching for common queries to reduce API costs
5. Expand the feature modules to cover additional Slack capabilities
6. Implement more complex workflows that combine multiple Slack actions
