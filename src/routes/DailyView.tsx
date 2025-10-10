import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { fetchDayData } from '@/lib/api';
import { loadIndexData } from '@/lib/dataLoader';
import { DayData } from '@/types';
import { useArchiveStore } from '@/store/useArchiveStore';
import DailyHeader from '@/components/DailyHeader';
import ConversationList from '@/components/ConversationList';
import MainContent from '@/components/MainContent';
import Lightbox from '@/components/Lightbox';
import OrphanedMediaView from '@/components/OrphanedMediaView';
import KeyboardHint from '@/components/KeyboardHint';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';

export default function DailyView() {
  const { date } = useParams<{ date: string }>();
  const location = useLocation();
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOrphanedMedia, setShowOrphanedMedia] = useState(false);
  const indexData = useArchiveStore((state) => state.indexData);
  const setIndexData = useArchiveStore((state) => state.setIndexData);
  const setConversations = useArchiveStore((state) => state.setConversations);
  const setCurrentConversation = useArchiveStore(
    (state) => state.setCurrentConversation
  );
  const setAccountUsername = useArchiveStore(
    (state) => state.setAccountUsername
  );
  const setCurrentDate = useArchiveStore((state) => state.setCurrentDate);
  const mobileView = useArchiveStore((state) => state.mobileView);

  useKeyboardShortcuts();

  // Load index data once on mount
  useEffect(() => {
    const loadIndex = async () => {
      if (!indexData) {
        try {
          const data = await loadIndexData();
          setIndexData(data);
          setAccountUsername(data.account_owner);
        } catch (error) {
          console.error('Failed to load index data:', error);
        }
      }
    };

    loadIndex();
  }, [indexData, setIndexData, setAccountUsername]);

  // Load day data when date changes
  useEffect(() => {
    const loadData = async () => {
      if (!indexData) return; // Wait for index data first
      
      try {
        setLoading(true);
        const currentDate = date || '2025-08-24';
        setCurrentDate(currentDate); // Set the current viewing date
        const data = await fetchDayData(currentDate, indexData);
        setDayData(data);
        setConversations(data.conversations);

        // Handle conversation selection from navigation
        const previousConversationId = (location.state as any)?.previousConversationId;
        if (previousConversationId) {
          // Try to find the same conversation on this day
          const matchingConversation = data.conversations.find(
            (conv) => conv.id === previousConversationId
          );
          
          if (matchingConversation) {
            // Same conversation exists, select it
            setCurrentConversation(matchingConversation);
          } else {
            // Conversation doesn't exist on this day, clear selection
            setCurrentConversation(null);
          }
        }
      } catch (error) {
        console.error('Failed to load day data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [date, indexData, location.state, setConversations, setCurrentConversation, setCurrentDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <div className="text-text-secondary text-lg">Loading...</div>
      </div>
    );
  }

  if (!dayData) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <div className="text-text-secondary text-lg">Failed to load data</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      <DailyHeader
        date={dayData.date}
        stats={dayData.stats}
        orphanedCount={dayData.orphanedMedia?.orphaned_media_count || 0}
        showOrphanedMedia={showOrphanedMedia}
        onToggleOrphanedMedia={() => setShowOrphanedMedia(!showOrphanedMedia)}
      />
      <div className="flex flex-1 overflow-hidden pt-[80px] md:pt-[68px]">
        {!showOrphanedMedia ? (
          <>
            <div
              className={cn('h-full md:block', {
                block: mobileView === 'list',
                hidden: mobileView === 'chat',
              })}
            >
              <ConversationList />
            </div>
            <div
              className={cn('h-full md:block', {
                block: mobileView === 'chat',
                hidden: mobileView === 'list',
              })}
            >
              <MainContent />
            </div>
          </>
        ) : (
          <OrphanedMediaView orphanedMedia={dayData.orphanedMedia} />
        )}
      </div>
      <Lightbox />
      <KeyboardHint />
    </div>
  );
}
