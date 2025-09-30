import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchDayData } from '@/lib/api';
import { DayData, Conversation } from '@/types';
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
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOrphanedMedia, setShowOrphanedMedia] = useState(false);
  const setConversations = useArchiveStore((state) => state.setConversations);
  const setAccountUsername = useArchiveStore(
    (state) => state.setAccountUsername
  );

  useKeyboardShortcuts();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDayData(date || '2025-07-27');
        setDayData(data);
        setConversations(data.conversations);
        
        // Detect account username
        const username = detectAccountUsername(data.conversations);
        if (username) {
          setAccountUsername(username);
        }
      } catch (error) {
        console.error('Failed to load day data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [date, setConversations, setAccountUsername]);

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

function detectAccountUsername(conversations: Conversation[]): string | null {
  for (const conversation of conversations) {
    if (conversation.messages && conversation.messages.length > 0) {
      const senderMessages = conversation.messages.filter(
        (msg) => msg.is_sender === true
      );
      
      if (senderMessages.length > 0) {
        const randomIndex = Math.floor(Math.random() * senderMessages.length);
        const randomSenderMessage = senderMessages[randomIndex];
        
        if (randomSenderMessage.from_user) {
          return randomSenderMessage.from_user;
        }
      }
    }
  }
  
  return 'unknown_user';
}
