import { IndexData, RawDayData } from '@/types';

export const MOCK_INDEX_DATA: IndexData = {
  account_owner: 'mock_user',
  users: [
    {
      username: 'mock_user',
      display_name: 'Mock User',
      bitmoji: '/avatars/mock_user.png',
    },
    {
      username: 'friend_one',
      display_name: 'Friend One',
      bitmoji: '/avatars/friend_one.png',
    },
    {
      username: 'friend_two',
      display_name: 'Friend Two',
      bitmoji: '/avatars/friend_two.png',
    },
  ],
  groups: [
    {
      group_id: 'mock-group-1',
      name: 'Weekend Crew',
      members: ['mock_user', 'friend_one', 'friend_two'],
    },
  ],
};

const mockDay: RawDayData = {
  date: '2025-07-27',
  stats: {
    conversationCount: 2,
    messageCount: 5,
    mediaCount: 2,
  },
  conversations: [
    {
      id: 'mock-conversation-1',
      conversation_id: 'friend_one',
      conversation_type: 'individual',
      messages: [
        {
          From: 'friend_one',
          'Media Type': 'TEXT',
          Created: '2025-07-27T14:00:00Z',
          Content: "Hey! Did you see the photos from yesterday?",
          'Conversation Title': null,
          IsSender: false,
          IsSaved: false,
          'Media IDs': '',
          Type: 'CHAT',
          media_locations: [],
        },
        {
          From: 'mock_user',
          'Media Type': 'TEXT',
          Created: '2025-07-27T14:02:00Z',
          Content: "Not yet! Can you send them here?",
          'Conversation Title': null,
          IsSender: true,
          IsSaved: false,
          'Media IDs': '',
          Type: 'CHAT',
          media_locations: [],
        },
        {
          From: 'friend_one',
          'Media Type': 'IMAGE',
          Created: '2025-07-27T14:05:00Z',
          Content: 'Check out this one!',
          'Conversation Title': null,
          IsSender: false,
          IsSaved: false,
          'Media IDs': 'mock-image-1',
          Type: 'CHAT',
          media_locations: ['media/mock-image-1.jpg'],
        },
      ],
    },
    {
      id: 'mock-group-1',
      conversation_id: 'mock-group-1',
      conversation_type: 'group',
      group_name: 'Weekend Crew',
      messages: [
        {
          From: 'friend_two',
          'Media Type': 'TEXT',
          Created: '2025-07-27T16:30:00Z',
          Content: "Who's up for brunch tomorrow?",
          'Conversation Title': 'Weekend Crew',
          IsSender: false,
          IsSaved: false,
          'Media IDs': '',
          Type: 'CHAT',
          media_locations: [],
        },
        {
          From: 'mock_user',
          'Media Type': 'AUDIO',
          Created: '2025-07-27T16:32:00Z',
          Content: 'Shared a voice note',
          'Conversation Title': 'Weekend Crew',
          IsSender: true,
          IsSaved: false,
          'Media IDs': 'mock-audio-1',
          Type: 'CHAT',
          media_locations: ['media/mock-audio-1.mp3'],
        },
      ],
    },
  ],
  orphanedMedia: {
    orphaned_media_count: 1,
    orphaned_media: [
      {
        path: 'orphaned/mock-orphaned-image.jpg',
        filename: 'mock-orphaned-image.jpg',
        type: 'IMAGE',
        extension: 'jpg',
      },
    ],
  },
};

export const MOCK_DAY_DATA_BY_DATE: Record<string, RawDayData> = {
  [mockDay.date]: mockDay,
};

export const MOCK_AVAILABLE_DATES = Object.keys(MOCK_DAY_DATA_BY_DATE);
