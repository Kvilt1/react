// Raw data types (as they come from JSON files)
export interface RawMessage {
  From: string;
  'Media Type': string;
  Created: string;
  Content: string;
  'Conversation Title': string | null;
  IsSender: boolean;
  IsSaved: boolean;
  'Media IDs': string;
  Type: string;
  media_locations?: string[];
  matched_media_files?: string[];
  is_grouped?: boolean;
  mapping_method?: string;
}

export interface RawConversation {
  id: string;
  conversation_id: string;
  conversation_type: 'individual' | 'group';
  messages: RawMessage[];
  group_name?: string;
}

export interface RawDayData {
  date: string;
  stats: {
    conversationCount: number;
    messageCount: number;
    mediaCount: number;
  };
  conversations: RawConversation[];
  orphanedMedia?: {
    orphaned_media_count: number;
    orphaned_media: {
      path: string;
      filename: string;
      type: string;
      extension: string;
    }[];
  };
}

export interface IndexUser {
  username: string;
  display_name: string;
}

export interface IndexGroup {
  group_id: string;
  name: string;
  members: string[];
}

export interface IndexData {
  account_owner: string;
  users: IndexUser[];
  groups: IndexGroup[];
}

// Normalized data types (used by the app)
export interface Participant {
  username: string;
  display_name: string;
}

export interface Message {
  from_user: string;
  is_sender: boolean;
  content: string;
  created: string;
  media_type: string;
  message_type: string;
  media_ids?: string;
  media_locations?: string[];
}

export interface ConversationStats {
  message_count: number;
  date_range: {
    first_message: string;
    last_message: string;
  };
}

export interface ConversationMetadata {
  participants: Participant[];
}

export interface Conversation {
  id: string;
  name: string;
  type: 'dm' | 'group';
  dir: string;
  messages: Message[];
  stats: ConversationStats;
  metadata: ConversationMetadata;
}

export interface OrphanedMediaItem {
  path: string;
  filename: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  extension: string;
}

export interface OrphanedMedia {
  orphaned_media_count: number;
  orphaned_media: OrphanedMediaItem[];
}

export interface DayData {
  date: string;
  conversations: Conversation[];
  orphanedMedia: OrphanedMedia | null;
  stats: {
    conversationCount: number;
    messageCount: number;
    mediaCount: number;
  };
}

export type MediaFilter = 'all' | 'IMAGE' | 'VIDEO';

export interface MediaItem {
  type: string;
  path: string;
  message_id: string;
  date: string;
  sender: string;
  media_type: string;
}
