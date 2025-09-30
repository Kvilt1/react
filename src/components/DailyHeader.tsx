import { useState } from 'react';
import DatePickerPopup from './DatePickerPopup';

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
  
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // TODO: This should be passed from parent component
  // For now, only 2025-07-27 is available
  const availableDates = [new Date('2025-07-27')];

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-bg-secondary border-b border-border px-5 py-3 flex items-center justify-center min-h-[80px]">
      <div className="flex items-center gap-5">
        <span className="px-4 py-2 bg-bg-tertiary border border-border rounded text-text-primary no-underline text-sm font-medium flex items-center gap-1.5 opacity-30 cursor-not-allowed">
          ← Previous Day
        </span>
        
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
        
        <a
          href="/day/2025-07-28"
          className="px-4 py-2 bg-bg-tertiary border border-border rounded text-text-primary no-underline text-sm font-medium transition-all flex items-center gap-1.5 hover:bg-hover-bg hover:border-accent hover:-translate-y-px"
        >
          Next Day →
        </a>
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
