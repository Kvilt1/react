import { useArchiveStore } from '@/store/useArchiveStore';
import ConversationItem from './ConversationItem';

export default function ConversationList() {
  const conversations = useArchiveStore((state) => state.conversations);

  return (
    <div className="w-[350px] bg-bg-secondary border-r border-border flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto py-2 sidebar-scrollbar">
        {conversations.map((conversation) => (
          <ConversationItem key={conversation.id} conversation={conversation} />
        ))}
      </div>
    </div>
  );
}
