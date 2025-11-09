import { useState, useEffect } from 'react';
import { Conversation, MediaFilter, MediaItem } from '@/types';
import { useArchiveStore } from '@/store/useArchiveStore';
import { getFileExtension } from '@/lib/utils';
import ChatHeader from './ChatHeader';

interface MediaGalleryProps {
  conversation: Conversation;
  isGalleryOpen: boolean;
  onToggleGallery: () => void;
}

export default function MediaGallery({
  conversation,
  isGalleryOpen,
  onToggleGallery,
}: MediaGalleryProps) {
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [allMediaItems, setAllMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const openLightbox = useArchiveStore((state) => state.openLightbox);

  useEffect(() => {
    // Collect all media items (excluding voice notes/audio)
    const items: MediaItem[] = [];
    
    conversation.messages.forEach((message, idx) => {
      if (
        message.media_type &&
        ['IMAGE', 'VIDEO', 'MEDIA', 'STICKER'].includes(
          message.media_type
        )
      ) {
        const mediaLocations = message.media_locations || [];
        
        if (mediaLocations.length > 0) {
          mediaLocations.forEach((location) => {
            let displayType = message.media_type;
            
            // For MEDIA type, determine actual type based on file extension
            if (message.media_type === 'MEDIA') {
              const extension = getFileExtension(location);
              if (['mp4', 'mov'].includes(extension)) {
                displayType = 'VIDEO';
              } else if (['jpeg', 'jpg', 'png'].includes(extension)) {
                displayType = 'IMAGE';
              }
            }
            
            // Only add IMAGE and VIDEO types to gallery
            if (displayType === 'IMAGE' || displayType === 'VIDEO') {
              items.push({
                type: displayType,
                path: `${conversation.dir}/${location}`,
                message_id: `msg-${idx}`,
                date: message.created,
                sender: message.from_user,
                media_type: message.media_type,
              });
            }
          });
        }
      }
    });
    
    setAllMediaItems(items);
  }, [conversation]);

  useEffect(() => {
    // Filter items
    if (filter === 'all') {
      setFilteredItems(allMediaItems);
    } else {
      setFilteredItems(allMediaItems.filter((item) => item.type === filter));
    }
  }, [filter, allMediaItems]);

  const counts = {
    all: allMediaItems.length,
    IMAGE: allMediaItems.filter((item) => item.type === 'IMAGE').length,
    VIDEO: allMediaItems.filter((item) => item.type === 'VIDEO').length,
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChatHeader
        conversation={conversation}
        isGalleryOpen={isGalleryOpen}
        onToggleGallery={onToggleGallery}
      />
      
      <div className="px-5 py-4 bg-bg-secondary border-b border-border">
        <div className="flex gap-3 mb-3 flex-wrap">
          <button
            className={`px-4 py-2 rounded-[20px] text-[13px] cursor-pointer transition-all flex items-center gap-1.5 ${
              filter === 'all'
                ? 'bg-accent text-bg-primary border border-accent'
                : 'bg-bg-tertiary text-text-secondary border border-border hover:bg-hover-bg hover:text-text-primary'
            }`}
            onClick={() => setFilter('all')}
          >
            All Media
            <span
              className={`px-1.5 py-0.5 rounded-[10px] text-[11px] font-semibold ${
                filter === 'all' ? 'bg-black/30' : 'bg-black/30'
              }`}
            >
              {counts.all}
            </span>
          </button>
          <button
            className={`px-4 py-2 rounded-[20px] text-[13px] cursor-pointer transition-all flex items-center gap-1.5 ${
              filter === 'IMAGE'
                ? 'bg-accent text-bg-primary border border-accent'
                : 'bg-bg-tertiary text-text-secondary border border-border hover:bg-hover-bg hover:text-text-primary'
            }`}
            onClick={() => setFilter('IMAGE')}
          >
            Images
            <span
              className={`px-1.5 py-0.5 rounded-[10px] text-[11px] font-semibold ${
                filter === 'IMAGE' ? 'bg-black/30' : 'bg-black/30'
              }`}
            >
              {counts.IMAGE}
            </span>
          </button>
          <button
            className={`px-4 py-2 rounded-[20px] text-[13px] cursor-pointer transition-all flex items-center gap-1.5 ${
              filter === 'VIDEO'
                ? 'bg-accent text-bg-primary border border-accent'
                : 'bg-bg-tertiary text-text-secondary border border-border hover:bg-hover-bg hover:text-text-primary'
            }`}
            onClick={() => setFilter('VIDEO')}
          >
            Videos
            <span
              className={`px-1.5 py-0.5 rounded-[10px] text-[11px] font-semibold ${
                filter === 'VIDEO' ? 'bg-black/30' : 'bg-black/30'
              }`}
            >
              {counts.VIDEO}
            </span>
          </button>
        </div>
        
        <div className="text-sm text-text-secondary">
          Showing {filteredItems.length} of {allMediaItems.length} media items
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] auto-rows-auto gap-4">
          {filteredItems.map((item, index) => (
            <MediaGridItem
              key={index}
              item={item}
              onClick={() => {
                if (item.type === 'IMAGE') {
                  openLightbox(item.path, 'image');
                } else if (item.type === 'VIDEO') {
                  openLightbox(item.path, 'video');
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface MediaGridItemProps {
  item: MediaItem;
  onClick: () => void;
}

function MediaGridItem({ item, onClick }: MediaGridItemProps) {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div
      className="relative bg-bg-tertiary rounded-lg overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
      onClick={onClick}
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
    >
      {item.type === 'IMAGE' && (
        <img
          src={item.path}
          alt="Media"
          loading="lazy"
          className="w-full h-auto object-contain"
        />
      )}
      {item.type === 'VIDEO' && (
        <>
          <video
            src={item.path}
            preload="metadata"
            className="w-full h-auto object-contain bg-black"
          />
          {/* Play button indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border-2 border-white/80">
              <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
            </div>
          </div>
        </>
      )}
      
      <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-[11px] font-semibold text-white">
        {item.type}
      </div>
      
      {showOverlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-xs">
            <div>{item.sender}</div>
            <div>{new Date(item.date).toLocaleDateString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
