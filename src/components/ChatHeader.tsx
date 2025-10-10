import { Conversation } from '@/types';
import { ChevronLeft, Grid3x3 } from 'lucide-react';
import { useArchiveStore } from '@/store/useArchiveStore';

interface ChatHeaderProps {
  conversation: Conversation;
  isGalleryOpen: boolean;
  onToggleGallery: () => void;
}

export default function ChatHeader({
  conversation,
  isGalleryOpen,
  onToggleGallery,
}: ChatHeaderProps) {
  const setMobileView = useArchiveStore((state) => state.setMobileView);
  const participant = conversation.metadata.participants[0];
  const title =
    conversation.type === 'group'
      ? conversation.name.split(' - ')[1] || conversation.name
      : participant?.display_name === 'NOT FOUND IN FRIENDS LIST'
      ? participant.username
      : participant?.display_name || participant?.username || 'Unknown';

  return (
    <div className="px-4 md:px-5 py-3 md:py-5 bg-bg-secondary border-b border-border flex-shrink-0 z-10">
      <div className="flex justify-between items-center md:items-start">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileView('list')}
            className="md:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary"
            aria-label="Back to conversation list"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h3
              data-testid="chat-header-title"
              className="text-base md:text-lg font-semibold text-text-primary leading-tight md:mb-1"
            >
              {title}
            </h3>
            <div className="hidden md:block">
              {conversation.type === 'group' && (
                <div className="text-[13px] text-text-secondary mb-2">
                  {conversation.metadata.participants.length} participants:{' '}
                  {conversation.metadata.participants
                    .map((p) => p.display_name || p.username)
                    .join(', ')}
                </div>
              )}
              <span className="text-sm text-text-secondary">
                {conversation.stats.message_count} messages
              </span>
            </div>
          </div>
        </div>
        <button
          className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border ${
            isGalleryOpen
              ? 'bg-accent text-bg-primary border-accent'
              : 'bg-bg-tertiary text-text-secondary border-border hover:bg-hover-bg hover:text-text-primary hover:border-accent-muted'
          }`}
          onClick={onToggleGallery}
          aria-label={
            isGalleryOpen ? 'Close media gallery' : 'Open media gallery'
          }
          title={isGalleryOpen ? 'Close media gallery' : 'Open media gallery'}
        >
          <Grid3x3 size={20} />
        </button>
      </div>
    </div>
  );
}
