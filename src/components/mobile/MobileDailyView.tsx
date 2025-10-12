import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Image as ImageIcon,
  Archive,
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ConversationItem from '@/components/ConversationItem';
import ChatWindow from '@/components/ChatWindow';
import MediaGallery from '@/components/MediaGallery';
import OrphanedMediaView from '@/components/OrphanedMediaView';
import DatePickerPopup from '@/components/DatePickerPopup';
import { useArchiveStore } from '@/store/useArchiveStore';
import { DayData } from '@/types';
import { formatDate } from '@/lib/utils';

interface MobileDailyViewProps {
  dayData: DayData;
  showOrphanedMedia: boolean;
  onToggleOrphanedMedia: () => void;
  onCloseOrphanedMedia: () => void;
}

export default function MobileDailyView({
  dayData,
  showOrphanedMedia,
  onToggleOrphanedMedia,
  onCloseOrphanedMedia,
}: MobileDailyViewProps) {
  const navigate = useNavigate();
  const conversations = useArchiveStore((state) => state.conversations);
  const currentConversation = useArchiveStore((state) => state.currentConversation);
  const availableDateStrings = useArchiveStore((state) => state.availableDates);
  const currentConversationId = currentConversation?.id;
  const [showConversationList, setShowConversationList] = useState(!currentConversation);
  const [showGallery, setShowGallery] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!currentConversation) {
      setShowConversationList(true);
      setShowGallery(false);
    }
  }, [currentConversation]);

  useEffect(() => {
    if (showOrphanedMedia) {
      setShowConversationList(false);
      setShowGallery(false);
    }
  }, [showOrphanedMedia]);

  useEffect(() => {
    if (!showOrphanedMedia && !showConversationList && !currentConversation) {
      setShowConversationList(true);
    }
  }, [showOrphanedMedia, showConversationList, currentConversation]);

  const formattedDate = useMemo(() => formatDate(dayData.date), [dayData.date]);

  const availableDates = useMemo(
    () =>
      availableDateStrings
        .map((value) => new Date(value))
        .filter((value) => !Number.isNaN(value.getTime())),
    [availableDateStrings]
  );

  const { previousDate, nextDate } = useMemo(() => {
    const sortedDates = [...availableDates].sort((a, b) => a.getTime() - b.getTime());
    const currentIndex = sortedDates.findIndex(
      (d) => d.toISOString().split('T')[0] === dayData.date
    );

    return {
      previousDate: currentIndex > 0 ? sortedDates[currentIndex - 1] : null,
      nextDate:
        currentIndex >= 0 && currentIndex < sortedDates.length - 1
          ? sortedDates[currentIndex + 1]
          : null,
    };
  }, [availableDates, dayData.date]);

  const goToDate = (date: Date | null) => {
    if (!date) return;
    const dateStr = date.toISOString().split('T')[0];
    navigate(`/day/${dateStr}`, {
      state: { previousConversationId: currentConversationId },
    });
  };

  const conversationTitle = useMemo(() => {
    if (!currentConversation) return '';
    if (currentConversation.type === 'group') {
      return currentConversation.name.split(' - ')[1] || currentConversation.name;
    }

    const participant = currentConversation.metadata.participants[0];
    if (!participant) return currentConversation.name;

    if (participant.display_name === 'NOT FOUND IN FRIENDS LIST') {
      return participant.username;
    }

    return participant.display_name || participant.username || currentConversation.name;
  }, [currentConversation]);

  const handleOpenConversation = () => {
    setShowConversationList(false);
    setShowGallery(false);
    onCloseOrphanedMedia();
  };

  const handleOpenGallery = () => {
    if (!currentConversation) {
      setShowConversationList(true);
      return;
    }
    onCloseOrphanedMedia();
    setShowConversationList(false);
    setShowGallery(true);
  };

  const handleOpenOrphaned = () => {
    if (showOrphanedMedia) {
      onToggleOrphanedMedia();
      setShowGallery(false);
      if (!currentConversation) {
        setShowConversationList(true);
      }
      return;
    }

    setShowConversationList(false);
    setShowGallery(false);
    onToggleOrphanedMedia();
  };

  const headerRight = showConversationList ? (
    <button
      type="button"
      onClick={() => setShowDatePicker(true)}
      className="w-10 h-10 rounded-full bg-bg-tertiary text-text-secondary flex items-center justify-center border border-border"
      aria-label="Choose date"
    >
      <CalendarDays size={18} />
    </button>
  ) : showOrphanedMedia ? (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => goToDate(previousDate)}
        disabled={!previousDate}
        className={`w-10 h-10 rounded-full flex items-center justify-center border ${
          previousDate
            ? 'bg-bg-tertiary text-text-secondary border-border'
            : 'bg-bg-tertiary/40 text-text-tertiary border-border/60 cursor-not-allowed'
        }`}
        aria-label="Previous day"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={() => goToDate(nextDate)}
        disabled={!nextDate}
        className={`w-10 h-10 rounded-full flex items-center justify-center border ${
          nextDate
            ? 'bg-bg-tertiary text-text-secondary border-border'
            : 'bg-bg-tertiary/40 text-text-tertiary border-border/60 cursor-not-allowed'
        }`}
        aria-label="Next day"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setShowDatePicker(true)}
        className="w-10 h-10 rounded-full bg-bg-tertiary text-text-secondary flex items-center justify-center border border-border"
        aria-label="Choose date"
      >
        <CalendarDays size={18} />
      </button>
      <button
        type="button"
        onClick={() => goToDate(nextDate)}
        disabled={!nextDate}
        className={`w-10 h-10 rounded-full flex items-center justify-center border ${
          nextDate
            ? 'bg-bg-tertiary text-text-secondary border-border'
            : 'bg-bg-tertiary/40 text-text-tertiary border-border/60 cursor-not-allowed'
        }`}
        aria-label="Next day"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );

  const headerLeft = showConversationList ? (
    <button
      type="button"
      onClick={() => goToDate(previousDate)}
      disabled={!previousDate}
      className={`w-10 h-10 rounded-full flex items-center justify-center border ${
        previousDate
          ? 'bg-bg-tertiary text-text-secondary border-border'
          : 'bg-bg-tertiary/40 text-text-tertiary border-border/60 cursor-not-allowed'
      }`}
      aria-label="Previous day"
    >
      <ChevronLeft size={18} />
    </button>
  ) : showOrphanedMedia ? (
    <button
      type="button"
      onClick={() => {
        onToggleOrphanedMedia();
        setShowGallery(false);
        if (!currentConversation) {
          setShowConversationList(true);
        }
      }}
      className="w-10 h-10 rounded-full bg-bg-tertiary text-text-secondary flex items-center justify-center border border-border"
      aria-label="Back to chats"
    >
      <ArrowLeft size={18} />
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setShowConversationList(true)}
      className="w-10 h-10 rounded-full bg-bg-tertiary text-text-secondary flex items-center justify-center border border-border"
      aria-label="Back to conversations"
    >
      <ArrowLeft size={18} />
    </button>
  );

  const headerTitle = showConversationList
    ? 'Chat'
    : showOrphanedMedia
    ? 'Memories'
    : conversationTitle;

  const headerSubtitle = showConversationList
    ? formattedDate
    : showOrphanedMedia
    ? `${dayData.orphanedMedia?.orphaned_media_count || 0} orphaned media`
    : `${currentConversation?.stats.message_count ?? 0} messages`;

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      <header className="flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-border sticky top-0 z-20">
        {headerLeft}
        <div className="text-center">
          <div className="text-base font-semibold text-text-primary">{headerTitle}</div>
          <div className="text-xs text-text-secondary mt-0.5">{headerSubtitle}</div>
        </div>
        {headerRight}
      </header>

      <div className="flex-1 overflow-hidden relative">
        {showOrphanedMedia ? (
          <div className="absolute inset-0 overflow-hidden">
            <OrphanedMediaView orphanedMedia={dayData.orphanedMedia} />
          </div>
        ) : showConversationList ? (
          <div className="absolute inset-0 overflow-y-auto pb-24 custom-scrollbar">
            <div className="px-3 pt-3 pb-6 space-y-2">
              {conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    variant="mobile"
                    onSelect={handleOpenConversation}
                  />
                ))
              ) : (
                <div className="text-center text-text-secondary text-sm py-10">
                  No conversations for this day
                </div>
              )}
            </div>
          </div>
        ) : currentConversation ? (
          <div className="absolute inset-0 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              {showGallery ? (
                <MediaGallery
                  conversation={currentConversation}
                  isGalleryOpen
                  onToggleGallery={() => setShowGallery(false)}
                  showHeader={false}
                />
              ) : (
                <ChatWindow
                  conversation={currentConversation}
                  isGalleryOpen={false}
                  onToggleGallery={() => setShowGallery(true)}
                  showHeader={false}
                />
              )}
            </div>
          </div>
        ) : null}
      </div>

      <nav className="bg-bg-secondary border-t border-border px-6 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setShowConversationList(true);
            setShowGallery(false);
            onCloseOrphanedMedia();
          }}
          className={`flex flex-col items-center gap-1 text-xs ${
            showConversationList && !showOrphanedMedia
              ? 'text-accent'
              : 'text-text-secondary'
          }`}
          aria-label="Chats"
        >
          <MessageCircle size={20} />
          <span>Chats</span>
        </button>
        <button
          type="button"
          onClick={handleOpenGallery}
          className={`flex flex-col items-center gap-1 text-xs ${
            showGallery && !showOrphanedMedia ? 'text-accent' : 'text-text-secondary'
          } ${currentConversation ? '' : 'opacity-50 cursor-not-allowed'}`}
          disabled={!currentConversation}
          aria-label="Gallery"
        >
          <ImageIcon size={20} />
          <span>Gallery</span>
        </button>
        <button
          type="button"
          onClick={handleOpenOrphaned}
          className={`flex flex-col items-center gap-1 text-xs ${
            showOrphanedMedia ? 'text-accent' : 'text-text-secondary'
          }`}
          aria-label="Orphaned media"
        >
          <Archive size={20} />
          <span>Orphaned</span>
        </button>
      </nav>

      {showDatePicker && (
        <DatePickerPopup
          currentDate={new Date(dayData.date)}
          onClose={() => setShowDatePicker(false)}
          availableDates={availableDates}
        />
      )}
    </div>
  );
}
