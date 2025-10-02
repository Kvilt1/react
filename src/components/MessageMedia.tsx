import { Message, Conversation } from '@/types';
import { getFileExtension, getMediaTypeIcon } from '@/lib/utils';
import AudioPlayer from './AudioPlayer';

interface MessageMediaProps {
  message: Message;
  conversation: Conversation;
  onOpenLightbox: (src: string, type: 'image' | 'video' | 'audio') => void;
  senderColor?: string;
  senderName?: string;
  allMessages?: Message[];
  messageIndex?: number;
}

export default function MessageMedia({
  message,
  conversation,
  onOpenLightbox,
  senderColor = '#3498db',
  senderName = 'Unknown',
  allMessages = [],
  messageIndex = -1,
}: MessageMediaProps) {
  const mediaLocations = message.media_locations || [];
  const mediaType = message.media_type;

  // Find the next voice message in the chain (same sender, consecutive NOTE messages)
  const getNextVoiceMessage = (): string | null => {
    if (mediaType !== 'NOTE' || messageIndex === -1 || !allMessages.length) {
      return null;
    }

    const nextMessage = allMessages[messageIndex + 1];
    if (!nextMessage) return null;

    // Check if next message is from same sender and is also a NOTE
    if (
      nextMessage.from_user === message.from_user &&
      nextMessage.media_type === 'NOTE' &&
      nextMessage.media_locations &&
      nextMessage.media_locations.length > 0
    ) {
      return `${conversation.dir}/${nextMessage.media_locations[0]}`;
    }

    return null;
  };

  const nextAudioSrc = getNextVoiceMessage();

  if (mediaLocations.length === 0) {
    // Show styled placeholders for different media types
    const icon = getMediaTypeIcon(mediaType);
    
    switch (mediaType) {
      case 'STICKER':
        return (
          <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] py-8 px-10 rounded-2xl text-center inline-block min-w-[140px] shadow-lg">
            <div className="text-5xl mb-2 drop-shadow-md">{icon}</div>
            <div className="text-white font-semibold text-sm uppercase tracking-wide">
              Sticker
            </div>
          </div>
        );
        
      case 'SHARE':
        return (
          <div className="bg-bg-tertiary border border-border rounded-xl p-4 inline-flex items-center gap-4 max-w-[320px] transition-all hover:border-accent-muted hover:-translate-y-px">
            <div className="text-[28px] flex-shrink-0">{icon}</div>
            <div className="text-left">
              <div className="text-text-primary font-semibold text-sm mb-0.5">
                Shared content
              </div>
              <div className="text-text-tertiary text-xs">
                {message.content || 'Link or content'}
              </div>
            </div>
          </div>
        );
        
      case 'SHARESAVEDSTORY':
        return (
          <div className="bg-gradient-to-br from-[#f093fb] to-[#f5576c] py-6 px-8 rounded-2xl text-center inline-block min-w-[160px] shadow-lg">
            <div className="text-4xl mb-2 drop-shadow-md">{icon}</div>
            <div className="text-white font-semibold text-sm uppercase tracking-wide">
              Shared Story
            </div>
          </div>
        );
        
      case 'MAPREACTION':
        return (
          <div className="bg-[#4285f4] text-white py-3 px-6 rounded-3xl inline-flex items-center gap-2.5 font-medium text-sm shadow-lg transition-all hover:-translate-y-px">
            <span className="text-xl">{icon}</span>
            <span>Location</span>
          </div>
        );
        
      default:
        return (
          <div className="bg-bg-tertiary p-5 rounded-lg text-center text-text-secondary text-[13px] max-w-[300px]">
            [{mediaType}]
          </div>
        );
    }
  }

  return (
    <div className="py-2">
      {mediaLocations.map((location, idx) => {
        const fullPath = `${conversation.dir}/${location}`;
        const extension = getFileExtension(location);
        
        if (mediaType === 'NOTE') {
          return (
            <div key={idx} className="my-1 flex items-center" style={{ height: '60px', overflow: 'visible' }}>
              <AudioPlayer
                audioSrc={fullPath}
                senderColor={senderColor}
                senderName={senderName}
                nextAudioSrc={nextAudioSrc}
              />
            </div>
          );
        } else if (mediaType === 'IMAGE') {
          return (
            <img
              key={idx}
              src={fullPath}
              alt="Image"
              loading="lazy"
              className="max-w-[300px] max-h-[300px] rounded-lg block cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => onOpenLightbox(fullPath, 'image')}
            />
          );
        } else if (mediaType === 'VIDEO') {
          return (
            <video
              key={idx}
              controls
              preload="metadata"
              src={fullPath}
              className="max-w-[400px] max-h-[400px] rounded-lg block bg-bg-tertiary outline-none cursor-pointer hover:opacity-90"
              onClick={() => onOpenLightbox(fullPath, 'video')}
            />
          );
        } else if (mediaType === 'MEDIA') {
          // For MEDIA type, check file extension
          if (['mp4', 'mov'].includes(extension)) {
            return (
              <video
                key={idx}
                controls
                preload="metadata"
                src={fullPath}
                className="max-w-[400px] max-h-[400px] rounded-lg block bg-bg-tertiary outline-none cursor-pointer hover:opacity-90"
                onClick={() => onOpenLightbox(fullPath, 'video')}
              />
            );
          } else if (['jpeg', 'jpg', 'png'].includes(extension)) {
            return (
              <img
                key={idx}
                src={fullPath}
                alt="Media"
                loading="lazy"
                className="max-w-[300px] max-h-[300px] rounded-lg block cursor-pointer transition-transform hover:scale-[1.02]"
                onClick={() => onOpenLightbox(fullPath, 'image')}
              />
            );
          } else {
            return (
              <img
                key={idx}
                src={fullPath}
                alt="Media"
                loading="lazy"
                className="max-w-[300px] max-h-[300px] rounded-lg block cursor-pointer transition-transform hover:scale-[1.02]"
                onClick={() => onOpenLightbox(fullPath, 'image')}
              />
            );
          }
        }
        
        return null;
      })}
    </div>
  );
}
