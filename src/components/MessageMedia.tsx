import { useRef, useEffect } from 'react';
import { Message, Conversation } from '@/types';
import { getFileExtension, getMediaTypeIcon } from '@/lib/utils';
import { useArchiveStore } from '@/store/useArchiveStore';

interface MessageMediaProps {
  message: Message;
  conversation: Conversation;
  onOpenLightbox: (src: string, type: 'image' | 'video' | 'audio') => void;
}

export default function MessageMedia({
  message,
  conversation,
  onOpenLightbox,
}: MessageMediaProps) {
  const mediaLocations = message.media_locations || [];
  const mediaType = message.media_type;
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const currentlyPlayingAudio = useArchiveStore((state) => state.currentlyPlayingAudio);
  const setCurrentlyPlayingAudio = useArchiveStore((state) => state.setCurrentlyPlayingAudio);
  
  // Use a ref for immediate tracking (before state updates)
  const isInterruptingRef = useRef(false);

  const handleAudioPlay = (audioElement: HTMLAudioElement) => {
    // Store the old audio reference if any
    const previousAudio = currentlyPlayingAudio;
    
    // Mark that we're interrupting another audio
    if (previousAudio && previousAudio !== audioElement) {
      isInterruptingRef.current = true;
    }
    
    // Set this audio as the currently playing one
    setCurrentlyPlayingAudio(audioElement);
    
    // Pause and reset the previously playing audio if it's different
    if (previousAudio && previousAudio !== audioElement) {
      previousAudio.pause();
      previousAudio.currentTime = 0;
      // Reset the flag after a brief moment
      setTimeout(() => {
        isInterruptingRef.current = false;
      }, 50);
    }
  };

  const handleAudioPause = (audioElement: HTMLAudioElement) => {
    // Don't reset if we're in the middle of switching to another audio
    if (isInterruptingRef.current) {
      return;
    }
    
    // Only clear and reset if it's this audio that's pausing
    if (currentlyPlayingAudio === audioElement) {
      setCurrentlyPlayingAudio(null);
      // Reset to start when paused
      audioElement.currentTime = 0;
    }
  };

  const handleAudioEnded = (audioElement: HTMLAudioElement) => {
    // Reset to start when audio finishes playing
    audioElement.currentTime = 0;
    if (currentlyPlayingAudio === audioElement) {
      setCurrentlyPlayingAudio(null);
    }
  };

  // Cleanup: pause audio if it's playing when component unmounts
  useEffect(() => {
    return () => {
      audioRefs.current.forEach((audio) => {
        if (audio && currentlyPlayingAudio === audio) {
          audio.pause();
          setCurrentlyPlayingAudio(null);
        }
      });
    };
  }, [currentlyPlayingAudio, setCurrentlyPlayingAudio]);

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
            <div key={idx} className="my-1">
              <audio
                ref={(el) => (audioRefs.current[idx] = el)}
                controls
                preload="none"
                src={fullPath}
                className="w-full max-w-[300px] h-8 outline-none"
                onPlay={(e) => handleAudioPlay(e.currentTarget)}
                onPause={(e) => handleAudioPause(e.currentTarget)}
                onEnded={(e) => handleAudioEnded(e.currentTarget)}
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
