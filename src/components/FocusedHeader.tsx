import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePickerPopup from './DatePickerPopup';
import { Conversation } from '@/types';
import { useArchiveStore } from '@/store/useArchiveStore';

interface FocusedHeaderProps {
  date: string;
  stats: {
    conversationCount: number;
    messageCount: number;
    mediaCount: number;
  };
  orphanedCount: number;
  showOrphanedMedia: boolean;
  onToggleOrphanedMedia: () => void;
  conversation: Conversation;
  conversationDates: string[];
  onExitFocus: () => void;
}

export default function FocusedHeader({
  date,
  stats,
  orphanedCount,
  showOrphanedMedia,
  onToggleOrphanedMedia,
  conversation,
  conversationDates,
  onExitFocus,
}: FocusedHeaderProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const indexData = useArchiveStore((state) => state.indexData);

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Find previous and next available dates for this conversation
  const { previousDate, nextDate } = useMemo(() => {
    const currentIndex = conversationDates.indexOf(date);

    return {
      previousDate: currentIndex > 0 ? conversationDates[currentIndex - 1] : null,
      nextDate:
        currentIndex >= 0 && currentIndex < conversationDates.length - 1
          ? conversationDates[currentIndex + 1]
          : null,
    };
  }, [conversationDates, date]);

  const handlePreviousDay = () => {
    if (previousDate && conversationId) {
      navigate(`/conversation/${conversationId}/${previousDate}`);
    }
  };

  const handleNextDay = () => {
    if (nextDate && conversationId) {
      navigate(`/conversation/${conversationId}/${nextDate}`);
    }
  };

  // Get conversation participant info for display
  const getConversationDisplay = () => {
    if (conversation.type === 'group') {
      // For groups, show group name
      const groupName = conversation.name.replace('Chat - ', '');
      return {
        name: groupName,
        subtitle: `${conversation.metadata.participants.length} members`,
        avatar: null, // Groups don't have bitmoji
      };
    } else {
      // For DMs, show the participant info
      const participant = conversation.metadata.participants[0];
      if (participant) {
        const user = indexData?.users.find(u => u.username === participant.username);
        return {
          name: participant.display_name === 'NOT FOUND IN FRIENDS LIST'
            ? participant.username
            : participant.display_name || participant.username,
          subtitle: participant.username,
          avatar: user?.bitmoji || null,
        };
      }
    }
    return { name: conversation.name, subtitle: '', avatar: null };
  };

  const displayInfo = getConversationDisplay();

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-bg-secondary border-b border-border px-5 py-3 min-h-[80px]">
      {/* Exit Focus button in top left */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-4">
        <button
          onClick={onExitFocus}
          className="px-4 py-2 bg-bg-tertiary border border-border rounded text-text-primary text-sm font-medium flex items-center gap-2 transition-all hover:bg-hover-bg hover:border-accent hover:-translate-y-px"
          aria-label="Exit Focus Mode"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Exit Focus
        </button>

        {/* Conversation Info */}
        <div className="flex items-center gap-3 border-l border-border pl-4">
          {displayInfo.avatar ? (
            <img
              src={displayInfo.avatar}
              alt={displayInfo.name}
              className="w-10 h-10 rounded-full bg-bg-tertiary"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-accent text-lg font-semibold">
                {displayInfo.name[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="text-text-primary font-medium">{displayInfo.name}</div>
            {displayInfo.subtitle && (
              <div className="text-text-secondary text-xs">{displayInfo.subtitle}</div>
            )}
          </div>
        </div>
      </div>

      {/* Center navigation controls */}
      <div className="flex items-center justify-center gap-5">
        <button
          onClick={handlePreviousDay}
          disabled={!previousDate}
          className={`px-4 py-2 bg-bg-tertiary border border-border rounded text-text-primary text-sm font-medium flex items-center gap-1.5 transition-all ${
            previousDate
              ? 'cursor-pointer hover:bg-hover-bg hover:border-accent hover:-translate-y-px'
              : 'opacity-30 cursor-not-allowed'
          }`}
          aria-label="Previous day with activity"
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
            <span>{stats.messageCount} messages</span>
            <span className="mx-2">•</span>
            <span>{stats.mediaCount} media</span>
            <span className="mx-2">•</span>
            <span className="text-accent font-medium">
              Day {conversationDates.indexOf(date) + 1} of {conversationDates.length}
            </span>
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
          aria-label="Next day with activity"
        >
          Next Day →
        </button>
      </div>

      {showDatePicker && (
        <DatePickerPopup
          currentDate={dateObj}
          onClose={() => setShowDatePicker(false)}
          availableDates={conversationDates.map(d => new Date(d))}
          onDateSelect={(selectedDate) => {
            const dateStr = selectedDate.toISOString().split('T')[0];
            if (conversationDates.includes(dateStr) && conversationId) {
              navigate(`/conversation/${conversationId}/${dateStr}`);
            }
            setShowDatePicker(false);
          }}
        />
      )}
    </div>
  );
}