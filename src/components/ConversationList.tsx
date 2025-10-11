import { useArchiveStore } from '@/store/useArchiveStore';
import ConversationItem from './ConversationItem';
import { parseSnapchatDate } from '@/lib/utils';

interface ConversationListProps {
  onConversationSelected?: () => void;
}

export default function ConversationList({
  onConversationSelected,
}: ConversationListProps) {
  const conversations = useArchiveStore((state) => state.conversations);

  const sortedConversations = [...conversations].sort((a, b) => {
    const dateA = a.stats.date_range.last_message
      ? parseSnapchatDate(a.stats.date_range.last_message)
      : new Date(0);
    const dateB = b.stats.date_range.last_message
      ? parseSnapchatDate(b.stats.date_range.last_message)
      : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="h-full w-full md:w-[350px] bg-bg-secondary border-r border-border flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto py-2 sidebar-scrollbar">
        {sortedConversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            onConversationSelected={onConversationSelected}
          />
        ))}
      </div>
    </div>
  );
}
