import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePickerPopup from './DatePickerPopup';
import { getAvailableDates } from '@/lib/dataLoader';
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
}

export default function DailyHeader({
  date,
  stats,
  orphanedCount,
  showOrphanedMedia,
  onToggleOrphanedMedia,
}: DailyHeaderProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigate = useNavigate();
  const currentConversation = useArchiveStore(
    (state) => state.currentConversation
  );

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const availableDates = getAvailableDates();

  // Find previous and next available dates
  const { previousDate, nextDate } = useMemo(() => {
    const sortedDates = [...availableDates].sort(
      (a, b) => a.getTime() - b.getTime()
    );
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
        state: { previousConversationId: currentConversation?.id },
      });
    }
  };

  const handleNextDay = () => {
    if (nextDate) {
      const dateStr = nextDate.toISOString().split('T')[0];
      navigate(`/day/${dateStr}`, {
        state: { previousConversationId: currentConversation?.id },
      });
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-bg-secondary border-b border-border px-3 md:px-5 py-2 md:py-3 flex items-center justify-center min-h-[68px] md:min-h-[80px]">
      <div className="flex items-center justify-between w-full md:w-auto md:gap-5">
        <button
          onClick={handlePreviousDay}
          disabled={!previousDate}
          className={`px-2 md:px-4 py-2 bg-bg-tertiary border border-border rounded text-text-primary text-sm font-medium flex items-center gap-1.5 transition-all ${
            previousDate
              ? 'cursor-pointer hover:bg-hover-bg hover:border-accent hover:-translate-y-px'
              : 'opacity-30 cursor-not-allowed'
          }`}
          aria-label="Previous day"
        >
          <span className="hidden sm:inline">←</span>
          <span className="sm:hidden">←</span>
          <span className="hidden md:inline">Previous Day</span>
        </button>

        <div className="text-center">
          <h1
            className="text-base md:text-xl text-accent m-0 font-semibold cursor-pointer hover:underline transition-all"
            onClick={() => setShowDatePicker(true)}
            role="button"
            tabIndex={0}
            aria-label="Open date picker"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowDatePicker(true);
              }
            }}
          >
            {formattedDate}
          </h1>
          <div className="text-xs text-text-secondary mt-1 hidden min-[375px]:block">
            <span>{stats.conversationCount} convos</span>
            <span className="mx-1 md:mx-2">•</span>
            <span>{stats.messageCount} msgs</span>
            <span className="mx-1 md:mx-2">•</span>
            <span>{stats.mediaCount} media</span>
            {orphanedCount > 0 && (
              <>
                <span className="mx-1 md:mx-2">•</span>
                <button
                  className={`border-none px-2 py-1 rounded-2xl text-xs cursor-pointer transition-all font-medium ${
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
                  Orphaned ({orphanedCount})
                </button>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleNextDay}
          disabled={!nextDate}
          className={`px-2 md:px-4 py-2 bg-bg-tertiary border border-border rounded text-text-primary text-sm font-medium flex items-center gap-1.5 transition-all ${
            nextDate
              ? 'cursor-pointer hover:bg-hover-bg hover:border-accent hover:-translate-y-px'
              : 'opacity-30 cursor-not-allowed'
          }`}
          aria-label="Next day"
        >
          <span className="hidden md:inline">Next Day</span>
          <span className="hidden sm:inline">→</span>
          <span className="sm:hidden">→</span>
        </button>
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
