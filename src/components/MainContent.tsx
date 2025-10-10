import { useState } from 'react';
import { useArchiveStore } from '@/store/useArchiveStore';
import ChatWindow from './ChatWindow';
import MediaGallery from './MediaGallery';

export default function MainContent() {
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-primary relative overflow-hidden">
      {isGalleryOpen ? (
        <MediaGallery
          conversation={currentConversation}
          isGalleryOpen={isGalleryOpen}
          onToggleGallery={toggleGallery}
        />
      ) : (
        <ChatWindow
          conversation={currentConversation}
          isGalleryOpen={isGalleryOpen}
          onToggleGallery={toggleGallery}
        />
      )}
    </div>
  );
}
