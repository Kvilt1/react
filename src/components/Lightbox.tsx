import { useEffect, useRef } from 'react';
import { useArchiveStore } from '@/store/useArchiveStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Lightbox() {
  const lightboxState = useArchiveStore((state) => state.lightboxState);
  const closeLightbox = useArchiveStore((state) => state.closeLightbox);
  const navigateLightbox = useArchiveStore((state) => state.navigateLightbox);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (lightboxState.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      
      // Pause media when closing
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    }
  }, [lightboxState.isOpen]);

  // Check video dimensions for portrait mode
  useEffect(() => {
    if (lightboxState.mediaType === 'video' && videoRef.current) {
      const video = videoRef.current;
      const handleMetadata = () => {
        if (video.videoHeight > video.videoWidth) {
          video.parentElement?.classList.add('portrait-video');
        } else {
          video.parentElement?.classList.remove('portrait-video');
        }
      };
      
      video.addEventListener('loadedmetadata', handleMetadata);
      return () => video.removeEventListener('loadedmetadata', handleMetadata);
    }
  }, [lightboxState.mediaType, lightboxState.mediaSrc]);

  if (!lightboxState.isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeLightbox();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/95 z-[1000] cursor-pointer backdrop-blur-[10px]"
      onClick={handleBackdropClick}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[95vw] max-h-[95vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {lightboxState.mediaType === 'image' && (
          <img
            src={lightboxState.mediaSrc}
            alt="Lightbox"
            className="max-w-full max-h-full w-auto h-auto object-contain"
          />
        )}
        
        {lightboxState.mediaType === 'video' && (
          <video
            ref={videoRef}
            src={lightboxState.mediaSrc}
            controls
            className="max-w-full max-h-full w-auto h-auto cursor-pointer object-contain"
            onDoubleClick={(e) => {
              const video = e.currentTarget;
              if (video.requestFullscreen) {
                video.requestFullscreen();
              }
            }}
          />
        )}
        
        {lightboxState.mediaType === 'audio' && (
          <div className="flex flex-col items-center justify-center gap-5 p-10">
            <div className="text-7xl text-white">🎵</div>
            <audio
              ref={audioRef}
              src={lightboxState.mediaSrc}
              controls
              className="w-[300px] max-w-[90vw]"
            />
          </div>
        )}
      </div>
      
      <button
        className="absolute top-5 right-5 w-10 h-10 bg-bg-secondary rounded-full flex items-center justify-center cursor-pointer transition-all border border-border text-text-primary text-2xl hover:bg-accent hover:scale-110"
        onClick={closeLightbox}
        aria-label="Close lightbox"
      >
        &times;
      </button>
      
      {lightboxState.showNavigation && (
        <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 flex items-center gap-5 z-[1001]">
          <button
            className="w-[50px] h-[50px] rounded-full bg-black/70 border-2 border-white/30 text-white cursor-pointer flex items-center justify-center transition-all hover:bg-black/90 hover:border-white/60 hover:scale-110"
            onClick={() => navigateLightbox('prev')}
            aria-label="Previous media"
            title="Previous (←)"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="bg-black/70 text-white px-4 py-2 rounded-[20px] text-sm font-medium">
            {lightboxState.currentIndex + 1} / {lightboxState.items.length}
          </div>
          
          <button
            className="w-[50px] h-[50px] rounded-full bg-black/70 border-2 border-white/30 text-white cursor-pointer flex items-center justify-center transition-all hover:bg-black/90 hover:border-white/60 hover:scale-110"
            onClick={() => navigateLightbox('next')}
            aria-label="Next media"
            title="Next (→)"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
