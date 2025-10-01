import { useArchiveStore } from '@/store/useArchiveStore';
import { Conversation } from '@/types';
import { getAvatarColor, parseSnapchatDate } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
}

export default function ConversationItem({ conversation }: ConversationItemProps) {
  const currentConversation = useArchiveStore((state) => state.currentConversation);
  const setCurrentConversation = useArchiveStore(
    (state) => state.setCurrentConversation
  );
  
  const isActive = currentConversation?.id === conversation.id;
  
  const participant = conversation.metadata.participants[0];
  const displayName =
    conversation.type === 'group'
      ? conversation.name.split(' - ')[1] || conversation.name
      : participant?.display_name === 'NOT FOUND IN FRIENDS LIST'
      ? participant.username
      : participant?.display_name || participant?.username || 'Unknown';
  
  const avatarColor = getAvatarColor(displayName);
  
  let lastTime = 'No messages';
  if (conversation.stats.date_range.last_message) {
    const date = parseSnapchatDate(conversation.stats.date_range.last_message);
    lastTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  return (
    <div
      className={`flex items-center px-4 py-2.5 cursor-pointer transition-colors border-b border-white/5 gap-2.5 ${
        isActive ? 'bg-bg-tertiary' : 'hover:bg-hover-bg'
      }`}
      onClick={() => setCurrentConversation(conversation)}
      role="button"
      tabIndex={0}
      aria-label={`Open conversation with ${displayName}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setCurrentConversation(conversation);
        }
      }}
    >
      <div className="flex-shrink-0">
        <div
          className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center text-xl font-semibold text-white border-0"
          style={{ backgroundColor: avatarColor }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <div className="text-base font-semibold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">
            {displayName}
          </div>
          <div className="text-[13px] text-text-tertiary flex-shrink-0 ml-2">
            {lastTime}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-text-secondary flex items-center gap-1">
            📸 Snap
          </span>
        </div>
      </div>
    </div>
  );
}
