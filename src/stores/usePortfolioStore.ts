import { create } from 'zustand';
import {
  type InteractiveNodeId,
  type Locale,
  type StationId,
  STATIONS,
  getStationById,
  getStationFromHash,
} from '@/data/portfolioData';

export type ThemeMode = 'dark' | 'light';

export interface PortfolioState {
  currentSection: StationId;
  targetSection: StationId;
  isTransitioning: boolean;
  transitionRequestId: number;
  hoveredNodeId: InteractiveNodeId | null;
  selectedNodeId: InteractiveNodeId | null;
  locale: Locale;
  theme: ThemeMode;
  isAssetReady: boolean;
  dracoInitMs: number | null;
  raycastTimeMs: number;
  navigateTo: (section: StationId, options?: { syncHistory?: boolean }) => void;
  stepStation: (direction: -1 | 1) => void;
  completeTransition: (section: StationId, requestId: number) => void;
  setHoveredNode: (nodeId: InteractiveNodeId | null) => void;
  selectNode: (nodeId: InteractiveNodeId | null) => void;
  closeModal: () => void;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setAssetReady: (ready: boolean) => void;
  setDracoInitMs: (ms: number) => void;
  setRaycastTimeMs: (ms: number) => void;
  syncFromHash: (hash: string) => void;
}

const initialSection: StationId =
  typeof window !== 'undefined'
    ? (getStationFromHash(window.location.hash) ?? 'sobre-mi')
    : 'sobre-mi';

function syncDocumentTheme(theme: ThemeMode): void {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
  }
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  currentSection: initialSection,
  targetSection: initialSection,
  isTransitioning: false,
  transitionRequestId: 0,
  hoveredNodeId: null,
  selectedNodeId: null,
  locale: 'es',
  theme: 'dark',
  isAssetReady: false,
  dracoInitMs: null,
  raycastTimeMs: 0,

  navigateTo: (section, options) => {
    const { targetSection, isTransitioning, transitionRequestId } = get();
    if (section === targetSection && !isTransitioning) {
      return;
    }

    const nextRequestId = transitionRequestId + 1;

    if (options?.syncHistory !== false && typeof window !== 'undefined') {
      const targetHash = getStationById(section).hash;
      if (window.location.hash !== targetHash) {
        window.history.pushState({ section }, '', targetHash);
      }
    }

    set({
      targetSection: section,
      isTransitioning: true,
      transitionRequestId: nextRequestId,
      selectedNodeId: null,
    });
  },

  stepStation: (direction) => {
    const { targetSection, navigateTo } = get();
    const currentIndex = STATIONS.findIndex((s) => s.id === targetSection);
    const nextIndex = (currentIndex + direction + STATIONS.length) % STATIONS.length;
    navigateTo(STATIONS[nextIndex].id);
  },

  completeTransition: (section, requestId) => {
    const { transitionRequestId } = get();
    if (requestId !== transitionRequestId) {
      return;
    }
    set({
      currentSection: section,
      targetSection: section,
      isTransitioning: false,
    });
  },

  setHoveredNode: (nodeId) => {
    if (get().hoveredNodeId === nodeId) return;
    set({ hoveredNodeId: nodeId });
  },

  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  closeModal: () => {
    set({ selectedNodeId: null });
  },

  setLocale: (locale) => set({ locale }),

  toggleLocale: () => {
    set((state) => ({ locale: state.locale === 'es' ? 'en' : 'es' }));
  },

  setTheme: (theme) => {
    syncDocumentTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    syncDocumentTheme(next);
    set({ theme: next });
  },

  setAssetReady: (ready) => set({ isAssetReady: ready }),

  setDracoInitMs: (ms) => set({ dracoInitMs: ms }),

  setRaycastTimeMs: (ms) => set({ raycastTimeMs: ms }),

  syncFromHash: (hash) => {
    const section = getStationFromHash(hash) ?? 'sobre-mi';
    get().navigateTo(section, { syncHistory: false });
  },
}));
