import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(datetimeStr: string): string {
  try {
    const dt = new Date(datetimeStr.replace(' UTC', 'Z'));
    return dt
      .toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .replace(':', '.');
  } catch {
    return datetimeStr;
  }
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function getFileExtension(filepath: string): string {
  return filepath.split('.').pop()?.toLowerCase() || '';
}

export function getMediaTypeIcon(mediaType: string): string {
  const icons: Record<string, string> = {
    TEXT: '💬',
    IMAGE: '📷',
    VIDEO: '🎥',
    NOTE: '🎤',
    MEDIA: '📎',
    STICKER: '😀',
    STATUSERASEDMESSAGE: '🚫',
    STATUSERASEDSNAPMESSAGE: '👻',
    STATUSPARTICIPANTREMOVED: '👤',
    STATUS: 'ℹ️',
    SHARE: '🔗',
    SHARESAVEDSTORY: '📖',
    MAPREACTION: '📍',
    STATUSCONVERSATIONCAPTURESCREENSHOT: '📸',
    NONPARTICIPANTBOTRESPONSE: '🤖',
    STATUSSAVETOCAMERAROLL: '💾',
    STATUSCALLMISSEDAUDIO: '📞',
  };
  return icons[mediaType] || '❓';
}

export function isStatusMessage(mediaType: string): boolean {
  return (
    mediaType &&
    (mediaType.startsWith('STATUS') || mediaType === 'NONPARTICIPANTBOTRESPONSE')
  );
}

export function getAvatarColor(name: string): string {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FECA57',
    '#8B78E6',
    '#FF9FF3',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}
