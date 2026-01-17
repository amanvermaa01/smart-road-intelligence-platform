"use client";

import { useQuery } from "@apollo/client";
import { EVENT_FEED } from "../../lib/apollo/queries";
import { useDashboardFilters } from "../../stores/filters.store";
import { useMapStore } from "../../stores/mapStore";
import { FiltersPanel } from "./FiltersPanel";
import { toast } from "sonner";

export function HazardFeedSidebar() {
    const { severity, eventType, hoursAgo } = useDashboardFilters();
    const { setFlyToCoord } = useMapStore();

    const { data, loading } = useQuery(EVENT_FEED, {
        variables: {
            severityMin: severity ? Number(severity) : undefined,
            type: eventType,
            hoursAgo
        },
        pollInterval: 10000,
    });

    const hazards = data?.eventFeed || [];

    return (
        <div className="flex flex-col h-full glass-panel border-r border-white/5 w-80">
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Signal Feed</h2>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Live</span>
                    </div>
                </div>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Real-time incident stream</p>
            </div>

            <div className="border-b border-white/5 bg-white/[0.02]">
                <FiltersPanel onChange={() => { }} />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {loading && hazards.length === 0 && (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                )}

                {hazards.length === 0 && !loading && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-6">
                        <span className="text-3xl mb-4">📡</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Monitoring Frequencies...</p>
                    </div>
                )}

                {hazards.map((h: any) => (
                    <div
                        key={h.id}
                        className="group relative p-4 rounded-2xl glass-card border border-white/5 hover:border-blue-500/30 transition-all duration-500"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{h.type}</span>
                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">ID: {h.id.slice(0, 8)}</span>
                            </div>
                            <div className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-tighter shadow-sm ${h.severity >= 4
                                ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-red-500/20'
                                : h.severity >= 3
                                    ? 'bg-orange-500/10 border-orange-500/20 text-orange-500 shadow-orange-500/20'
                                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-blue-500/20'
                                }`}>
                                SEV {h.severity}
                            </div>
                        </div>

                        <p className="text-[11px] text-white/70 line-clamp-2 mb-4 leading-relaxed font-medium">
                            {h.description || "No description provided from sensor data."}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">
                                {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <button
                                onClick={() => setFlyToCoord([h.lng, h.lat])}
                                className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.1em] transition-all group-hover:scale-105 active:scale-95"
                            >
                                Focus ⊕
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
