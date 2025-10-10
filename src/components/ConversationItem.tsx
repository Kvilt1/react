import { useArchiveStore } from '@/store/useArchiveStore';
import { Conversation } from '@/types';
import { parseSnapchatDate } from '@/lib/utils';
import { getUserColor } from '@/lib/colorAssignment';
import { useState } from 'react';
import ChatSentIcon from '@/assets/icons/chat-sent.svg?react';
import ChatReceivedIcon from '@/assets/icons/chat-received.svg?react';
import SnapSentIcon from '@/assets/icons/snap-sent.svg?react';
import SnapReceivedIcon from '@/assets/icons/snap-received.svg?react';
import VideoSentIcon from '@/assets/icons/video-sent.svg?react';
import VideoReceivedIcon from '@/assets/icons/video-received.svg?react';

interface ConversationItemProps {
  conversation: Conversation;
  onConversationSelected?: () => void;
}

export default function ConversationItem({
  conversation,
  onConversationSelected,
}: ConversationItemProps) {
  const currentConversation = useArchiveStore((state) => state.currentConversation);
  const setCurrentConversation = useArchiveStore(
    (state) => state.setCurrentConversation
  );
  const accountUsername = useArchiveStore((state) => state.accountUsername);
  const indexData = useArchiveStore((state) => state.indexData);
  const currentDate = useArchiveStore((state) => state.currentDate);
  const [bitmojiError, setBitmojiError] = useState(false);
  
  const isActive = currentConversation?.id === conversation.id;
  
  const participant = conversation.metadata.participants[0];
  const displayName =
    conversation.type === 'group'
      ? conversation.name.split(' - ')[1] || conversation.name
      : participant?.display_name === 'NOT FOUND IN FRIENDS LIST'
      ? participant.username
      : participant?.display_name || participant?.username || 'Unknown';
  
  // Use the first participant's color (or group color based on conversation ID)
  const username = conversation.type === 'group' 
    ? conversation.id // For groups, use the group ID to generate a consistent color
    : participant?.username || 'unknown';
  const avatarColor = getUserColor(username, accountUsername, conversation.id);
  
  // Get bitmoji path for individual conversations (dm = direct message)
  const bitmojiPath = conversation.type === 'dm' && indexData && participant
    ? indexData.users.find(u => u.username === participant.username)?.bitmoji
    : null;
  
  const showBitmoji = bitmojiPath && !bitmojiError;
  
  // Get last message for status display
  const lastMessage = conversation.messages.length > 0 
    ? conversation.messages[conversation.messages.length - 1]
    : null;
  
  // Calculate relative time from the viewing date (end of day)
  const getRelativeTime = (dateString: string): string => {
    if (!currentDate) return '';
    
    const messageDate = parseSnapchatDate(dateString);
    // Set reference point to end of the viewing day (23:59:59)
    const referenceDate = new Date(currentDate);
    referenceDate.setHours(23, 59, 59, 999);
    
    const diffMs = referenceDate.getTime() - messageDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    
    if (diffSeconds < 60) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return `${diffWeeks}w`;
  };
  
  const relativeTime = conversation.stats.date_range.last_message
    ? getRelativeTime(conversation.stats.date_range.last_message)
    : '';
  
  // Determine status text and icon based on latest message
  const getStatusIcon = () => {
    if (!lastMessage) return null;
    
    const isSent = lastMessage.is_sender;
    const messageType = lastMessage.message_type;
    const mediaType = lastMessage.media_type;
    
    // If message type is 'message', always use chat icons
    if (messageType === 'message') {
      return isSent ? <ChatSentIcon /> : <ChatReceivedIcon />;
    }
    
    // If message type is 'snap'
    if (messageType === 'snap') {
      // If media_type is VIDEO, use video icons
      if (mediaType === 'VIDEO') {
        return isSent ? <VideoSentIcon /> : <VideoReceivedIcon />;
      }
      // If media_type is IMAGE (or other), use snap icons
      return isSent ? <SnapSentIcon /> : <SnapReceivedIcon />;
    }
    
    // Default fallback to chat icons
    return isSent ? <ChatSentIcon /> : <ChatReceivedIcon />;
  };
  
  const statusText = lastMessage 
    ? (lastMessage.is_sender ? 'Opened' : 'Received')
    : 'No messages';

  return (
    <div
      className={`flex items-center px-3 py-2 cursor-pointer transition-colors border-b border-[#696969] gap-2.5 ${
        isActive ? 'bg-bg-tertiary' : 'hover:bg-hover-bg'
      }`}
      onClick={() => {
        setCurrentConversation(conversation);
        onConversationSelected?.();
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open conversation with ${displayName}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setCurrentConversation(conversation);
          onConversationSelected?.();
        }
      }}
    >
      {/* Avatar - 58px x 58px with 2px padding effect */}
      <div className="flex-shrink-0 relative w-[58px] h-[58px] rounded-[29px] bg-[#282828]">
        <div className="absolute left-[2px] top-[2px] w-[54px] h-[54px] overflow-hidden rounded-[27px]">
          <div
            className="w-full h-full flex items-center justify-center text-xl font-semibold text-white"
            style={{ backgroundColor: showBitmoji ? 'transparent' : avatarColor }}
          >
            {showBitmoji ? (
              <img
                src={`/${bitmojiPath}`}
                alt={`${displayName}'s bitmoji`}
                className="w-full h-full object-cover"
                onError={() => setBitmojiError(true)}
              />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
      </div>
      
      {/* User & Status */}
      <div className="flex-1 min-w-0 h-[54px] py-1 flex flex-col justify-start gap-1" style={{ fontFamily: 'Avenir Next' }}>
        <div className="flex justify-center flex-col text-white text-base font-normal">
          {displayName}
        </div>
        <div className="flex items-center gap-1">
          <div className="flex-1 py-px flex items-center gap-[5px]">
            {/* Status Icon */}
            <div className="relative flex-shrink-0">
              {getStatusIcon()}
            </div>
            {/* Status Text */}
            <div className="overflow-hidden flex justify-start items-start">
              <div className="flex justify-center flex-col text-white text-xs font-normal">
                {statusText}
              </div>
            </div>
            {/* Dot separator */}
            <div className="flex justify-center flex-col text-white text-xs font-bold">·</div>
            {/* Relative time */}
            <div className="flex justify-center flex-col text-white text-xs font-normal">
              {relativeTime}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
