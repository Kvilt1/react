import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchDayData } from '@/lib/api';
import { loadAvailableDates, loadIndexData } from '@/lib/dataLoader';
import { DayData } from '@/types';
import { useArchiveStore } from '@/store/useArchiveStore';
import DailyHeader from '@/components/DailyHeader';
import ConversationList from '@/components/ConversationList';
import MainContent from '@/components/MainContent';
import Lightbox from '@/components/Lightbox';
import OrphanedMediaView from '@/components/OrphanedMediaView';
import KeyboardHint from '@/components/KeyboardHint';
import MobileDailyView from '@/components/mobile/MobileDailyView';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function DailyView() {
  const { date } = useParams<{ date: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOrphanedMedia, setShowOrphanedMedia] = useState(false);
  const indexData = useArchiveStore((state) => state.indexData);
  const setIndexData = useArchiveStore((state) => state.setIndexData);
  const setConversations = useArchiveStore((state) => state.setConversations);
  const setCurrentConversation = useArchiveStore((state) => state.setCurrentConversation);
  const setAccountUsername = useArchiveStore(
    (state) => state.setAccountUsername
  );
  const setCurrentDate = useArchiveStore((state) => state.setCurrentDate);
  const availableDates = useArchiveStore((state) => state.availableDates);
  const setAvailableDates = useArchiveStore((state) => state.setAvailableDates);
  const isMobile = useIsMobile();

  useKeyboardShortcuts();
  const fallbackDate = availableDates[0];
  const resolvedDate = date || fallbackDate || null;

  // Load index data once on mount
  useEffect(() => {
    let isActive = true;

    const ensureIndexData = async () => {
      try {
        const data = indexData ?? (await loadIndexData());
        if (!isActive) return;

        if (!indexData) {
          setIndexData(data);
          setAccountUsername(data.account_owner);
        }

        if (availableDates.length === 0) {
          const dates = await loadAvailableDates(data);
          if (!isActive) return;
          setAvailableDates(dates);
        }
      } catch (error) {
        if (isActive) {
          console.error('Failed to load index data:', error);
        }
      }
    };

    ensureIndexData();

    return () => {
      isActive = false;
    };
  }, [
    indexData,
    availableDates.length,
    setIndexData,
    setAccountUsername,
    setAvailableDates,
  ]);

  useEffect(() => {
    if (!date && resolvedDate) {
      navigate(`/day/${resolvedDate}`, { replace: true });
    }
  }, [date, resolvedDate, navigate]);

  // Load day data when date changes
  useEffect(() => {
    if (!indexData || !resolvedDate) return;

    const controller = new AbortController();
    let isActive = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setCurrentDate(resolvedDate); // Set the current viewing date
        const data = await fetchDayData(
          resolvedDate,
          indexData,
          controller.signal
        );
        if (!isActive) return;

        setDayData(data);
        setConversations(data.conversations);

        // Handle conversation selection from navigation
        const previousConversationId = (location.state as any)?.previousConversationId;
        if (previousConversationId) {
          const matchingConversation = data.conversations.find(
            (conv) => conv.id === previousConversationId
          );

          if (matchingConversation) {
            setCurrentConversation(matchingConversation);
          } else {
            setCurrentConversation(null);
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.error('Failed to load day data:', error);
        if (isActive) {
          setDayData(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [
    resolvedDate,
    indexData,
    location.state,
    setConversations,
    setCurrentConversation,
    setCurrentDate,
  ]);

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

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
        <MobileDailyView
          dayData={dayData}
          showOrphanedMedia={showOrphanedMedia}
          onToggleOrphanedMedia={() => setShowOrphanedMedia(!showOrphanedMedia)}
          onCloseOrphanedMedia={() => setShowOrphanedMedia(false)}
        />
        <Lightbox />
        <KeyboardHint />
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
      <div className="flex flex-1 overflow-hidden pt-[80px]">
        {!showOrphanedMedia ? (
          <>
            <ConversationList />
            <MainContent />
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
