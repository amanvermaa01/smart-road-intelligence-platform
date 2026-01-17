"use client";

import { useState } from "react";
import maplibregl from "maplibre-gl";
import { createEvent } from "@/app/src/services/eventApi";

export default function ReportEventModal({ location, onClose }: { location: maplibregl.LngLat | null, onClose: () => void }) {
    const [type, setType] = useState("accident");
    const [severity, setSeverity] = useState(3);
    const [expiry, setExpiry] = useState(15);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!location) return null;

    const submit = async () => {
        setLoading(true);
        setError(null);
        try {
            await createEvent({
                lat: location.lat,
                lng: location.lng,
                type,
                severity,
                description: description || undefined,
                expiresInSeconds: expiry * 60,
            });
            onClose();
        } catch (err) {
            console.error("Failed to report event", err);
            setError("Tactical link failed. Retry broadcast.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute top-8 right-8 glass-panel p-8 rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.6)] border-white/10 w-[340px] z-50 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.6)]"></div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Log Incident</h3>
            </div>

            <div className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-xl border border-red-500/20 uppercase tracking-widest">
                        🚨 {error}
                    </div>
                )}

                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Category</label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'accident', label: 'Accident', icon: '🚨' },
                            { id: 'pothole', label: 'Pothole', icon: '🕳' },
                            { id: 'flooding', label: 'Flooding', icon: '🌊' },
                            { id: 'other', label: 'Other', icon: '❓' }
                        ].map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setType(cat.id)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 ${type === cat.id
                                        ? 'bg-red-500/20 border-red-500/40 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                        : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10'
                                    }`}
                            >
                                <span className="text-xl">{cat.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Severity (L1 - L5)</label>
                    <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        className="w-full accent-red-500 bg-white/5 h-1.5 rounded-full appearance-none cursor-pointer"
                        value={severity}
                        onChange={(e) => setSeverity(+e.target.value)}
                    />
                    <div className="flex justify-between px-1">
                        {[1, 2, 3, 4, 5].map(v => (
                            <span key={v} className={`text-[9px] font-black ${severity >= v ? 'text-red-500' : 'text-white/10'}`}>{v}</span>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Observations</label>
                    <textarea
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-white outline-none focus:border-white/20 transition-colors placeholder:text-white/10"
                        placeholder="Encrypted data stream..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={submit}
                        disabled={loading}
                        className={`flex-1 bg-red-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:bg-red-500 transition-all ${loading ? 'opacity-50 cursor-not-allowed text-white/40' : ''}`}
                    >
                        {loading ? 'Transmitting...' : 'Initiate Broadcast'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-4 glass-card rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors border-white/5"
                    >
                        Abort
                    </button>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-mono text-white/20 uppercase">Location Hash</span>
                <span className="text-[9px] font-mono text-white/40">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
            </div>
        </div>
    );
}
