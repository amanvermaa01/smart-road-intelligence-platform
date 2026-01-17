import { create } from "zustand";

interface MapState {
  selectedRouteId: string | null;
  setSelectedRouteId: (id: string | null) => void;
  flyToCoord: [number, number] | null;
  setFlyToCoord: (coord: [number, number] | null) => void;
  showHeatmap: boolean;
  setShowHeatmap: (v: boolean) => void;
  heatmapData: any[];
  setHeatmapData: (data: any[]) => void;
  timeRange: { from: string; to: string };
  setTimeRange: (range: { from: string; to: string }) => void;
  resolution: '5m' | '15m' | '1h';
  setResolution: (res: '5m' | '15m' | '1h') => void;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  bbox: string | null;
  setBbox: (v: string | null) => void;
}

const defaultFrom = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const defaultTo = new Date().toISOString();

export const useMapStore = create<MapState>((set) => ({
  selectedRouteId: null,
  setSelectedRouteId: (id) => set({ selectedRouteId: id }),
  flyToCoord: null,
  setFlyToCoord: (coord) => set({ flyToCoord: coord }),
  showHeatmap: false,
  setShowHeatmap: (showHeatmap) => set({ showHeatmap }),
  heatmapData: [],
  setHeatmapData: (heatmapData) => set({ heatmapData }),
  timeRange: { from: defaultFrom, to: defaultTo },
  setTimeRange: (timeRange) => set({ timeRange }),
  resolution: '1h',
  setResolution: (resolution) => set({ resolution }),
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  bbox: null,
  setBbox: (bbox) => set({ bbox }),
}));
