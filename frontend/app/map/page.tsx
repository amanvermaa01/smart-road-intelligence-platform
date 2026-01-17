"use client";

import dynamic from "next/dynamic";

import { SideDashboard } from "@/app/src/components/dashboard/SideDashboard";

const MapView = dynamic(() => import("@/app/src/components/map/MapView"), {
    ssr: false,
    loading: () => <div className="h-screen w-screen bg-gray-100 animate-pulse" />
});

export default function MapPage() {
    return (
        <main className="h-screen w-screen relative flex overflow-hidden bg-gray-50">
            <div className="flex-1 relative">
                <MapView />
            </div>
            <SideDashboard />
        </main>
    );
}
