import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import DatePickerPopup from './DatePickerPopup';
import { useArchiveStore } from '@/store/useArchiveStore';

interface DailyHeaderProps {
  date: string;
  stats: {
    conversationCount: number;
    messageCount: number;
    mediaCount: number;
  };
  orphanedCount: number;
  showOrphanedMedia: boolean;
  onToggleOrphanedMedia: () => void;
  onToggleMobileConversations?: () => void;
  isMobileConversationsOpen?: boolean;
}

export default function DailyHeader({
  date,
  stats,
  orphanedCount,
  showOrphanedMedia,
  onToggleOrphanedMedia,
  onToggleMobileConversations,
  isMobileConversationsOpen,
}: DailyHeaderProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigate = useNavigate();
  const currentConversation = useArchiveStore((state) => state.currentConversation);
  const availableDateStrings = useArchiveStore((state) => state.availableDates);
  
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const availableDates = useMemo(() => {
    return availableDateStrings
      .map((dateStr) => new Date(dateStr))
      .filter((value) => !Number.isNaN(value.getTime()));
  }, [availableDateStrings]);

  // Find previous and next available dates
  const { previousDate, nextDate } = useMemo(() => {
    const sortedDates = [...availableDates].sort((a, b) => a.getTime() - b.getTime());
    const currentIndex = sortedDates.findIndex(
      (d) => d.toISOString().split('T')[0] === date
    );

    return {
      previousDate: currentIndex > 0 ? sortedDates[currentIndex - 1] : null,
      nextDate:
        currentIndex >= 0 && currentIndex < sortedDates.length - 1
          ? sortedDates[currentIndex + 1]
          : null,
    };
  }, [availableDates, date]);

  const handlePreviousDay = () => {
    if (previousDate) {
      const dateStr = previousDate.toISOString().split('T')[0];
      navigate(`/day/${dateStr}`, { 
        state: { previousConversationId: currentConversation?.id } 
      });
    }
  };

  const handleNextDay = () => {
    if (nextDate) {
      const dateStr = nextDate.toISOString().split('T')[0];
      navigate(`/day/${dateStr}`, { 
        state: { previousConversationId: currentConversation?.id } 
      });
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-bg-secondary border-b border-border px-4 md:px-5 py-3 flex items-center justify-center">
      <div className="w-full max-w-5xl flex flex-col gap-3 md:flex-row md:items-center md:justify-center">
        <div className="flex items-center justify-between gap-3 md:gap-5">
          <div className="flex items-center gap-3">
            {onToggleMobileConversations && (
              <button
                className="md:hidden w-10 h-10 rounded-full border border-border bg-bg-tertiary text-text-secondary flex items-center justify-center transition-all hover:bg-hover-bg hover:text-text-primary"
                onClick={onToggleMobileConversations}
                aria-label={
                  isMobileConversationsOpen ? 'Hide conversations list' : 'Show conversations list'
                }
              >
                {isMobileConversationsOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            )}
            <button
              onClick={handlePreviousDay}
              disabled={!previousDate}
              className={`px-4 py-2 bg-bg-tertiary border border-border rounded text-text-primary text-sm font-medium flex items-center gap-1.5 transition-all ${
                previousDate
                  ? 'cursor-pointer hover:bg-hover-bg hover:border-accent hover:-translate-y-px'
                  : 'opacity-30 cursor-not-allowed'
              }`}
              aria-label="Previous day"
            >
              ← Previous
            </button>
          </div>
          <button
            onClick={handleNextDay}
            disabled={!nextDate}
            className={`px-4 py-2 bg-bg-tertiary border border-border rounded text-text-primary text-sm font-medium flex items-center gap-1.5 transition-all ${
              nextDate
                ? 'cursor-pointer hover:bg-hover-bg hover:border-accent hover:-translate-y-px'
                : 'opacity-30 cursor-not-allowed'
            }`}
            aria-label="Next day"
          >
            Next →
          </button>
        </div>

        <div className="text-center flex flex-col items-center md:min-w-[360px]">
          <h1 className="text-lg md:text-xl text-accent m-0 font-semibold">
            <button
              type="button"
              className="bg-transparent border-none p-0 m-0 text-inherit font-inherit cursor-pointer hover:underline transition-all focus:outline-none"
              onClick={() => setShowDatePicker(true)}
              aria-label="Open date picker"
            >
              {formattedDate}
            </button>
          </h1>
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[11px] md:text-xs text-text-secondary mt-1">
            <span>{stats.conversationCount} conversations</span>
            <span className="text-text-secondary/70">•</span>
            <span>{stats.messageCount} messages</span>
            <span className="text-text-secondary/70">•</span>
            <span>{stats.mediaCount} media</span>
            {orphanedCount > 0 && (
              <button
                className={`border-none px-3 py-1 rounded-2xl text-[11px] md:text-xs cursor-pointer transition-all font-medium whitespace-nowrap ${
                  showOrphanedMedia
                    ? 'bg-accent text-bg-primary'
                    : 'bg-snap-purple text-white hover:bg-[#8b41ff] hover:-translate-y-px'
                }`}
                onClick={onToggleOrphanedMedia}
                aria-label={
                  showOrphanedMedia
                    ? 'Close orphaned media'
                    : `View ${orphanedCount} orphaned media items`
                }
              >
                📷 Orphaned Media ({orphanedCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {showDatePicker && (
        <DatePickerPopup
          currentDate={dateObj}
          onClose={() => setShowDatePicker(false)}
          availableDates={availableDates}
        />
      )}
    </div>
  );
}
