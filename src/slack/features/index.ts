/**
 * Slack Features
 * 
 * This module exports all the feature classes that implement various Slack permissions.
 */

import { App } from '@slack/bolt';
import { ChannelFeatures } from './channels';
import { MessageFeatures } from './messages';
import { DirectMessageFeatures } from './direct-messages';
import { FileFeatures } from './files';
import { ReactionFeatures } from './reactions';
import { ReminderFeatures } from './reminders';
import { UserFeatures } from './users';
import { AdminFeatures } from './admin';
import { SearchFeatures } from './search';
import { BookmarkFeatures } from './bookmarks';

/**
 * SlackFeatures class that provides access to all feature classes
 */
export class SlackFeatures {
    public channels: ChannelFeatures;
    public messages: MessageFeatures;
    public directMessages: DirectMessageFeatures;
    public files: FileFeatures;
    public reactions: ReactionFeatures;
    public reminders: ReminderFeatures;
    public users: UserFeatures;
    public admin: AdminFeatures;
    public search: SearchFeatures;
    public bookmarks: BookmarkFeatures;

    /**
     * Create a new SlackFeatures instance
     * 
     * @param app The Slack app
     */
    constructor(app: App) {
        this.channels = new ChannelFeatures(app);
        this.messages = new MessageFeatures(app);
        this.directMessages = new DirectMessageFeatures(app);
        this.files = new FileFeatures(app);
        this.reactions = new ReactionFeatures(app);
        this.reminders = new ReminderFeatures(app);
        this.users = new UserFeatures(app);
        this.admin = new AdminFeatures(app);
        this.search = new SearchFeatures(app);
        this.bookmarks = new BookmarkFeatures(app);
    }
}

// Export individual feature classes
export { ChannelFeatures } from './channels';
export { MessageFeatures } from './messages';
export { DirectMessageFeatures } from './direct-messages';
export { FileFeatures } from './files';
export { ReactionFeatures } from './reactions';
export { ReminderFeatures } from './reminders';
export { UserFeatures } from './users';
export { AdminFeatures } from './admin';
export { SearchFeatures } from './search';
export { BookmarkFeatures } from './bookmarks';

// Create and export a singleton instance
let slackFeatures: SlackFeatures | null = null;

/**
 * Initialize the Slack features
 * 
 * @param app The Slack app
 * @returns The SlackFeatures instance
 */
export function initializeFeatures(app: App): SlackFeatures {
    if (!slackFeatures) {
        slackFeatures = new SlackFeatures(app);
    }
    return slackFeatures;
}

/**
 * Get the Slack features instance
 * 
 * @returns The SlackFeatures instance
 * @throws Error if the features have not been initialized
 */
export function getFeatures(): SlackFeatures {
    if (!slackFeatures) {
        throw new Error('Slack features have not been initialized. Call initializeFeatures first.');
    }
    return slackFeatures;
}
