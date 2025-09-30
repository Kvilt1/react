import { Conversation } from '@/types';
import { Grid3x3 } from 'lucide-react';

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
  const participant = conversation.metadata.participants[0];
  const title =
    conversation.type === 'group'
      ? conversation.name.split(' - ')[1] || conversation.name
      : participant?.display_name === 'NOT FOUND IN FRIENDS LIST'
      ? participant.username
      : participant?.display_name || participant?.username || 'Unknown';

  return (
    <div className="px-5 py-5 bg-bg-secondary border-b border-border flex-shrink-0 z-10">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            {title}
          </h3>
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
        <button
          className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border ${
            isGalleryOpen
              ? 'bg-accent text-bg-primary border-accent'
              : 'bg-bg-tertiary text-text-secondary border-border hover:bg-hover-bg hover:text-text-primary hover:border-accent-muted'
          }`}
          onClick={onToggleGallery}
          aria-label={isGalleryOpen ? 'Close media gallery' : 'Open media gallery'}
          title={isGalleryOpen ? 'Close media gallery' : 'Open media gallery'}
        >
          <Grid3x3 size={20} />
        </button>
      </div>
    </div>
  );
}
