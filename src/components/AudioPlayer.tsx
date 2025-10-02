import { useRef, useState, useEffect } from 'react';
import { useArchiveStore } from '@/store/useArchiveStore';
import playButtonIcon from '@/assets/icons/play-button.svg';

interface AudioPlayerProps {
  audioSrc: string;
  senderColor: string;
  senderName: string;
  nextAudioSrc?: string | null;
}

export default function AudioPlayer({ audioSrc, senderColor, nextAudioSrc = null }: AudioPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);
  const isInterruptingRef = useRef<boolean>(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentlyPlayingAudio = useArchiveStore((state) => state.currentlyPlayingAudio);
  const setCurrentlyPlayingAudio = useArchiveStore((state) => state.setCurrentlyPlayingAudio);
  const registerAudioPlayCallback = useArchiveStore((state) => state.registerAudioPlayCallback);
  const unregisterAudioPlayCallback = useArchiveStore((state) => state.unregisterAudioPlayCallback);
  const triggerAudioPlay = useArchiveStore((state) => state.triggerAudioPlay);

  // Speed options
  const speedOptions = [1, 1.5, 2];

  // Waveform configuration
  const BAR_COUNT = 38;
  const BAR_WIDTH = 6;
  const BAR_GAP = 4;
  const CANVAS_HEIGHT = 64;
  const CANVAS_WIDTH = BAR_COUNT * (BAR_WIDTH + BAR_GAP);

  // Generate waveform data from audio
  useEffect(() => {
    const audio = new Audio(audioSrc);
    audioRef.current = audio;

    const generateWaveform = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const response = await fetch(audioSrc);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const rawData = audioBuffer.getChannelData(0);
        const samples = BAR_COUNT;
        const blockSize = Math.floor(rawData.length / samples);
        const rawBars: number[] = [];
        
        // First pass: collect raw averages
        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[i * blockSize + j]);
          }
          const average = sum / blockSize;
          rawBars.push(average);
        }
        
        // Find max value for normalization
        const maxValue = Math.max(...rawBars);
        
        // Second pass: normalize to full height range
        const bars: number[] = rawBars.map(value => {
          const normalized = (value / maxValue) * CANVAS_HEIGHT;
          // Ensure minimum is BAR_WIDTH for perfect circles
          return Math.max(BAR_WIDTH, normalized);
        });
        
        setWaveformData(bars);
        setIsReady(true);
      } catch (error) {
        console.error('Error generating waveform:', error);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      generateWaveform();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      // Stop other audio if playing
      const previousAudio = currentlyPlayingAudio;
      if (previousAudio && previousAudio !== audio) {
        isInterruptingRef.current = true;
        previousAudio.pause();
        previousAudio.currentTime = 0;
        setTimeout(() => {
          isInterruptingRef.current = false;
        }, 50);
      }
      setCurrentlyPlayingAudio(audio);
    };

    const handlePause = () => {
      if (!isInterruptingRef.current) {
        setIsPlaying(false);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (currentlyPlayingAudio === audio) {
        setCurrentlyPlayingAudio(null);
      }
      
      // Auto-play next audio if it exists
      if (nextAudioSrc) {
        setTimeout(() => {
          triggerAudioPlay(nextAudioSrc);
        }, 100);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
        audio.src = '';
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioSrc]);

  // Register play callback for this audio
  useEffect(() => {
    const playCallback = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play();
      }
    };

    registerAudioPlayCallback(audioSrc, playCallback);

    return () => {
      unregisterAudioPlayCallback(audioSrc);
    };
  }, [audioSrc, isPlaying, registerAudioPlayCallback, unregisterAudioPlayCallback]);

  // Draw waveform
  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0 || !audioRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (timestamp: number) => {
      // Throttle to ~24fps for less smooth animation
      const elapsed = timestamp - lastFrameTimeRef.current;
      if (elapsed < 1000 / 24) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }
      lastFrameTimeRef.current = timestamp;
      
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Read current time directly from audio element for smooth updates
      const currentAudioTime = audioRef.current?.currentTime || 0;
      const progress = duration > 0 ? currentAudioTime / duration : 0;
      
      // Calculate progress based on bar count (skipping gaps)
      const progressInBars = progress * waveformData.length;
      
      // Get hover progress if dragging
      const hoverProgressInBars = (hoverProgress !== null && isDragging) ? hoverProgress * waveformData.length : null;

      waveformData.forEach((height, index) => {
        const x = index * (BAR_WIDTH + BAR_GAP);
        const y = (CANVAS_HEIGHT - height) / 2;
        const radius = BAR_WIDTH / 2;
        
        // Determine which progress to use for coloring - drag preview takes precedence
        const displayProgressInBars = hoverProgressInBars !== null ? hoverProgressInBars : progressInBars;
        
        // Determine color based on bar index
        if (index < Math.floor(displayProgressInBars)) {
          // This bar has been fully passed - use sender color
          ctx.fillStyle = senderColor;
          ctx.beginPath();
          ctx.arc(x + radius, y + radius, radius, Math.PI, 0, false);
          ctx.arc(x + radius, y + height - radius, radius, 0, Math.PI, false);
          ctx.closePath();
          ctx.fill();
        } else if (index === Math.floor(displayProgressInBars)) {
          // This is the current bar - draw split color
          const barProgress = displayProgressInBars - Math.floor(displayProgressInBars);
          const splitX = barProgress * BAR_WIDTH;
          
          // Draw gray part (right side)
          ctx.save();
          ctx.beginPath();
          ctx.rect(x + splitX, 0, BAR_WIDTH - splitX, CANVAS_HEIGHT);
          ctx.clip();
          ctx.fillStyle = '#48484A';
          ctx.beginPath();
          ctx.arc(x + radius, y + radius, radius, Math.PI, 0, false);
          ctx.arc(x + radius, y + height - radius, radius, 0, Math.PI, false);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          
          // Draw colored part (left side)
          ctx.save();
          ctx.beginPath();
          ctx.rect(x, 0, splitX, CANVAS_HEIGHT);
          ctx.clip();
          ctx.fillStyle = senderColor;
          ctx.beginPath();
          ctx.arc(x + radius, y + radius, radius, Math.PI, 0, false);
          ctx.arc(x + radius, y + height - radius, radius, 0, Math.PI, false);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          // Progress hasn't reached this bar yet - fully gray
          ctx.fillStyle = '#48484A';
          ctx.beginPath();
          ctx.arc(x + radius, y + radius, radius, Math.PI, 0, false);
          ctx.arc(x + radius, y + height - radius, radius, 0, Math.PI, false);
          ctx.closePath();
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [waveformData, duration, senderColor, hoverProgress, isDragging]);

  // Handle play/pause
  const handlePlayPause = () => {
    if (!audioRef.current) {
      return;
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      // Reset to start when paused (not when ended)
      if (audioRef.current.currentTime < audioRef.current.duration) {
        audioRef.current.currentTime = 0;
      }
    } else {
      // Stop any other currently playing audio before starting this one
      const previousAudio = currentlyPlayingAudio;
      if (previousAudio && previousAudio !== audioRef.current) {
        isInterruptingRef.current = true;
        previousAudio.pause();
        previousAudio.currentTime = 0;
        setTimeout(() => {
          isInterruptingRef.current = false;
        }, 50);
      }
      
      // If at the end, restart from beginning
      if (audioRef.current.currentTime >= audioRef.current.duration) {
        audioRef.current.currentTime = 0;
      }
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };

  // Handle speed change
  const handleSpeedChange = () => {
    if (!audioRef.current) return;
    
    const currentIndex = speedOptions.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    const newSpeed = speedOptions[nextIndex];
    
    setPlaybackRate(newSpeed);
    audioRef.current.playbackRate = newSpeed;
  };

  // Handle canvas mouse down to start dragging
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    setIsDragging(true);
    
    const rect = canvasRef.current.getBoundingClientRect();
    // Account for the 0.5 scale transform
    const x = (e.clientX - rect.left) / 0.5;
    const progress = Math.max(0, Math.min(1, x / CANVAS_WIDTH));
    setHoverProgress(progress);
  };

  // Handle canvas mouse move to show drag preview
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    // Account for the 0.5 scale transform
    const x = (e.clientX - rect.left) / 0.5;
    const progress = Math.max(0, Math.min(1, x / CANVAS_WIDTH));
    setHoverProgress(progress);
  };

  // Handle canvas mouse up to seek and stop dragging
  const handleCanvasMouseUp = () => {
    if (!audioRef.current || !isDragging) return;

    if (hoverProgress !== null) {
      audioRef.current.currentTime = hoverProgress * duration;
    }
    
    setIsDragging(false);
    setHoverProgress(null);
  };

  // Handle mouse leave to cancel dragging
  const handleCanvasMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setHoverProgress(null);
    }
  };

  // Format time to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate remaining time
  const remainingTime = duration - currentTime;

  return (
    <div 
      className="inline-flex items-center gap-6 bg-[#2C2C2E] rounded-lg border-2 border-[#3A3A3C] px-6 py-5 shadow-sm origin-left"
      style={{ transform: 'scale(0.5)', transformOrigin: 'left center' }}
    >
      {/* Play/Pause Button */}
      <button 
        className="flex-shrink-0 w-16 h-16 flex items-center justify-center hover:opacity-80 transition-opacity self-center"
        onClick={handlePlayPause}
        disabled={!isReady}
      >
        {isPlaying ? (
          <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="2" width="3" height="12" rx="1" fill={senderColor}/>
            <rect x="10" y="2" width="3" height="12" rx="1" fill={senderColor}/>
          </svg>
        ) : (
          <img src={playButtonIcon} alt="Play" width="32" height="32" />
        )}
      </button>

      {/* Waveform */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseLeave}
        className="flex-shrink-0 cursor-pointer"
      />

      {/* Speed Control */}
      <button 
        className="flex-shrink-0 bg-[#3A3A3C] rounded-lg hover:bg-[#48484A] transition-colors cursor-pointer w-[100px] text-center self-center flex items-center justify-center"
        onClick={handleSpeedChange}
        disabled={!isReady}
        style={{ height: '40px' }}
      >
        <span className="text-[28px] font-medium text-[#EBEBF5] leading-none">{playbackRate}x</span>
      </button>

      {/* Timestamp - Shows remaining time during playback/paused, total duration when stopped */}
      <div className="flex-shrink-0 self-center">
        <span className="text-[28px] font-normal text-[#8E8E93] tabular-nums leading-none">
          {currentTime > 0 ? formatTime(remainingTime) : formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

