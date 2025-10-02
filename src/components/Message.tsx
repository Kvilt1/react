import { Message as MessageType, Conversation } from '@/types';
import { useArchiveStore } from '@/store/useArchiveStore';
import { formatTime, getMediaTypeIcon, isStatusMessage } from '@/lib/utils';
import { getUserColor } from '@/lib/colorAssignment';
import MessageMedia from './MessageMedia';
import SnapIndicator from './SnapIndicator';

interface MessageProps {
  message: MessageType;
  showSender: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  accountUsername: string | null;
  conversation: Conversation;
  messageIndex: number;
  searchQuery: string;
}

export default function Message({
  message,
  showSender,
  isFirstInGroup,
  isLastInGroup,
  accountUsername,
  conversation,
  messageIndex,
  searchQuery,
}: MessageProps) {
  const openLightbox = useArchiveStore((state) => state.openLightbox);

  // Check if it's a status message
  if (isStatusMessage(message.media_type)) {
    const icon = getMediaTypeIcon(message.media_type);
    const sender = getSenderDisplayName(
      message.from_user,
      accountUsername,
      conversation
    );
    
    let statusText = '';
    switch (message.media_type) {
      case 'STATUSERASEDMESSAGE':
        statusText = `${icon} ${sender} deleted a message`;
        break;
      case 'STATUSERASEDSNAPMESSAGE':
        statusText = `${icon} ${sender} deleted a snap`;
        break;
      case 'STATUSPARTICIPANTREMOVED':
        statusText = `${icon} ${sender} left the group`;
        break;
      case 'STATUSCONVERSATIONCAPTURESCREENSHOT':
        statusText = `${icon} ${sender} took a screenshot`;
        break;
      case 'STATUSSAVETOCAMERAROLL':
        statusText = `${icon} ${sender} saved to camera roll`;
        break;
      case 'STATUSCALLMISSEDAUDIO':
        statusText = `${icon} Missed audio call from ${sender}`;
        break;
      default:
        statusText = `${icon} ${message.content || message.media_type}`;
    }
    
    return (
      <div className="italic text-text-tertiary text-center py-2 text-[13px]">
        {statusText}
      </div>
    );
  }

  const sender = message.from_user;
  const senderColor = getUserColor(sender, accountUsername, conversation.id);
  const senderDisplayName = getSenderDisplayName(
    sender,
    accountUsername,
    conversation
  );

  const messageClasses = [
    'message',
    'block',
    showSender ? 'mt-3 mb-0' : 'mt-0 mb-0',
    isLastInGroup ? 'mb-2' : '',
  ].join(' ');

  // Highlight search terms
  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className={messageClasses}>
      {showSender && (
        <div
          className="text-[13px] font-semibold mb-0.5 mt-3"
          style={{ color: senderColor }}
        >
          {senderDisplayName}
        </div>
      )}
      
      <div
        className="relative pl-3 flex items-start gap-3 w-full"
        style={{ color: senderColor }}
      >
        <div
          className="absolute left-0 w-[3px] bg-current"
          style={{
            top: isFirstInGroup ? 0 : '-2px',
            bottom: isLastInGroup ? 0 : '-2px',
          }}
        ></div>
        
        <div className="flex-1 min-w-0">
          {/* Handle media and snaps */}
          {message.message_type === 'snap' &&
            (!message.media_ids || !message.media_ids.trim()) && (
              <SnapIndicator mediaType={message.media_type} />
            )}
          
          {message.media_ids && message.media_ids.trim() && (
            <MessageMedia
              message={message}
              conversation={conversation}
              onOpenLightbox={openLightbox}
              senderColor={senderColor}
              senderName={senderDisplayName}
              allMessages={conversation.messages}
              messageIndex={messageIndex}
            />
          )}
          
          {/* Message text */}
          {message.content && message.content.trim() && (
            <div className="message-text break-words leading-[1.4] text-text-primary text-sm">
              {highlightText(message.content)}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <div className="text-text-tertiary text-[11px] mt-0.5 whitespace-nowrap">
          {formatTime(message.created)}
        </div>
      </div>
    </div>
  );
}

function getSenderDisplayName(
  username: string,
  accountUsername: string | null,
  conversation: Conversation
): string {
  const isMe = username === accountUsername;
  if (isMe) return 'Me';
  
  const participant = conversation.metadata.participants.find(
    (p) => p.username === username
  );
  
  if (participant) {
    if (participant.display_name === 'NOT FOUND IN FRIENDS LIST') {
      return participant.username;
    }
    return participant.display_name || participant.username;
  }
  
  return username;
}
