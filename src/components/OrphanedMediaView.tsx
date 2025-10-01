import { useState, useEffect } from 'react';
import { OrphanedMedia, OrphanedMediaItem } from '@/types';
import { useArchiveStore } from '@/store/useArchiveStore';

interface OrphanedMediaViewProps {
  orphanedMedia: OrphanedMedia | null;
}

export default function OrphanedMediaView({
  orphanedMedia,
}: OrphanedMediaViewProps) {
  const openLightbox = useArchiveStore((state) => state.openLightbox);
  const [filter, setFilter] = useState<string>('all');
  const [filteredItems, setFilteredItems] = useState<OrphanedMediaItem[]>([]);

  useEffect(() => {
    if (!orphanedMedia) return;
    
    if (filter === 'all') {
      setFilteredItems(orphanedMedia.orphaned_media);
    } else {
      setFilteredItems(
        orphanedMedia.orphaned_media.filter((item) => item.type === filter)
      );
    }
  }, [filter, orphanedMedia]);

  if (!orphanedMedia || orphanedMedia.orphaned_media_count === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-primary">
        <div className="text-text-tertiary text-center">
          <div className="text-6xl mb-4 opacity-50">📷</div>
          <div className="text-lg font-medium">No orphaned media</div>
        </div>
      </div>
    );
  }

  const counts = {
    all: orphanedMedia.orphaned_media.length,
    IMAGE: orphanedMedia.orphaned_media.filter((item) => item.type === 'IMAGE')
      .length,
    VIDEO: orphanedMedia.orphaned_media.filter((item) => item.type === 'VIDEO')
      .length,
    AUDIO: orphanedMedia.orphaned_media.filter((item) => item.type === 'AUDIO')
      .length,
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-primary">
      <div className="px-5 py-4 bg-bg-secondary border-b border-border">
        <div className="flex gap-2.5 mb-5 flex-wrap">
          {(['all', 'IMAGE', 'VIDEO', 'AUDIO'] as const).map((f) => (
            <button
              key={f}
              className={`px-4 py-2 rounded-[20px] text-[13px] cursor-pointer transition-all flex items-center gap-1.5 ${
                filter === f
                  ? 'bg-accent text-bg-primary border border-accent'
                  : 'bg-bg-tertiary text-text-secondary border border-border hover:bg-hover-bg hover:text-text-primary'
              }`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()} (
              {counts[f]})
            </button>
          ))}
        </div>
        
        <div className="text-sm text-text-secondary">
          Showing {filteredItems.length} of {orphanedMedia.orphaned_media.length} media items
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {filteredItems.map((item, index) => (
            <MediaItemCard
              key={index}
              item={item}
              index={index}
              allItems={filteredItems}
              onOpenLightbox={openLightbox}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface MediaItemCardProps {
  item: OrphanedMediaItem;
  index: number;
  allItems: OrphanedMediaItem[];
  onOpenLightbox: (
    src: string,
    type: 'image' | 'video' | 'audio',
    items?: any[],
    index?: number
  ) => void;
}

function MediaItemCard({
  item,
  index,
  allItems,
  onOpenLightbox,
}: MediaItemCardProps) {
  const fullPath = item.path;

  const handleClick = () => {
    if (item.type === 'IMAGE') {
      const mediaItems = allItems.map((i) => ({
        type: i.type,
        path: i.path,
        message_id: '',
        date: '',
        sender: '',
        media_type: i.type,
      }));
      onOpenLightbox(fullPath, 'image', mediaItems, index);
    } else if (item.type === 'VIDEO') {
      const mediaItems = allItems.map((i) => ({
        type: i.type,
        path: i.path,
        message_id: '',
        date: '',
        sender: '',
        media_type: i.type,
      }));
      onOpenLightbox(fullPath, 'video', mediaItems, index);
    } else if (item.type === 'AUDIO') {
      onOpenLightbox(fullPath, 'audio');
    }
  };

  return (
    <div
      className="relative bg-bg-secondary rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
      onClick={handleClick}
    >
      {item.type === 'IMAGE' && (
        <img
          src={fullPath}
          alt={item.filename}
          loading="lazy"
          className="w-full h-[200px] object-cover"
        />
      )}
      
      {item.type === 'VIDEO' && (
        <div className="relative">
          <video
            src={fullPath}
            preload="metadata"
            className="w-full h-[200px] object-cover"
          />
          {/* Play button indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border-2 border-white/80">
              <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>
      )}
      
      {item.type === 'AUDIO' && (
        <div className="flex items-center justify-center h-[200px] bg-bg-secondary">
          <div className="text-center">
            <div className="text-5xl">🎵</div>
            <div className="text-text-secondary text-sm mt-2">Audio File</div>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white px-2 py-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis">
        {item.filename}
      </div>
    </div>
  );
}

