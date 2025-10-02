import { create } from 'zustand';
import { Conversation, MediaFilter, MediaItem, IndexData } from '@/types';

interface SearchState {
  query: string;
  results: HTMLElement[];
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
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: HTMLElement[], currentIndex: number) => void;
  setMediaFilter: (filter: MediaFilter) => void;
  openLightbox: (src: string, type: 'image' | 'video' | 'audio', items?: MediaItem[], index?: number) => void;
  closeLightbox: () => void;
  navigateLightbox: (direction: 'prev' | 'next') => void;
  setCurrentlyPlayingAudio: (audio: HTMLAudioElement | null) => void;
  registerAudioPlayCallback: (src: string, callback: () => void) => void;
  unregisterAudioPlayCallback: (src: string) => void;
  triggerAudioPlay: (src: string) => void;
}

export const useArchiveStore = create<ArchiveStore>((set) => ({
  indexData: null,
  currentConversation: null,
  conversations: [],
  accountUsername: null,
  currentDate: null,
  searchState: {
    query: '',
    results: [],
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
  setConversations: (conversations) => set({ conversations }),
  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
  setAccountUsername: (username) => set({ accountUsername: username }),
  setCurrentDate: (date) => set({ currentDate: date }),
  setCurrentlyPlayingAudio: (audio) => set({ currentlyPlayingAudio: audio }),
  setSearchQuery: (query) => set((state) => ({
    searchState: { ...state.searchState, query },
  })),
  setSearchResults: (results, currentIndex) => set((state) => ({
    searchState: { ...state.searchState, results, currentIndex },
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
