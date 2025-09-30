interface SnapIndicatorProps {
  mediaType: string;
}

export default function SnapIndicator({ mediaType }: SnapIndicatorProps) {
  let colorClass = 'text-text-secondary';
  
  if (mediaType === 'IMAGE') {
    colorClass = 'text-[#ff4757]';
  } else if (mediaType === 'VIDEO') {
    colorClass = 'text-[#9b59b6]';
  }

  return (
    <div className="inline-flex items-center gap-3 py-3 px-5 bg-bg-tertiary rounded-xl border border-border font-medium text-[15px]">
      <div className={`w-6 h-6 flex items-center justify-center ${colorClass}`}>
        <div className="w-[18px] h-[18px] border-2 border-current rounded"></div>
      </div>
      <div className="text-text-primary">Opened</div>
    </div>
  );
}
