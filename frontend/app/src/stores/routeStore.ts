import { create } from "zustand";
import type { LineString } from "geojson";

type LatLng = [number, number];

type RouteState = {
  source?: LatLng;
  destination?: LatLng;
  route?: LineString;
  alternativeRoute?: LineString;
  selectedRouteType: 'primary' | 'alternative';
  selectedRouteId?: string;
  isBlocked: boolean;
  isNavigating: boolean;
  hazardSummary?: { totalHazards: number };

  setSource: (c: LatLng) => void;
  setDestination: (c: LatLng) => void;
  setRoute: (r: LineString, alt?: LineString, summary?: { totalHazards: number }) => void;
  setSelectedRouteType: (t: 'primary' | 'alternative') => void;
  setIsBlocked: (b: boolean) => void;
  setIsNavigating: (n: boolean) => void;
  setSelectedRouteId: (id: string) => void;
  reset: () => void;
};

export const useRouteStore = create<RouteState>((set) => ({
  source: undefined,
  destination: undefined,
  route: undefined,
  alternativeRoute: undefined,
  selectedRouteType: 'primary',
  selectedRouteId: undefined,
  isBlocked: false,
  isNavigating: false,
  hazardSummary: undefined,

  setSource: (c) => set({ source: c }),
  setDestination: (c) => set({ destination: c }),
  setRoute: (r, alt, summary) => set({ 
    route: r, 
    alternativeRoute: alt,
    hazardSummary: summary,
    selectedRouteType: 'primary' // Default to primary initially
  }),
  setSelectedRouteType: (t) => set({ selectedRouteType: t }),
  setIsBlocked: (b) => set({ isBlocked: b }),
  setIsNavigating: (n) => set({ isNavigating: n }),
  setSelectedRouteId: (id) => set({ selectedRouteId: id }),
  reset: () =>
    set({
      source: undefined,
      destination: undefined,
      route: undefined,
      alternativeRoute: undefined,
      selectedRouteType: 'primary',
      selectedRouteId: undefined,
      isBlocked: false,
      isNavigating: false,
      hazardSummary: undefined,
    }),
}));
