"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useMapStore } from "@/app/src/stores/mapStore";
import { fetchHeatmapData } from "@/app/src/services/analytics";

export default function TimeSlider() {
    const {
        showHeatmap,
        timeRange, setTimeRange,
        resolution, setResolution,
        isPlaying, setIsPlaying,
        setHeatmapData,
        bbox
    } = useMapStore();

    const [sliderValue, setSliderValue] = useState(100); // 0 to 100 percentage of the last 24h
    const abortControllerRef = useRef<AbortController | null>(null);

    const updateHeatmap = useCallback(async () => {
        if (!showHeatmap) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            // Calculate window based on slider
            const now = Date.now();
            const totalRange = 24 * 60 * 60 * 1000; // 24 hours
            const windowSize = 1 * 60 * 60 * 1000; // 1 hour window for the slider tip

            const offset = (1 - sliderValue / 100) * totalRange;
            const to = new Date(now - offset).toISOString();
            const from = new Date(now - offset - windowSize).toISOString();

            // Auto-resolution logic
            let res: '5m' | '15m' | '1h' = '1h';
            if (windowSize < 60 * 60 * 1000) res = '5m';
            else if (windowSize < 6 * 60 * 60 * 1000) res = '15m';

            setResolution(res);
            setTimeRange({ from, to });

            const data = await fetchHeatmapData({
                from,
                to,
                bbox: bbox || "26.7,80.8,27.0,81.1",
                resolution: res
            }, abortControllerRef.current.signal);

            setHeatmapData(data.buckets);
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error("Failed to fetch heatmap data:", err);
            }
        }
    }, [sliderValue, showHeatmap, setHeatmapData, setResolution, setTimeRange, bbox]);

    useEffect(() => {
        const timer = setTimeout(() => {
            updateHeatmap();
        }, 300); // Debounce
        return () => clearTimeout(timer);
    }, [sliderValue, updateHeatmap]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setSliderValue((prev) => (prev >= 100 ? 0 : prev + 1));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    if (!showHeatmap) return null;

    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] glass-panel p-6 rounded-3xl border-white/10 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg ${isPlaying
                                ? 'bg-blue-500 text-white shadow-blue-500/30'
                                : 'bg-white/5 text-white/70 hover:bg-white/10'
                                }`}
                        >
                            <span className="text-xl">{isPlaying ? "⏸" : "▶"}</span>
                        </button>
                        <div>
                            <span className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Temporal Range</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-blue-400 font-bold tracking-wider">
                                    {new Date(timeRange.from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-white/20">→</span>
                                <span className="text-[11px] font-mono text-blue-400 font-bold tracking-wider">
                                    {new Date(timeRange.to).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Resolution</span>
                        <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{resolution} Window</span>
                        </div>
                    </div>
                </div>

                <div className="relative group px-1">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderValue}
                        onChange={(e) => setSliderValue(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-all hover:bg-white/15"
                    />
                    <div className="flex justify-between mt-2 px-1">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">-24H</span>
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">-12H</span>
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">NOW</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
