import { useEffect, useRef } from 'react';
import { Conversation } from '@/types';
import { useArchiveStore } from '@/store/useArchiveStore';
import Message from './Message';
import { formatDate } from '@/lib/utils';

interface MessageListProps {
  conversation: Conversation;
  searchQuery: string;
  onSearchResults: (count: number) => void;
}

export default function MessageList({
  conversation,
  searchQuery,
  onSearchResults,
}: MessageListProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const accountUsername = useArchiveStore((state) => state.accountUsername);

  useEffect(() => {
    // Perform search
    if (searchQuery) {
      const messages = document.querySelectorAll('.message');
      let count = 0;
      
      messages.forEach((msg) => {
        const textElement = msg.querySelector('.message-text');
        if (textElement) {
          const text = textElement.textContent || '';
          if (text.toLowerCase().includes(searchQuery.toLowerCase())) {
            count++;
          }
        }
      });
      
      onSearchResults(count);
    } else {
      onSearchResults(0);
    }
  }, [searchQuery, conversation.id, onSearchResults]);

  let currentDate = '';
  let prevSender: string | null = null;

  return (
    <div
      ref={wrapperRef}
      className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar"
    >
      <div className="p-5 min-h-full">
        {conversation.messages.map((message, index) => {
          const messageDate = message.created.split(' ')[0];
          const showDateDivider = messageDate !== currentDate;
          const showSender = prevSender !== message.from_user;
          
          const nextMsg = conversation.messages[index + 1];
          const isLastInGroup =
            !nextMsg ||
            nextMsg.from_user !== message.from_user ||
            nextMsg.created.split(' ')[0] !== messageDate;
          
          if (showDateDivider) {
            currentDate = messageDate;
            prevSender = null;
          }
          
          const element = (
            <div key={index}>
              {showDateDivider && (
                <div className="text-center my-6 relative">
                  <span className="bg-bg-primary px-4 text-[13px] text-text-tertiary relative z-[1]">
                    {formatDate(messageDate)}
                  </span>
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-border"></div>
                </div>
              )}
              <Message
                message={message}
                showSender={showSender}
                isFirstInGroup={showSender}
                isLastInGroup={isLastInGroup}
                accountUsername={accountUsername}
                conversation={conversation}
                messageIndex={index}
                searchQuery={searchQuery}
              />
            </div>
          );
          
          if (showSender) {
            prevSender = message.from_user;
          }
          
          return element;
        })}
      </div>
    </div>
  );
}
