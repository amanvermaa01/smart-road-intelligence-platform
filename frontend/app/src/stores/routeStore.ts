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

  setSource: (c: LatLng) => void;
  setDestination: (c: LatLng) => void;
  setRoute: (r: LineString, alt?: LineString) => void;
  setSelectedRouteType: (t: 'primary' | 'alternative') => void;
  setIsBlocked: (b: boolean) => void;
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

  setSource: (c) => set({ source: c }),
  setDestination: (c) => set({ destination: c }),
  setRoute: (r, alt) => set({ 
    route: r, 
    alternativeRoute: alt,
    selectedRouteType: 'primary' // Default to primary initially
  }),
  setSelectedRouteType: (t) => set({ selectedRouteType: t }),
  setIsBlocked: (b) => set({ isBlocked: b }),
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
    }),
}));
