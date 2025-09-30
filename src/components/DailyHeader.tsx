import { useArchiveStore } from '@/store/useArchiveStore';

interface DailyHeaderProps {
  date: string;
  stats: {
    conversationCount: number;
    messageCount: number;
    mediaCount: number;
  };
  orphanedCount: number;
}

export default function DailyHeader({
  date,
  stats,
  orphanedCount,
}: DailyHeaderProps) {
  const setShowOrphanedModal = useArchiveStore(
    (state) => state.setShowOrphanedModal
  );
  
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-bg-secondary border-b border-border px-5 py-3 flex items-center justify-between min-h-[80px]">
      <a
        href="/calendar"
        className="text-accent no-underline text-sm font-medium flex items-center gap-1 transition-all px-3 py-2 rounded hover:-translate-x-0.5"
      >
        ← Calendar
      </a>
      
      <div className="flex-1 flex items-center justify-center gap-5">
        <span className="px-4 py-2 bg-bg-tertiary border border-border rounded text-text-primary no-underline text-sm font-medium flex items-center gap-1.5 opacity-30 cursor-not-allowed">
          ← Previous Day
        </span>
        
        <div className="text-center">
          <h1 className="text-xl text-accent m-0 font-semibold">
            {formattedDate}
          </h1>
          <div className="text-xs text-text-secondary mt-1">
            <span>{stats.conversationCount} conversations</span>
            <span className="mx-2">•</span>
            <span>{stats.messageCount} messages</span>
            <span className="mx-2">•</span>
            <span>{stats.mediaCount} media</span>
            {orphanedCount > 0 && (
              <>
                <span className="mx-2">•</span>
                <button
                  className="bg-snap-purple text-white border-none px-3 py-1 rounded-2xl text-xs cursor-pointer transition-all font-medium hover:bg-[#8b41ff] hover:-translate-y-px"
                  onClick={() => setShowOrphanedModal(true)}
                  aria-label={`View ${orphanedCount} orphaned media items`}
                >
                  📷 Orphaned Media ({orphanedCount})
                </button>
              </>
            )}
          </div>
        </div>
        
        <a
          href="/day/2025-07-28"
          className="px-4 py-2 bg-bg-tertiary border border-border rounded text-text-primary no-underline text-sm font-medium transition-all flex items-center gap-1.5 hover:bg-hover-bg hover:border-accent hover:-translate-y-px"
        >
          Next Day →
        </a>
      </div>
      
      <div className="w-[100px]"></div>
    </div>
  );
}
