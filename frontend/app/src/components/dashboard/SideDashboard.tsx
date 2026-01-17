"use client";

import { HazardSummaryCard } from "./HazardSummaryCard";
import { FiltersPanel } from "./FiltersPanel";
import { EventFeedList } from "./EventFeedList";
import { LiveAlertsToast } from "./LiveAlertsToast";
import { useRouteStore } from "../../stores/routeStore";

export function SideDashboard() {
    const { selectedRouteId } = useRouteStore();

    return (
        <aside className="w-[400px] glass-panel flex flex-col shadow-2xl z-20 border-l border-white/5">
            <div className="p-8 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.5)]"></div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter leading-tight">CMD CENTER</h2>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] opacity-80">Network Intelligence v2.4</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-6">
                <HazardSummaryCard routeId={selectedRouteId} />

                <div className="px-4">
                    <div className="glass-card rounded-2xl p-1">
                        <FiltersPanel onChange={(f) => console.log("Filters changed:", f)} />
                    </div>
                </div>

                <div className="px-4 pb-8 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Live Stream</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Live</span>
                        </div>
                    </div>
                    <EventFeedList />
                </div>
            </div>

            <LiveAlertsToast />
        </aside>
    );
}