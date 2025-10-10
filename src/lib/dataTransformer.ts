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
  // Create lookup maps for efficient access
  const userMap = new Map(
    indexData.users.map((u) => [u.username, u.display_name])
  );
  const groupMap = new Map(indexData.groups.map((g) => [g.group_id, g]));
  const groupNameMap = new Map(indexData.groups.map((g) => [g.name, g]));

  const conversations = rawData.conversations.map((rawConv) =>
    transformConversation(rawConv, { userMap, groupMap, groupNameMap }, rawData.date)
  );

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

  return {
    date: rawData.date,
    conversations,
    orphanedMedia,
    stats: rawData.stats,
  };
}

/**
 * Transforms a single conversation
 */
function transformConversation(
  rawConv: RawConversation,
  maps: {
    userMap: Map<string, string>;
    groupMap: Map<string, any>;
    groupNameMap: Map<string, any>;
  },
  date: string
): Conversation {
  const isGroup = rawConv.conversation_type === 'group';
  const messages = rawConv.messages.map((msg) => transformMessage(msg));

  // Build participant list
  const participants = buildParticipants(rawConv, maps);

  // Calculate stats
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
  maps: {
    userMap: Map<string, string>;
    groupMap: Map<string, any>;
    groupNameMap: Map<string, any>;
  }
): Participant[] {
  const { userMap, groupMap, groupNameMap } = maps;

  if (rawConv.conversation_type === 'individual') {
    const username = rawConv.conversation_id;
    const displayName = userMap.get(username);

    if (displayName) {
      return [{ username, display_name: displayName }];
    }

    return [{ username, display_name: 'NOT FOUND IN FRIENDS LIST' }];
  } else {
    // For group chats, find the group and get all members
    const group =
      groupMap.get(rawConv.id) || groupNameMap.get(rawConv.group_name || '');

    if (group) {
      return group.members.map((username: string) => ({
        username,
        display_name: userMap.get(username) || username,
      }));
    }

    // Group not found, extract unique participants from messages
    const uniqueUsernames = new Set(rawConv.messages.map((msg) => msg.From));
    return Array.from(uniqueUsernames).map((username) => ({
      username,
      display_name: userMap.get(username) || username,
    }));
  }
}
