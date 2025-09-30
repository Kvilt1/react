import { useEffect, useRef } from 'react';
import { Conversation } from '@/types';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';

interface ChatWindowProps {
  conversation: Conversation;
  isGalleryOpen: boolean;
  onToggleGallery: () => void;
}

export default function ChatWindow({ conversation, isGalleryOpen, onToggleGallery }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when conversation changes
    if (messagesEndRef.current) {
      const wrapper = messagesEndRef.current.parentElement;
      if (wrapper) {
        wrapper.scrollTop = wrapper.scrollHeight;
      }
    }
  }, [conversation.id]);

  return (
    <div className="flex-1 flex flex-col bg-bg-primary relative overflow-hidden">
      <ChatHeader
        conversation={conversation}
        isGalleryOpen={isGalleryOpen}
        onToggleGallery={onToggleGallery}
      />
      
      <MessageList
        conversation={conversation}
        searchQuery=""
        onSearchResults={() => {}}
      />
      
      <div ref={messagesEndRef} />
    </div>
  );
}
