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

export default function DailyView() {
  const { date } = useParams<{ date: string }>();
  const location = useLocation();
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOrphanedMedia, setShowOrphanedMedia] = useState(false);
  const [isMobileConversationsOpen, setIsMobileConversationsOpen] = useState(true);
  const indexData = useArchiveStore((state) => state.indexData);
  const setIndexData = useArchiveStore((state) => state.setIndexData);
  const setConversations = useArchiveStore((state) => state.setConversations);
  const setCurrentConversation = useArchiveStore((state) => state.setCurrentConversation);
  const setAccountUsername = useArchiveStore(
    (state) => state.setAccountUsername
  );
  const setCurrentDate = useArchiveStore((state) => state.setCurrentDate);
  const currentConversation = useArchiveStore(
    (state) => state.currentConversation
  );

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
        const navigationState = location.state as
          | { previousConversationId?: string }
          | null
          | undefined;
        const previousConversationId = navigationState?.previousConversationId;
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

  useEffect(() => {
    if (showOrphanedMedia) {
      setIsMobileConversationsOpen(false);
      return;
    }

    if (currentConversation) {
      setIsMobileConversationsOpen(false);
    } else if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileConversationsOpen(true);
    }
  }, [currentConversation, showOrphanedMedia]);

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

  const handleToggleOrphanedMedia = () => {
    setShowOrphanedMedia((prev) => {
      const next = !prev;
      if (next) {
        setIsMobileConversationsOpen(false);
      }
      return next;
    });
  };

  const handleMobileConversationToggle = () => {
    setIsMobileConversationsOpen((prev) => !prev);
  };

  const handleMobileConversationOpen = () => {
    setIsMobileConversationsOpen(true);
  };

  const handleConversationSelected = () => {
    setIsMobileConversationsOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      <DailyHeader
        date={dayData.date}
        stats={dayData.stats}
        orphanedCount={dayData.orphanedMedia?.orphaned_media_count || 0}
        showOrphanedMedia={showOrphanedMedia}
        onToggleOrphanedMedia={handleToggleOrphanedMedia}
        onToggleMobileConversations={
          showOrphanedMedia ? undefined : handleMobileConversationToggle
        }
        isMobileConversationsOpen={
          !showOrphanedMedia && isMobileConversationsOpen
        }
      />
      <div className="flex-1 relative overflow-hidden pt-[124px] md:pt-[80px]">
        <div className="h-full">
          {!showOrphanedMedia ? (
            <div className="flex h-full overflow-hidden">
              <div className="hidden md:flex">
                <ConversationList onConversationSelected={handleConversationSelected} />
              </div>
              <div className="flex-1 flex">
                <MainContent onOpenMobileConversations={handleMobileConversationOpen} />
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <OrphanedMediaView orphanedMedia={dayData.orphanedMedia} />
            </div>
          )}
        </div>

        {isMobileConversationsOpen && !showOrphanedMedia && (
          <div className="md:hidden absolute inset-0 bg-bg-secondary border-t border-border z-30 flex flex-col">
            <ConversationList onConversationSelected={handleConversationSelected} />
          </div>
        )}
      </div>
      <Lightbox />
      <KeyboardHint />
    </div>
  );
}
