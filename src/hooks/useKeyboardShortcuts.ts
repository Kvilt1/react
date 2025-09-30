import { useEffect } from 'react';
import { useArchiveStore } from '@/store/useArchiveStore';

export function useKeyboardShortcuts() {
  const closeLightbox = useArchiveStore((state) => state.closeLightbox);
  const navigateLightbox = useArchiveStore((state) => state.navigateLightbox);
  const lightboxState = useArchiveStore((state) => state.lightboxState);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close lightbox
      if (e.key === 'Escape') {
        if (lightboxState.isOpen) {
          closeLightbox();
        }
      }

      // Arrow keys for lightbox navigation
      if (
        (e.key === 'ArrowLeft' || e.key === 'ArrowRight') &&
        lightboxState.isOpen &&
        lightboxState.showNavigation
      ) {
        e.preventDefault();
        navigateLightbox(e.key === 'ArrowLeft' ? 'prev' : 'next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    closeLightbox,
    navigateLightbox,
    lightboxState,
  ]);
}
