import {
  RawDayData,
  RawConversation,
  RawMessage,
  IndexData,
  DayData,
  Conversation,
  Message,
  Participant,
  OrphanedMedia,
} from '@/types';

/**
 * Transforms raw conversation data from JSON to normalized app format
 */
export function transformDayData(
  rawData: RawDayData,
  indexData: IndexData
): DayData {
  const conversations = rawData.conversations
    .map((rawConv) => transformConversation(rawConv, indexData, rawData.date))
    .filter((conv) => conv.messages.length > 0); // Filter out conversations with no messages (after STATUS filtering)

  const orphanedMedia: OrphanedMedia | null = rawData.orphanedMedia
    ? {
        orphaned_media_count: rawData.orphanedMedia.orphaned_media_count,
        orphaned_media: rawData.orphanedMedia.orphaned_media.map((item) => ({
          path: `/days/${rawData.date}/${item.path}`,
          filename: item.filename,
          type: item.type as 'IMAGE' | 'VIDEO' | 'AUDIO',
          extension: item.extension,
        })),
      }
    : null;

  // Recalculate stats to exclude STATUS messages
  const recalculatedStats = {
    conversationCount: conversations.length,
    messageCount: conversations.reduce((total, conv) => total + conv.messages.length, 0),
    mediaCount: conversations.reduce((total, conv) =>
      total + conv.messages.filter(msg => msg.media_locations && msg.media_locations.length > 0).length, 0
    ),
  };

  return {
    date: rawData.date,
    conversations,
    orphanedMedia,
    stats: recalculatedStats,
  };
}

/**
 * Transforms a single conversation
 */
function transformConversation(
  rawConv: RawConversation,
  indexData: IndexData,
  date: string
): Conversation {
  const isGroup = rawConv.conversation_type === 'group';
  // Filter out STATUS messages
  const messages = rawConv.messages
    .filter((msg) => msg['Media Type'] !== 'STATUS')
    .map((msg) => transformMessage(msg));

  // Build participant list
  const participants = buildParticipants(rawConv, indexData);

  // Calculate stats (using filtered messages)
  const stats = {
    message_count: messages.length,
    date_range: {
      first_message: messages[0]?.created || '',
      last_message: messages[messages.length - 1]?.created || '',
    },
  };

  // Build conversation name
  let name = '';
  if (isGroup) {
    name = `${rawConv.group_name || 'Unknown Group'}`;
  } else {
    const participant = participants[0];
    const displayName =
      participant?.display_name === 'NOT FOUND IN FRIENDS LIST'
        ? participant.username
        : participant?.display_name || participant?.username || 'Unknown';
    name = `Chat - ${displayName}`;
  }

  return {
    id: rawConv.id,
    name,
    type: isGroup ? 'group' : 'dm',
    dir: `/days/${date}`,
    messages,
    stats,
    metadata: {
      participants,
    },
  };
}

/**
 * Transforms a single message
 */
function transformMessage(rawMsg: RawMessage): Message {
  return {
    from_user: rawMsg.From,
    is_sender: rawMsg.IsSender,
    content: rawMsg.Content,
    created: rawMsg.Created,
    media_type: rawMsg['Media Type'],
    message_type: rawMsg.Type,
    media_ids: rawMsg['Media IDs'],
    media_locations: rawMsg.media_locations,
  };
}

/**
 * Builds participant list for a conversation
 */
function buildParticipants(
  rawConv: RawConversation,
  indexData: IndexData
): Participant[] {
  if (rawConv.conversation_type === 'individual') {
    // For individual chats, the conversation_id is the username
    const username = rawConv.conversation_id;
    const user = indexData.users.find((u) => u.username === username);

    if (user) {
      return [
        {
          username: user.username,
          display_name: user.display_name,
        },
      ];
    }

    // User not found in index
    return [
      {
        username: username,
        display_name: 'NOT FOUND IN FRIENDS LIST',
      },
    ];
  } else {
    // For group chats, find the group and get all members
    const group = indexData.groups.find(
      (g) => g.group_id === rawConv.id || g.name === rawConv.group_name
    );

    if (group) {
      return group.members.map((memberUsername) => {
        const user = indexData.users.find((u) => u.username === memberUsername);
        return {
          username: memberUsername,
          display_name: user?.display_name || memberUsername,
        };
      });
    }

    // Group not found, extract unique participants from messages
    const uniqueUsers = new Set<string>();
    rawConv.messages.forEach((msg) => {
      uniqueUsers.add(msg.From);
    });

    return Array.from(uniqueUsers).map((username) => {
      const user = indexData.users.find((u) => u.username === username);
      return {
        username,
        display_name: user?.display_name || username,
      };
    });
  }
}
