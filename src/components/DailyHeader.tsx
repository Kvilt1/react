import { useState, useMemo, useEffect } from 'react';
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
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const navigate = useNavigate();
  const currentConversation = useArchiveStore((state) => state.currentConversation);

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch available dates on mount
  useEffect(() => {
    const loadDates = async () => {
      const dates = await getAvailableDates();
      setAvailableDates(dates);
    };
    loadDates();
  }, []);

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
    <div className="fixed top-0 left-0 right-0 z-[100] bg-bg-secondary border-b border-border px-5 py-3 flex items-center justify-center min-h-[80px]">
      <div className="flex items-center gap-5">
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
          ← Previous Day
        </button>
        
        <div className="text-center">
          <h1
            className="text-xl text-accent m-0 font-semibold cursor-pointer hover:underline transition-all"
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
          <div className="text-xs text-text-secondary mt-1">
            <span>{stats.conversationCount} conversations</span>
            <span className="mx-2">•</span>
            <span>{stats.messageCount} messages</span>
            <span className="mx-2">•</span>
            <span>{stats.mediaCount} media</span>
            {orphanedCount > 0 && (
              <>
                <span className="mx-2">•</span>
                <button
                  className={`border-none px-3 py-1 rounded-2xl text-xs cursor-pointer transition-all font-medium ${
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
              </>
            )}
          </div>
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
          Next Day →
        </button>
      </div>

      {showDatePicker && (
        <DatePickerPopup
          currentDate={dateObj}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
}
