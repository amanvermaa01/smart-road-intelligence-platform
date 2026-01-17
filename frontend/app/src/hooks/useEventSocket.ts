"use client";

import { useEffect } from "react";
import { getEventSocket } from "@/app/src/lib/socket";
import { useEventStore } from "@/app/src/stores/eventStore";
import { RoadEvent } from "@/app/src/types/event";

export const useEventSocket = (bbox: any) => {
  const upsertEvent = useEventStore((s) => s.upsertEvent);
  const removeEvent = useEventStore((s) => s.removeEvent);

  useEffect(() => {
    if (!bbox) return;

    const socket = getEventSocket();

    socket.emit("subscribe", { bbox });

    socket.on("event:new", (event: any) => {
      // Handle deletion broadcasts
      if (event._deleted) {
        console.log(`[WS] Event deleted, removing marker: ${event.id}`);
        removeEvent(event.id);
        return;
      }

      if (event.type === 'expired') {
        console.log(`[WS] Event expired, removing marker: ${event.id}`);
        removeEvent(event.id);
        return;
      }

      if (event._publishedAt) {
        const latency = Date.now() - event._publishedAt;
        console.log(`[WS] Fan-out latency: ${latency}ms`);
      }
      upsertEvent(event as RoadEvent);
    });

    return () => {
      socket.off("event:new");
    };
  }, [bbox, upsertEvent, removeEvent]);
};
