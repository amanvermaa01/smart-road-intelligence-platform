"use client";

import { useState, useEffect } from "react";
import { useDashboardFilters } from "../../stores/filters.store";
import { useMapStore } from "../../stores/mapStore";
import { fetchHeatmapData } from "../../services/analytics";

interface Filters {
    severityMin?: number;
    eventType?: string;
    hoursAgo?: number;
}

interface Props {
    onChange: (filters: Filters) => void;
}

export function FiltersPanel({ onChange }: Props) {
    // We'll use the global store to sync filter state across components
    // onChange prop is kept for backward compatibility if needed, but primary sync is via store
    const {
        severity, setSeverity,
        eventType, setEventType,
        hoursAgo, setHoursAgo
    } = useDashboardFilters();

    const { showHeatmap, setShowHeatmap, heatmapData, setHeatmapData } = useMapStore();

    const fetchHeatmap = async () => {
        try {
            const res = await fetchHeatmapData({
                from: new Date(Date.now() - (hoursAgo || 24) * 60 * 60 * 1000).toISOString(),
                to: new Date().toISOString(),
                bbox: "26.7,80.8,27.0,81.1", // Default view for Lucknow area or get from map
                resolution: "5m",
            });
            setHeatmapData(res.buckets);
        } catch (err) {
            console.error("Failed to fetch heatmap:", err);
        }
    };

    // Sync local changes to parent via onChange if provided
    useEffect(() => {
        onChange({
            severityMin: severity ? Number(severity) : undefined,
            eventType,
            hoursAgo,
        });
    }, [severity, eventType, hoursAgo, onChange]);

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.6)]"></div>
                <h3 className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Filter Parameters</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Threshold</label>
                    <select
                        value={severity || ""}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
                        onChange={(e) => setSeverity(e.target.value)}
                    >
                        <option value="" className="bg-slate-900">All Levels</option>
                        <option value="1" className="bg-slate-900">L1 - Notice</option>
                        <option value="2" className="bg-slate-900">L2 - Warning</option>
                        <option value="3" className="bg-slate-900">L3 - Alert</option>
                        <option value="4" className="bg-slate-900">L4 - Critical</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Category</label>
                    <select
                        value={eventType || ""}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
                        onChange={(e) => setEventType(e.target.value || undefined)}
                    >
                        <option value="" className="bg-slate-900">All Categories</option>
                        <option value="accident" className="bg-slate-900">Tactical (Accident)</option>
                        <option value="pothole" className="bg-slate-900">Surface (Pothole)</option>
                        <option value="flooding" className="bg-slate-900">Environ. (Flooding)</option>
                        <option value="other" className="bg-slate-900">Other</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Time Window</label>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    {[
                        { label: '1H', value: 1 },
                        { label: '24H', value: 24 },
                        { label: 'ALL', value: undefined }
                    ].map((opt) => (
                        <button
                            key={opt.label}
                            onClick={() => setHoursAgo(opt.value)}
                            className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${hoursAgo === opt.value
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Visual Layers</label>
                <button
                    onClick={() => {
                        const next = !showHeatmap;
                        setShowHeatmap(next);
                        if (next && heatmapData.length === 0) {
                            fetchHeatmap();
                        }
                    }}
                    className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between transition-all ${showHeatmap
                        ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-sm">🔥</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Traffic Heatmap</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${showHeatmap ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]' : 'bg-white/20'}`}></div>
                </button>
            </div>

            <div className="pt-2">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Active Node</span>
                    <span className="text-[9px] font-mono text-blue-400/60 uppercase">Auto-Sync</span>
                </div>
            </div>
        </div>
    );
}
