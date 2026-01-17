import { create } from "zustand";

interface DashboardFilterState {
  severity: string | undefined;
  eventType: string | undefined;
  hoursAgo: number | undefined;
  setSeverity: (v: string) => void;
  setEventType: (v: string | undefined) => void;
  setHoursAgo: (v: number | undefined) => void;
}

export const useDashboardFilters = create<DashboardFilterState>((set) => ({
  severity: undefined,
  eventType: undefined,
  hoursAgo: undefined,
  setSeverity: (severity) => set({ severity }),
  setEventType: (eventType) => set({ eventType }),
  setHoursAgo: (hoursAgo) => set({ hoursAgo }),
}));