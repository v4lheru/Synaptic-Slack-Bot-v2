/**
 * OpenRouter Message Formatter
 * 
 * This module provides utilities for formatting messages for the OpenRouter API.
 * It handles different formatting requirements for various models.
 */

import { ConversationMessage, MessageContent, TextContent, ImageContent } from '../interfaces/provider';
import { OpenRouterModelId } from './models';
import { logger, logEmoji } from '../../utils/logger';

/**
 * Maximum number of messages to include in conversation history
 * This helps prevent exceeding token limits
 */
const MAX_CONVERSATION_MESSAGES = 0; // No history to minimize token usage

/**
 * Format conversation history for OpenRouter API
 * 
 * @param messages Array of conversation messages
 * @param modelId The model ID to format for
 * @returns Formatted messages for the OpenRouter API
 */
export function formatConversationHistory(
    messages: ConversationMessage[],
    modelId: string = OpenRouterModelId.GPT4_TURBO
): ConversationMessage[] {
    try {
        // Limit the number of messages to prevent exceeding token limits
        const limitedMessages = messages.slice(-MAX_CONVERSATION_MESSAGES);

        // Apply model-specific formatting
        if (modelId.startsWith('anthropic/')) {
            return formatForAnthropic(limitedMessages);
        } else if (modelId.startsWith('google/')) {
            return formatForGoogle(limitedMessages);
        } else {
            // Default formatting (works for OpenAI, Meta, Mistral, etc.)
            return limitedMessages;
        }
    } catch (error) {
        logger.error(`${logEmoji.error} Error formatting conversation history`, { error });
        // Return original messages as fallback
        return messages;
    }
}

/**
 * Format messages for Anthropic models
 * 
 * @param messages Array of conversation messages
 * @returns Formatted messages for Anthropic models
 */
function formatForAnthropic(messages: ConversationMessage[]): ConversationMessage[] {
    // Anthropic models require alternating user/assistant messages
    // Ensure we don't have consecutive messages from the same role
    const formattedMessages: ConversationMessage[] = [];

    for (let i = 0; i < messages.length; i++) {
        const currentMessage = messages[i];
        const prevMessage = formattedMessages[formattedMessages.length - 1];

        // If this message has the same role as the previous one, combine them
        if (prevMessage && prevMessage.role === currentMessage.role) {
            prevMessage.content += `\n\n${currentMessage.content}`;
        } else {
            formattedMessages.push({ ...currentMessage });
        }
    }

    return formattedMessages;
}

/**
 * Format messages for Google models
 * 
 * @param messages Array of conversation messages
 * @returns Formatted messages for Google models
 */
function formatForGoogle(messages: ConversationMessage[]): ConversationMessage[] {
    // Google models have specific requirements for system messages
    // Convert system messages to user messages with a special prefix
    return messages.map(message => {
        if (message.role === 'system') {
            return {
                role: 'user',
                content: `<system>\n${message.content}\n</system>`,
                name: message.name,
                timestamp: message.timestamp,
            };
        }
        return { ...message };
    });
}

/**
 * Create a system message with appropriate instructions
 * 
 * @param instructions System instructions for the AI
 * @returns A system message
 */
export function createSystemMessage(instructions: string): ConversationMessage {
    return {
        role: 'system',
        content: instructions,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Create a text content object
 * 
 * @param text The text content
 * @returns A text content object
 */
export function createTextContent(text: string): TextContent {
    return {
        type: 'text',
        text,
    };
}

/**
 * Create an image content object
 * 
 * @param imageUrl The image URL
 * @param detail Optional detail level
 * @returns An image content object
 */
export function createImageContent(imageUrl: string, detail: 'low' | 'high' | 'auto' = 'auto'): ImageContent {
    return {
        type: 'image_url',
        image_url: {
            url: imageUrl,
            detail,
        },
    };
}

/**
 * Default system message for the Slack bot
 */
export const DEFAULT_SYSTEM_MESSAGE = createSystemMessage(
    `You are a Slack AI assistant. Be helpful, concise, and friendly.
    
    CRITICAL FORMATTING INSTRUCTIONS:
    ALL responses MUST use Slack formatting, NOT Markdown. Format all responses using Slack syntax:
    
    *bold text* for emphasis (ONE ASTERISK ONLY)
    _italic text_ for definitions
    ~strikethrough~ when needed
    \`code snippets\` for technical terms
    • Use manual bullet points (not - or *)
    <URL|text> for links with custom text
    >text for quotes or important callouts
    
    SACROSANCT ONLY USE SLACK MARKUP - all responses must be formatted for Slack display only.
    
    TASKS: For multi-step tasks: 1) Break into steps, 2) Execute sequentially with functions, 3) For meeting summaries, create summary then post to appropriate channel, 4) No explanations - just execute, 5) Be token-efficient.
    
    Call functions when needed to perform actions.`
);

/**
 * Create a user message
 * 
 * @param content Message content (text or multimodal)
 * @param name Optional user name
 * @returns A user message
 */
export function createUserMessage(
    content: string | MessageContent[],
    name?: string
): ConversationMessage {
    return {
        role: 'user',
        content,
        name,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Convert Markdown formatting to Slack formatting
 * 
 * @param content The content with potential Markdown formatting
 * @returns The content with Slack formatting
 */
export function convertMarkdownToSlackFormatting(content: string): string {
    if (!content) return content;

    // Replace Markdown bold (**text**) with Slack bold (*text*)
    content = content.replace(/\*\*(.*?)\*\*/g, '*$1*');

    // Replace Markdown italic (_text_ or *text*) with Slack italic (_text_)
    // Only replace *text* for italic if it's not already used for bold (i.e., not preceded or followed by another *)
    content = content.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '_$1_');

    // Replace Markdown links with Slack links
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<$2|$1>');

    // Replace Markdown bullet points with Slack bullet points
    content = content.replace(/^[ \t]*[-*][ \t]+/gm, '• ');

    // Replace Markdown code blocks with Slack code blocks
    content = content.replace(/```([^`]*?)```/gs, '```$1```');

    // Replace Markdown blockquotes with Slack blockquotes
    content = content.replace(/^>\s*(.*?)$/gm, '>$1');

    // Replace Markdown strikethrough with Slack strikethrough
    content = content.replace(/~~(.*?)~~/g, '~$1~');

    return content;
}

/**
 * Create an assistant message
 * 
 * @param content Message content
 * @returns An assistant message
 */
export function createAssistantMessage(content: string): ConversationMessage {
    // Convert any Markdown formatting to Slack formatting
    const formattedContent = convertMarkdownToSlackFormatting(content);

    return {
        role: 'assistant',
        content: formattedContent,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Create a multimodal user message with text and images
 * 
 * @param text The text content
 * @param imageUrls Array of image URLs
 * @param name Optional user name
 * @returns A multimodal user message
 */
export function createMultimodalUserMessage(
    text: string,
    imageUrls: string[],
    name?: string
): ConversationMessage {
    const content: MessageContent[] = [createTextContent(text)];

    // Add image content for each image URL
    for (const imageUrl of imageUrls) {
        content.push(createImageContent(imageUrl));
    }

    return {
        role: 'user',
        content,
        name,
        timestamp: new Date().toISOString(),
    };
}
