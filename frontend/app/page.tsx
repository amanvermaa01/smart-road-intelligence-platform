"use client";

import dynamic from "next/dynamic";

import { HazardFeedSidebar } from "@/app/src/components/dashboard/HazardFeedSidebar";

const MapView = dynamic(() => import("@/app/src/components/map/MapView"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <main className="h-screen w-screen relative flex overflow-hidden bg-[#020617]">
      <HazardFeedSidebar />
      <div className="flex-1 relative">
        <MapView />
      </div>
    </main>
  );
}
