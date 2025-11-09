import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDayData, getConversationActivity } from '@/lib/api';
import { loadIndexData } from '@/lib/dataLoader';
import { DayData, Conversation } from '@/types';
import { useArchiveStore } from '@/store/useArchiveStore';
import FocusedHeader from '@/components/FocusedHeader';
import MainContent from '@/components/MainContent';
import Lightbox from '@/components/Lightbox';
import OrphanedMediaView from '@/components/OrphanedMediaView';
import KeyboardHint from '@/components/KeyboardHint';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function ConversationFocusView() {
  const { conversationId, date: paramDate } = useParams<{ conversationId: string; date?: string }>();
  const navigate = useNavigate();
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOrphanedMedia, setShowOrphanedMedia] = useState(false);
  const [conversationDates, setConversationDates] = useState<string[]>([]);
  const [currentDate, setCurrentDateState] = useState<string | null>(null);
  const [focusedConversation, setFocusedConversation] = useState<Conversation | null>(null);

  const indexData = useArchiveStore((state) => state.indexData);
  const setIndexData = useArchiveStore((state) => state.setIndexData);
  const setConversations = useArchiveStore((state) => state.setConversations);
  const setCurrentConversation = useArchiveStore((state) => state.setCurrentConversation);
  const setAccountUsername = useArchiveStore((state) => state.setAccountUsername);
  const setCurrentDate = useArchiveStore((state) => state.setCurrentDate);
  const focusMode = useArchiveStore((state) => state.focusMode);
  const setFocusMode = useArchiveStore((state) => state.setFocusMode);
  const setFocusedConversationId = useArchiveStore((state) => state.setFocusedConversationId);
  const setFocusedConversationDates = useArchiveStore((state) => state.setFocusedConversationDates);

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

  // Load conversation activity dates
  useEffect(() => {
    const loadConversationDates = async () => {
      if (!conversationId || !indexData) return;

      try {
        setLoading(true);
        setFocusMode(true);
        setFocusedConversationId(conversationId);

        // Get all dates where this conversation has activity
        const dates = await getConversationActivity(conversationId, indexData);
        setConversationDates(dates);
        setFocusedConversationDates(dates);

        // Determine which date to show
        let targetDate: string;
        if (paramDate && dates.includes(paramDate)) {
          targetDate = paramDate;
        } else if (dates.length > 0) {
          // If no date specified or invalid date, go to first date with activity
          targetDate = dates[0];
          // Navigate to include the date in URL
          navigate(`/conversation/${conversationId}/${targetDate}`, { replace: true });
          return;
        } else {
          // No activity found for this conversation
          setLoading(false);
          return;
        }

        setCurrentDateState(targetDate);
        setCurrentDate(targetDate);
      } catch (error) {
        console.error('Failed to load conversation dates:', error);
        setLoading(false);
      }
    };

    loadConversationDates();
  }, [conversationId, paramDate, indexData, navigate, setFocusMode, setFocusedConversationId, setCurrentDate, setFocusedConversationDates]);

  // Load day data when date changes
  useEffect(() => {
    const loadData = async () => {
      if (!indexData || !currentDate || !conversationId) return;

      try {
        setLoading(true);
        const data = await fetchDayData(currentDate, indexData);

        // Filter to only show the focused conversation
        const focusedConv = data.conversations.find(conv => conv.id === conversationId);

        if (focusedConv) {
          setFocusedConversation(focusedConv);
          setDayData({
            ...data,
            conversations: [focusedConv],
            stats: {
              conversationCount: 1,
              messageCount: focusedConv.messages.length,
              mediaCount: focusedConv.messages.filter(m => m.media_locations && m.media_locations.length > 0).length
            }
          });
          setConversations([focusedConv]);
          setCurrentConversation(focusedConv);
        }
      } catch (error) {
        console.error('Failed to load day data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentDate, conversationId, indexData, setConversations, setCurrentConversation, setCurrentDate]);

  const handleExitFocus = () => {
    setFocusMode(false);
    setFocusedConversationId(null);
    setFocusedConversationDates([]);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <div className="text-text-secondary text-lg">Loading conversation...</div>
      </div>
    );
  }

  if (!dayData || conversationDates.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <div className="text-center">
          <div className="text-text-secondary text-lg mb-4">No activity found for this conversation</div>
          <button
            onClick={handleExitFocus}
            className="px-4 py-2 bg-accent text-bg-primary rounded hover:bg-accent/90"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      <FocusedHeader
        date={currentDate!}
        stats={dayData.stats}
        orphanedCount={dayData.orphanedMedia?.orphaned_media_count || 0}
        showOrphanedMedia={showOrphanedMedia}
        onToggleOrphanedMedia={() => setShowOrphanedMedia(!showOrphanedMedia)}
        conversation={focusedConversation!}
        conversationDates={conversationDates}
        onExitFocus={handleExitFocus}
      />
      <div className="flex flex-1 overflow-hidden pt-[80px]">
        {!showOrphanedMedia ? (
          // No conversation list in focus mode - full width for main content
          <MainContent />
        ) : (
          <OrphanedMediaView orphanedMedia={dayData.orphanedMedia} />
        )}
      </div>
      <Lightbox />
      <KeyboardHint />
    </div>
  );
}