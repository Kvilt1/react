import { create } from 'zustand';
import { Conversation, MediaFilter, MediaItem } from '@/types';

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
  // Conversation state
  currentConversation: Conversation | null;
  conversations: Conversation[];
  accountUsername: string | null;
  
  // Search state
  searchState: SearchState;
  
  // Media state
  currentMediaFilter: MediaFilter;
  
  // Lightbox state
  lightboxState: LightboxState;
  
  // Orphaned media
  showOrphanedModal: boolean;
  orphanedMediaFilter: string;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setAccountUsername: (username: string) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: HTMLElement[], currentIndex: number) => void;
  setMediaFilter: (filter: MediaFilter) => void;
  openLightbox: (src: string, type: 'image' | 'video' | 'audio', items?: MediaItem[], index?: number) => void;
  closeLightbox: () => void;
  navigateLightbox: (direction: 'prev' | 'next') => void;
  setShowOrphanedModal: (show: boolean) => void;
  setOrphanedMediaFilter: (filter: string) => void;
}

export const useArchiveStore = create<ArchiveStore>((set) => ({
  currentConversation: null,
  conversations: [],
  accountUsername: null,
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
  showOrphanedModal: false,
  orphanedMediaFilter: 'all',
  
  setConversations: (conversations) => set({ conversations }),
  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
  setAccountUsername: (username) => set({ accountUsername: username }),
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
  setShowOrphanedModal: (show) => set({ showOrphanedModal: show }),
  setOrphanedMediaFilter: (filter) => set({ orphanedMediaFilter: filter }),
}));
