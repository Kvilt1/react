import { useState } from 'react';
import { useArchiveStore } from '@/store/useArchiveStore';
import ConversationItem from './ConversationItem';

export default function ConversationList() {
  const [searchTerm, setSearchTerm] = useState('');
  const conversations = useArchiveStore((state) => state.conversations);

  const filteredConversations = conversations.filter((conv) => {
    const participant = conv.metadata.participants[0];
    const displayName =
      conv.type === 'group'
        ? conv.name.split(' - ')[1] || conv.name
        : participant?.display_name === 'NOT FOUND IN FRIENDS LIST'
        ? participant.username
        : participant?.display_name || participant?.username || 'Unknown';
    
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const dateA = a.stats.date_range.last_message
      ? new Date(a.stats.date_range.last_message)
      : new Date(0);
    const dateB = b.stats.date_range.last_message
      ? new Date(b.stats.date_range.last_message)
      : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="w-[350px] bg-bg-secondary border-r border-border flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border flex-shrink-0">
        <input
          type="text"
          className="w-full px-4 py-2.5 bg-bg-tertiary border border-border rounded-lg text-text-primary text-sm outline-none focus:border-accent"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search conversations"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto py-2 sidebar-scrollbar">
        {sortedConversations.map((conversation) => (
          <ConversationItem key={conversation.id} conversation={conversation} />
        ))}
      </div>
    </div>
  );
}
