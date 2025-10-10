import { useState } from 'react';
import { useArchiveStore } from '@/store/useArchiveStore';
import ChatWindow from './ChatWindow';
import MediaGallery from './MediaGallery';

interface MainContentProps {
  onOpenMobileConversations?: () => void;
}

export default function MainContent({
  onOpenMobileConversations,
}: MainContentProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const currentConversation = useArchiveStore(
    (state) => state.currentConversation
  );

  const toggleGallery = () => {
    setIsGalleryOpen(!isGalleryOpen);
  };

  if (!currentConversation) {
    return (
      <div className="flex-1 flex flex-col bg-bg-primary relative overflow-hidden">
        <div className="flex-1 flex items-center justify-center flex-col text-text-tertiary">
          <div className="text-6xl mb-4 opacity-50">💬</div>
          <div className="text-lg font-medium">Select a conversation to view</div>
          {onOpenMobileConversations && (
            <button
              className="mt-6 md:hidden px-5 py-2 rounded-full bg-accent text-bg-primary text-sm font-semibold shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5"
              onClick={onOpenMobileConversations}
            >
              Browse conversations
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-primary relative overflow-hidden">
      <div className={!isGalleryOpen ? 'flex-1 flex flex-col overflow-hidden' : 'hidden'}>
        <ChatWindow
          conversation={currentConversation}
          isGalleryOpen={isGalleryOpen}
          onToggleGallery={toggleGallery}
          onBackToList={onOpenMobileConversations}
        />
      </div>
      
      <div className={isGalleryOpen ? 'flex-1 flex flex-col overflow-hidden' : 'hidden'}>
        <MediaGallery
          conversation={currentConversation}
          isGalleryOpen={isGalleryOpen}
          onToggleGallery={toggleGallery}
        />
      </div>
    </div>
  );
}
