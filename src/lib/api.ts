import { DayData, IndexData } from '@/types';
import { loadDayData, getAvailableDates } from './dataLoader';
import { transformDayData } from './dataTransformer';

/**
 * Fetches and transforms day data for a specific date
 */
export async function fetchDayData(
  date: string,
  indexData: IndexData
): Promise<DayData> {
  const rawData = await loadDayData(date);
  return transformDayData(rawData, indexData);
}

/**
 * Gets all dates where a specific conversation has activity
 */
export async function getConversationActivity(
  conversationId: string,
  indexData: IndexData
): Promise<string[]> {
  const allDates = await getAvailableDates();
  const activeDates: string[] = [];

  for (const date of allDates) {
    const dateStr = date.toISOString().split('T')[0];
    try {
      const dayData = await fetchDayData(dateStr, indexData);
      // Check if this conversation exists on this date
      const hasConversation = dayData.conversations.some(conv => conv.id === conversationId);
      if (hasConversation) {
        activeDates.push(dateStr);
      }
    } catch (error) {
      console.error(`Failed to check conversation activity for ${dateStr}:`, error);
    }
  }

  // Sort dates chronologically
  return activeDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
}

/**
 * Gets aggregate statistics for a specific conversation across all dates
 */
export async function getConversationStats(
  conversationId: string,
  indexData: IndexData
): Promise<{
  totalMessages: number;
  totalMedia: number;
  firstMessage: string | null;
  lastMessage: string | null;
  activeDays: number;
}> {
  const activeDates = await getConversationActivity(conversationId, indexData);

  let totalMessages = 0;
  let totalMedia = 0;
  let firstMessage: string | null = null;
  let lastMessage: string | null = null;

  for (const dateStr of activeDates) {
    try {
      const dayData = await fetchDayData(dateStr, indexData);
      const conversation = dayData.conversations.find(conv => conv.id === conversationId);

      if (conversation) {
        totalMessages += conversation.messages.length;
        totalMedia += conversation.messages.filter(m =>
          m.media_locations && m.media_locations.length > 0
        ).length;

        // Track first and last message dates
        if (conversation.messages.length > 0) {
          const firstInDay = conversation.messages[0].created;
          const lastInDay = conversation.messages[conversation.messages.length - 1].created;

          if (!firstMessage || new Date(firstInDay) < new Date(firstMessage)) {
            firstMessage = firstInDay;
          }
          if (!lastMessage || new Date(lastInDay) > new Date(lastMessage)) {
            lastMessage = lastInDay;
          }
        }
      }
    } catch (error) {
      console.error(`Failed to get stats for ${dateStr}:`, error);
    }
  }

  return {
    totalMessages,
    totalMedia,
    firstMessage,
    lastMessage,
    activeDays: activeDates.length,
  };
}
