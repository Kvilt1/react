import { IndexData, RawDayData } from '@/types';

export const mockAvailableDates = ['2025-08-24', '2025-08-25'];

export const mockIndexData: IndexData = {
  account_owner: 'mock_user',
  users: [
    {
      username: 'mock_user',
      display_name: 'Mock User',
      bitmoji: '',
    },
    {
      username: 'friend_one',
      display_name: 'Friend One',
      bitmoji: '',
    },
    {
      username: 'friend_two',
      display_name: 'Friend Two',
      bitmoji: '',
    },
  ],
  groups: [
    {
      group_id: 'mock_group',
      name: 'Mock Group',
      members: ['mock_user', 'friend_one', 'friend_two'],
    },
  ],
  available_dates: mockAvailableDates,
};

const baseMessage = {
  'Media IDs': '',
  IsSaved: false,
  media_locations: undefined,
  matched_media_files: undefined,
  is_grouped: false,
  mapping_method: undefined,
};

const mockDayData24: RawDayData = {
  date: '2025-08-24',
  stats: {
    conversationCount: 1,
    messageCount: 3,
    mediaCount: 1,
  },
  conversations: [
    {
      id: 'mock_dm_friend_one',
      conversation_id: 'friend_one',
      conversation_type: 'individual',
      messages: [
        {
          ...baseMessage,
          From: 'friend_one',
          'Media Type': 'TEXT',
          Created: '2025-08-24 09:15:00.000 UTC',
          Content: 'Hey! Testing archive viewer?',
          'Conversation Title': null,
          IsSender: false,
          Type: 'TEXT',
        },
        {
          ...baseMessage,
          From: 'mock_user',
          'Media Type': 'TEXT',
          Created: '2025-08-24 09:17:00.000 UTC',
          Content: 'Yep! Everything looks good.',
          'Conversation Title': null,
          IsSender: true,
          Type: 'TEXT',
        },
        {
          ...baseMessage,
          From: 'mock_user',
          'Media Type': 'IMAGE',
          Created: '2025-08-24 09:20:00.000 UTC',
          Content: 'Check out this screenshot.',
          'Conversation Title': null,
          IsSender: true,
          Type: 'MEDIA',
          media_locations: ['media/mock-image.jpg'],
        },
      ],
    },
  ],
  orphanedMedia: {
    orphaned_media_count: 1,
    orphaned_media: [
      {
        path: 'orphaned/mock-video.mp4',
        filename: 'mock-video.mp4',
        type: 'VIDEO',
        extension: 'mp4',
      },
    ],
  },
};

const mockDayData25: RawDayData = {
  date: '2025-08-25',
  stats: {
    conversationCount: 1,
    messageCount: 2,
    mediaCount: 1,
  },
  conversations: [
    {
      id: 'mock_group',
      conversation_id: 'mock_group',
      conversation_type: 'group',
      group_name: 'Mock Group',
      messages: [
        {
          ...baseMessage,
          From: 'friend_two',
          'Media Type': 'TEXT',
          Created: '2025-08-25 14:05:00.000 UTC',
          Content: "Group chat works too!",
          'Conversation Title': 'Mock Group',
          IsSender: false,
          Type: 'TEXT',
        },
        {
          ...baseMessage,
          From: 'mock_user',
          'Media Type': 'NOTE',
          Created: '2025-08-25 14:06:00.000 UTC',
          Content: 'Voice note check-in.',
          'Conversation Title': 'Mock Group',
          IsSender: true,
          Type: 'NOTE',
          media_locations: ['media/mock-audio.m4a'],
        },
      ],
    },
  ],
};

export const mockDayDataByDate: Record<string, RawDayData> = {
  [mockDayData24.date]: mockDayData24,
  [mockDayData25.date]: mockDayData25,
};
