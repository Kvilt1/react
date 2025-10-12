import { create } from 'zustand';
import { Conversation, MediaFilter, MediaItem, IndexData } from '@/types';
import { parseSnapchatDate } from '@/lib/utils';

interface SearchState {
  query: string;
  resultMessageIds: string[];
  currentIndex: number;
}

interface LightboxState {
  isOpen: boolean;
  mediaType: 'image' | 'video' | 'audio' | null;
  mediaSrc: string;
  showNavigation: boolean;
  currentIndex: number;
  items: MediaItem[];
}

interface ArchiveStore {
  // Index data (users, groups, account owner)
  indexData: IndexData | null;
  
  // Conversation state
  currentConversation: Conversation | null;
  conversations: Conversation[];
  accountUsername: string | null;
  
  // Current viewing date (for relative time calculations)
  currentDate: string | null;

  // Available archive dates
  availableDates: string[];

  // Search state
  searchState: SearchState;
  
  // Media state
  currentMediaFilter: MediaFilter;
  
  // Lightbox state
  lightboxState: LightboxState;
  
  // Audio playback state
  currentlyPlayingAudio: HTMLAudioElement | null;
  audioPlayCallbacks: Map<string, () => void>;
  
  // Actions
  setIndexData: (data: IndexData) => void;
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setAccountUsername: (username: string) => void;
  setCurrentDate: (date: string) => void;
  setAvailableDates: (dates: string[]) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (resultIds: string[], currentIndex: number) => void;
  setMediaFilter: (filter: MediaFilter) => void;
  openLightbox: (src: string, type: 'image' | 'video' | 'audio', items?: MediaItem[], index?: number) => void;
  closeLightbox: () => void;
  navigateLightbox: (direction: 'prev' | 'next') => void;
  setCurrentlyPlayingAudio: (audio: HTMLAudioElement | null) => void;
  registerAudioPlayCallback: (src: string, callback: () => void) => void;
  unregisterAudioPlayCallback: (src: string) => void;
  triggerAudioPlay: (src: string) => void;
}

const sortConversationsByLastMessage = (
  conversations: Conversation[]
) => {
  return [...conversations].sort((a, b) => {
    const lastA = a.stats.date_range.last_message
      ? parseSnapchatDate(a.stats.date_range.last_message).getTime()
      : 0;
    const lastB = b.stats.date_range.last_message
      ? parseSnapchatDate(b.stats.date_range.last_message).getTime()
      : 0;
    return lastB - lastA;
  });
};

const normalizeDates = (dates: string[]) => {
  const unique = Array.from(new Set(dates));
  return unique
    .map((value) => ({ value, time: new Date(value).getTime() }))
    .filter((entry) => !Number.isNaN(entry.time))
    .sort((a, b) => a.time - b.time)
    .map((entry) => entry.value);
};

export const useArchiveStore = create<ArchiveStore>((set) => ({
  indexData: null,
  currentConversation: null,
  conversations: [],
  accountUsername: null,
  currentDate: null,
  availableDates: [],
  searchState: {
    query: '',
    resultMessageIds: [],
    currentIndex: 0,
  },
  currentMediaFilter: 'all',
  lightboxState: {
    isOpen: false,
    mediaType: null,
    mediaSrc: '',
    showNavigation: false,
    currentIndex: -1,
    items: [],
  },
  currentlyPlayingAudio: null,
  audioPlayCallbacks: new Map(),
  
  setIndexData: (data) => set({ indexData: data }),
  setConversations: (conversations) =>
    set({ conversations: sortConversationsByLastMessage(conversations) }),
  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
  setAccountUsername: (username) => set({ accountUsername: username }),
  setCurrentDate: (date) => set({ currentDate: date }),
  setAvailableDates: (dates) => set({ availableDates: normalizeDates(dates) }),
  setCurrentlyPlayingAudio: (audio) => set({ currentlyPlayingAudio: audio }),
  setSearchQuery: (query) => set((state) => ({
    searchState: { ...state.searchState, query },
  })),
  setSearchResults: (resultIds, currentIndex) => set((state) => ({
    searchState: { ...state.searchState, resultMessageIds: resultIds, currentIndex },
  })),
  setMediaFilter: (filter) => set({ currentMediaFilter: filter }),
  openLightbox: (src, type, items = [], index = -1) => set({
    lightboxState: {
      isOpen: true,
      mediaType: type,
      mediaSrc: src,
      showNavigation: items.length > 0 && index >= 0,
      currentIndex: index,
      items,
    },
  }),
  closeLightbox: () => set({
    lightboxState: {
      isOpen: false,
      mediaType: null,
      mediaSrc: '',
      showNavigation: false,
      currentIndex: -1,
      items: [],
    },
  }),
  navigateLightbox: (direction) => set((state) => {
    const { currentIndex, items } = state.lightboxState;
    if (items.length === 0) return state;
    
    let newIndex = currentIndex;
    if (direction === 'prev') {
      newIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
    }
    
    const item = items[newIndex];
    return {
      lightboxState: {
        ...state.lightboxState,
        currentIndex: newIndex,
        mediaSrc: item.path,
        mediaType: item.type === 'VIDEO' ? 'video' : item.type === 'NOTE' ? 'audio' : 'image',
      },
    };
  }),
  registerAudioPlayCallback: (src, callback) => set((state) => {
    const newCallbacks = new Map(state.audioPlayCallbacks);
    newCallbacks.set(src, callback);
    return { audioPlayCallbacks: newCallbacks };
  }),
  unregisterAudioPlayCallback: (src) => set((state) => {
    const newCallbacks = new Map(state.audioPlayCallbacks);
    newCallbacks.delete(src);
    return { audioPlayCallbacks: newCallbacks };
  }),
  triggerAudioPlay: (src) => set((state) => {
    const callback = state.audioPlayCallbacks.get(src);
    if (callback) {
      callback();
    }
    return state;
  }),
}));
