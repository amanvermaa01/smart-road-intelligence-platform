import { create } from "zustand";
import { RoadEvent } from "@/app/src/types/event";

interface EventState {
  events: Map<string, RoadEvent>;
  upsertEvent: (event: RoadEvent) => void;
  removeEvent: (id: string) => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: new Map(),

  upsertEvent: (event) =>
    set((state) => {
      const copy = new Map(state.events);
      copy.set(event.id, event);
      return { events: copy };
    }),

  removeEvent: (id) =>
    set((state) => {
      const copy = new Map(state.events);
      copy.delete(id);
      return { events: copy };
    }),
}));
