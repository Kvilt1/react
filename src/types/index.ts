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
