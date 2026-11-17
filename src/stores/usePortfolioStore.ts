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
export type QualityPreset = 'performance' | 'balanced' | 'ultra';

export interface RenderTelemetryStats {
  fps: number;
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
}

export interface PortfolioState {
  currentSection: StationId;
  targetSection: StationId;
  isTransitioning: boolean;
  transitionRequestId: number;
  hoveredNodeId: InteractiveNodeId | null;
  selectedNodeId: InteractiveNodeId | null;
  focusedNodeId: InteractiveNodeId | null;
  openComposerOnModal: boolean;
  locale: Locale;
  theme: ThemeMode;
  qualityPreset: QualityPreset;
  autoQuality: boolean;
  renderStats: RenderTelemetryStats;
  isAssetReady: boolean;
  dracoInitMs: number | null;
  raycastTimeMs: number;
  navigateTo: (section: StationId, options?: { syncHistory?: boolean }) => void;
  stepStation: (direction: -1 | 1) => void;
  completeTransition: (section: StationId, requestId: number) => void;
  setHoveredNode: (nodeId: InteractiveNodeId | null) => void;
  selectNode: (nodeId: InteractiveNodeId | null, options?: { openComposer?: boolean }) => void;
  closeModal: () => void;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setQualityPreset: (preset: QualityPreset) => void;
  setAutoQuality: (enabled: boolean) => void;
  stepDownQuality: () => void;
  setRenderStats: (stats: RenderTelemetryStats) => void;
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
  focusedNodeId: null,
  openComposerOnModal: false,
  locale: 'es',
  theme: 'dark',
  qualityPreset: 'balanced',
  autoQuality: true,
  renderStats: {
    fps: 60,
    calls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
  },
  isAssetReady: false,
  dracoInitMs: null,
  raycastTimeMs: 0,

  navigateTo: (section, options) => {
    const { targetSection, isTransitioning, transitionRequestId, focusedNodeId } = get();
    if (section === targetSection && !isTransitioning && !focusedNodeId) {
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
      focusedNodeId: null,
      openComposerOnModal: false,
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

  selectNode: (nodeId, options) => {
    set({
      selectedNodeId: nodeId,
      focusedNodeId: nodeId,
      openComposerOnModal: Boolean(options?.openComposer),
    });
  },

  closeModal: () => {
    set({
      selectedNodeId: null,
      focusedNodeId: null,
      openComposerOnModal: false,
    });
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

  setQualityPreset: (qualityPreset) => {
    set({ qualityPreset, autoQuality: false });
  },

  setAutoQuality: (autoQuality) => {
    set({ autoQuality });
  },

  stepDownQuality: () => {
    const { qualityPreset, autoQuality } = get();
    if (!autoQuality) return;
    if (qualityPreset === 'ultra') {
      set({ qualityPreset: 'balanced' });
    } else if (qualityPreset === 'balanced') {
      set({ qualityPreset: 'performance' });
    }
  },

  setRenderStats: (renderStats) => {
    set({ renderStats });
  },

  setAssetReady: (ready) => set({ isAssetReady: ready }),

  setDracoInitMs: (ms) => set({ dracoInitMs: ms }),

  setRaycastTimeMs: (ms) => set({ raycastTimeMs: ms }),

  syncFromHash: (hash) => {
    const section = getStationFromHash(hash) ?? 'sobre-mi';
    get().navigateTo(section, { syncHistory: false });
  },
}));
