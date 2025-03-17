/**
 * Block Kit Utilities
 * 
 * This module provides utilities for building Slack Block Kit UI components.
 * It includes functions for creating various block types and composing them into messages.
 */

import { logger, logEmoji } from '../../utils/logger';

/**
 * Block types
 */
export enum BlockType {
    SECTION = 'section',
    DIVIDER = 'divider',
    IMAGE = 'image',
    ACTIONS = 'actions',
    CONTEXT = 'context',
    HEADER = 'header',
    INPUT = 'input',
}

/**
 * Element types
 */
export enum ElementType {
    BUTTON = 'button',
    STATIC_SELECT = 'static_select',
    MULTI_STATIC_SELECT = 'multi_static_select',
    OVERFLOW = 'overflow',
    DATEPICKER = 'datepicker',
    TIMEPICKER = 'timepicker',
    IMAGE = 'image',
    PLAIN_TEXT_INPUT = 'plain_text_input',
}

/**
 * Text types
 */
export enum TextType {
    PLAIN_TEXT = 'plain_text',
    MRKDWN = 'mrkdwn',
}

/**
 * Block interface
 */
export interface Block {
    type: BlockType;
    block_id?: string;
    [key: string]: any;
}

/**
 * Element interface
 */
export interface Element {
    type: ElementType;
    action_id?: string;
    [key: string]: any;
}

/**
 * Text interface
 */
export interface Text {
    type: TextType;
    text: string;
    emoji?: boolean;
    verbatim?: boolean;
}

/**
 * Create a plain text object
 * 
 * @param text The text content
 * @param emoji Whether to enable emoji
 * @returns A plain text object
 */
export function plainText(text: string, emoji: boolean = true): Text {
    return {
        type: TextType.PLAIN_TEXT,
        text,
        emoji,
    };
}

/**
 * Create a markdown text object
 * 
 * @param text The markdown text content
 * @param verbatim Whether to treat the text as verbatim
 * @returns A markdown text object
 */
export function mrkdwn(text: string, verbatim: boolean = false): Text {
    return {
        type: TextType.MRKDWN,
        text,
        verbatim,
    };
}

/**
 * Create a section block
 * 
 * @param text The text content
 * @param blockId Optional block ID
 * @param accessory Optional accessory element
 * @returns A section block
 */
export function section(text: string | Text, blockId?: string, accessory?: Element): Block {
    const textObj = typeof text === 'string' ? mrkdwn(text) : text;

    const block: Block = {
        type: BlockType.SECTION,
        text: textObj,
    };

    if (blockId) {
        block.block_id = blockId;
    }

    if (accessory) {
        block.accessory = accessory;
    }

    return block;
}

/**
 * Create a divider block
 * 
 * @param blockId Optional block ID
 * @returns A divider block
 */
export function divider(blockId?: string): Block {
    const block: Block = {
        type: BlockType.DIVIDER,
    };

    if (blockId) {
        block.block_id = blockId;
    }

    return block;
}

/**
 * Create a header block
 * 
 * @param text The header text
 * @param blockId Optional block ID
 * @returns A header block
 */
export function header(text: string, blockId?: string): Block {
    const block: Block = {
        type: BlockType.HEADER,
        text: plainText(text),
    };

    if (blockId) {
        block.block_id = blockId;
    }

    return block;
}

/**
 * Create an image block
 * 
 * @param imageUrl The image URL
 * @param altText The alt text
 * @param title Optional title
 * @param blockId Optional block ID
 * @returns An image block
 */
export function image(imageUrl: string, altText: string, title?: string, blockId?: string): Block {
    const block: Block = {
        type: BlockType.IMAGE,
        image_url: imageUrl,
        alt_text: altText,
    };

    if (title) {
        block.title = plainText(title);
    }

    if (blockId) {
        block.block_id = blockId;
    }

    return block;
}

/**
 * Create a context block
 * 
 * @param elements The context elements (text or images)
 * @param blockId Optional block ID
 * @returns A context block
 */
export function context(elements: (Text | Element)[], blockId?: string): Block {
    const block: Block = {
        type: BlockType.CONTEXT,
        elements,
    };

    if (blockId) {
        block.block_id = blockId;
    }

    return block;
}

/**
 * Create an actions block
 * 
 * @param elements The action elements
 * @param blockId Optional block ID
 * @returns An actions block
 */
export function actions(elements: Element[], blockId?: string): Block {
    const block: Block = {
        type: BlockType.ACTIONS,
        elements,
    };

    if (blockId) {
        block.block_id = blockId;
    }

    return block;
}

/**
 * Create a button element
 * 
 * @param text The button text
 * @param actionId The action ID
 * @param value The button value
 * @param style Optional button style ('primary', 'danger', or undefined for default)
 * @returns A button element
 */
export function button(text: string, actionId: string, value: string, style?: 'primary' | 'danger'): Element {
    const element: Element = {
        type: ElementType.BUTTON,
        text: plainText(text),
        action_id: actionId,
        value,
    };

    if (style) {
        element.style = style;
    }

    return element;
}

/**
 * Create a select menu option
 * 
 * @param text The option text
 * @param value The option value
 * @returns A select menu option
 */
export function option(text: string, value: string): { text: Text; value: string } {
    return {
        text: plainText(text),
        value,
    };
}

/**
 * Create a select menu element
 * 
 * @param placeholder The placeholder text
 * @param actionId The action ID
 * @param options The select options
 * @param initialOption Optional initial option value
 * @returns A select menu element
 */
export function select(
    placeholder: string,
    actionId: string,
    options: { text: Text; value: string }[],
    initialOption?: { text: Text; value: string }
): Element {
    const element: Element = {
        type: ElementType.STATIC_SELECT,
        placeholder: plainText(placeholder),
        action_id: actionId,
        options,
    };

    if (initialOption) {
        element.initial_option = initialOption;
    }

    return element;
}

/**
 * Create a message with blocks
 * 
 * @param blocks The message blocks
 * @param text Optional fallback text
 * @returns A message object
 */
export function message(blocks: Block[], text?: string): { blocks: Block[]; text?: string } {
    const msg: { blocks: Block[]; text?: string } = { blocks };

    if (text) {
        msg.text = text;
    }

    return msg;
}

/**
 * Create a simple text message with optional formatting
 * 
 * @param text The message text
 * @param isMarkdown Whether to use markdown formatting
 * @returns A message object
 */
export function textMessage(text: string, isMarkdown: boolean = true): { blocks: Block[]; text: string } {
    return {
        blocks: [
            section(isMarkdown ? mrkdwn(text) : plainText(text)),
        ],
        text: text,
    };
}

/**
 * Create an error message
 * 
 * @param title The error title
 * @param message The error message
 * @param details Optional error details
 * @returns A message object
 */
export function errorMessage(
    title: string,
    message: string,
    details?: string
): { blocks: Block[]; text: string } {
    const blocks: Block[] = [
        header(`❌ ${title}`),
        section(message),
    ];

    if (details) {
        blocks.push(
            divider(),
            context([mrkdwn(`*Details:* ${details}`)]),
        );
    }

    return {
        blocks,
        text: `Error: ${title} - ${message}`,
    };
}

/**
 * Create a success message
 * 
 * @param title The success title
 * @param message The success message
 * @returns A message object
 */
export function successMessage(
    title: string,
    message: string
): { blocks: Block[]; text: string } {
    return {
        blocks: [
            header(`✅ ${title}`),
            section(message),
        ],
        text: `Success: ${title} - ${message}`,
    };
}

/**
 * Create a loading message
 * 
 * @param message The loading message
 * @returns A message object
 */
export function loadingMessage(message: string = 'Processing your request...'): { blocks: Block[]; text: string } {
    return {
        blocks: [
            section(`⏳ ${message}`),
        ],
        text: message,
    };
}

/**
 * Create an AI response message
 * 
 * @param content The AI response content
 * @param metadata Optional metadata to display
 * @param functionResults Optional function call results
 * @returns A message object
 */
export function aiResponseMessage(
    content: string,
    metadata?: Record<string, any>,
    functionResults?: string[]
): { blocks: Block[]; text: string } {
    // Import the convertMarkdownToSlackFormatting function
    const { convertMarkdownToSlackFormatting } = require('../../ai/openrouter/formatter');

    // Ensure content is not empty
    let safeContent = content && content.trim() ? content : "I don't have a response at this time.";

    // Convert any Markdown formatting to Slack formatting
    safeContent = convertMarkdownToSlackFormatting(safeContent);

    const blocks: Block[] = [
        section(safeContent),
    ];

    // Add function results if provided
    if (functionResults && functionResults.length > 0) {
        blocks.push(divider());

        for (const result of functionResults) {
            if (result && result.trim()) {
                blocks.push(
                    section(mrkdwn(`\`\`\`\n${result}\n\`\`\``)),
                );
            }
        }
    }

    // Add metadata if provided
    if (metadata && Object.keys(metadata).length > 0) {
        blocks.push(
            divider(),
            context([
                mrkdwn(`*Model:* ${metadata.model || 'Unknown'}`),
            ]),
        );
    }

    // Add feedback buttons
    blocks.push(
        divider(),
        actions([
            button('👍 Helpful', 'feedback_helpful', 'helpful'),
            button('👎 Not Helpful', 'feedback_not_helpful', 'not_helpful'),
        ]),
    );

    return {
        blocks,
        text: safeContent.substring(0, 100) + (safeContent.length > 100 ? '...' : ''),
    };
}
