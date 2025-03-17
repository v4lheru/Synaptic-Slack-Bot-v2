# Synaptic Slack Bot v2 - Multi-Provider AI Slack Bot

## Project Overview

Synaptic Slack Bot v2 is an intelligent Slack bot that connects your team's conversations with powerful AI capabilities. It serves as a bridge between your Slack workspace and various AI models, allowing seamless access to AI assistance without leaving your communication platform.

The bot leverages OpenRouter as a gateway to multiple AI service providers (including OpenAI, Anthropic, and others) and can make function calls to an MCP server to perform custom actions based on user requests.

## What's New in v2

Version 2 of Synaptic Slack Bot v2 introduces significant enhancements:

- **Expanded Slack Permissions**: Utilizes a comprehensive set of Slack permissions to perform a wide range of actions
- **Modular Feature Architecture**: Organized features into separate modules for better maintainability
- **Enhanced Conversational Experience**: Improved response handling for both action requests and conversational queries
- **Intelligent Response Formatting**: Automatically determines when to use function calls vs. direct responses
- **User-Friendly Action Responses**: Provides clear, conversational confirmations when actions are performed

### New Slack Capabilities

The bot now supports:
- Creating and managing channels
- Sending messages to channels and users
- Uploading and managing files
- Adding reactions to messages
- Setting reminders
- And more!

## Why Synaptic Slack Bot v2?

Traditional AI assistants often require users to switch contexts, leaving their workflow to access AI capabilities. Synaptic Slack Bot v2 brings AI directly into your team's communication flow, enabling:

- **Instant AI assistance** within Slack threads and channels
- **Consistent AI access** across the organization with shared context
- **Custom actions** through function calling to integrate with your tools
- **Flexible model selection** to optimize for cost, speed, or capabilities

## Use Cases

- **Workspace Management**: Create channels, invite users, and manage Slack workspace directly
- **Knowledge Base Queries**: Ask questions about company documentation, policies, or technical information
- **Content Generation**: Create drafts, summaries, or creative content directly in Slack
- **Data Analysis**: Request analysis of data shared in conversations
- **Custom Workflows**: Trigger specific actions in your systems through function calling
- **Meeting Summaries**: Generate concise summaries of meeting transcripts shared in Slack
- **Code Assistance**: Get help with coding problems or generate code snippets

## Features

- Integration with Slack's API using Bolt framework
- Support for multiple AI providers through OpenRouter
- Function calling capabilities with MCP server
- Conversation context management for coherent multi-turn interactions
- Rich message formatting with Block Kit
- Comprehensive error handling and logging
- Configurable model selection based on task requirements

## Technical Architecture

Synaptic Slack Bot v2 is built with a modular architecture that separates concerns and allows for easy extension:

1. **Slack Integration Layer**: Handles all communication with the Slack API
2. **Feature Modules**: Implements specific Slack capabilities (channels, messages, files, etc.)
3. **AI Provider Layer**: Manages connections to AI services through OpenRouter
4. **AI Actions Layer**: Provides a "brains" layer for understanding and executing user requests
5. **Context Management**: Maintains conversation history for coherent interactions
6. **Function Calling System**: Enables the AI to trigger specific actions in your systems
7. **Configuration Layer**: Provides flexible configuration options

## Prerequisites

- Node.js 16+ installed
- npm 7+ installed
- Slack workspace with admin access
- OpenRouter API key ([Get one here](https://openrouter.ai/))
- MCP server access (optional, for custom function calling)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/v4lheru/Synaptic-Slack-Bot.git
   cd Synaptic-Slack-Bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the required environment variables:
   ```
   # Slack Credentials
   SLACK_BOT_TOKEN=xoxb-your-token
   SLACK_SIGNING_SECRET=your-signing-secret
   SLACK_APP_TOKEN=xapp-your-app-token

   # OpenRouter API Key
   OPENROUTER_API_KEY=your-openrouter-key

   # MCP Configuration
   MCP_SERVER_URL=your-mcp-server-url
   MCP_AUTH_TOKEN=your-mcp-auth-token

   # App Configuration
   NODE_ENV=development
   LOG_LEVEL=debug
   ```

## Running the Bot

### Development Mode

```bash
npm run dev
```

This will start the bot in development mode with hot reloading.

### Production Mode

```bash
npm run build
npm start
```

This will build the TypeScript code and start the bot in production mode.

## Deployment on Railway

This project includes configuration files for deploying on Railway:

1. `railway.json` - Configuration for Railway deployment
2. `Procfile` - Process file for Railway

To deploy on Railway:

1. Push your code to a GitHub repository
2. Create a new project on Railway from the GitHub repository
3. Set up the environment variables in the Railway dashboard
4. Deploy the project

## Project Structure

```
src/
├── index.ts                # Main entry point
├── ai/                     # AI provider implementations
│   ├── actions/            # AI action layer for executing requests
│   ├── interfaces/         # Common interfaces
│   ├── openrouter/         # OpenRouter implementation
│   └── context/            # Conversation context management
├── slack/                  # Slack integration
│   ├── app.ts              # Slack app configuration
│   ├── events/             # Event handlers
│   ├── features/           # Feature modules (channels, messages, etc.)
│   ├── middleware/         # Middleware functions
│   └── utils/              # Slack utilities
├── mcp/                    # MCP integration
│   ├── client.ts           # MCP client
│   ├── auth.ts             # Authentication
│   ├── slack-functions.ts  # Slack-specific function definitions
│   └── function-calling.ts # Function calling
├── config/                 # Configuration
│   ├── environment.ts      # Environment variables
│   └── constants.ts        # Application constants
└── utils/                  # Shared utilities
    ├── logger.ts           # Logging
    └── error-handler.ts    # Error handling
```

## Interacting with the Bot

Once deployed, you can interact with Synaptic Slack Bot v2 in several ways:

1. **Direct Messages**: Send a DM to the bot for private conversations
2. **Mentions**: Mention the bot in a channel using `@Synaptic Slack Bot v2`
3. **Threads**: The bot can participate in conversation threads

Example interactions:

- `@Synaptic Slack Bot v2 create a channel called project-discussion`
- `@Synaptic Slack Bot v2 send a message to #general saying Hello everyone!`
- `@Synaptic Slack Bot v2 write a haiku about Slack`
- `@Synaptic Slack Bot v2 add a thumbs-up reaction to the last message`
- `@Synaptic Slack Bot v2 set a reminder for @user to review the PR in 2 hours`

## Extending Functionality

Synaptic Slack Bot v2 is designed to be extensible. You can:

1. **Add Custom Functions**: Extend the function calling system to add new capabilities
2. **Integrate New AI Providers**: Add support for additional AI providers
3. **Customize Response Formatting**: Modify how responses are presented in Slack
4. **Add New Feature Modules**: Implement additional Slack features

See the `Instructions for LLM.md` file for detailed guidance on working with the AI integration.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Testing

```bash
npm test
```

## License

MIT

## Acknowledgments

- [OpenRouter](https://openrouter.ai/) for providing access to multiple AI models
- [Slack Bolt Framework](https://slack.dev/bolt-js/concepts) for simplifying Slack app development
