"use client";

import { useRouteStore } from "../../stores/routeStore";

export function RouteInfoOverlay() {
    const {
        route,
        alternativeRoute,
        selectedRouteType,
        setSelectedRouteType,
        isBlocked
    } = useRouteStore();

    if (!route) return null;

    const displayRoute = selectedRouteType === 'primary' ? route : (alternativeRoute || route);
    const distanceKm = (displayRoute.coordinates.length * 0.15).toFixed(1);
    const etaMin = Math.round(Number(distanceKm) * 2.5 + (selectedRouteType === 'primary' && isBlocked ? 10 : 0));

    return (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-[420px] pointer-events-none">
            <div className="glass-panel p-6 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 pointer-events-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Route Strategy</span>
                        <h2 className="text-sm font-black text-white uppercase tracking-tight">
                            {selectedRouteType === 'primary' ? 'Direct Path' : 'Safe Alternative'}
                        </h2>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedRouteType === 'primary' && isBlocked
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                            : 'bg-green-500/10 text-green-500 border border-green-500/20'
                        }`}>
                        {selectedRouteType === 'primary' && isBlocked ? '⚠ Hazardous' : '✓ Optimal'}
                    </div>
                </div>

                {alternativeRoute && (
                    <div className="flex bg-white/5 p-1 rounded-2xl mb-6">
                        <button
                            onClick={() => setSelectedRouteType('primary')}
                            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedRouteType === 'primary' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            Primary {isBlocked && '⚠'}
                        </button>
                        <button
                            onClick={() => setSelectedRouteType('alternative')}
                            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedRouteType === 'alternative' ? 'bg-green-500/20 text-green-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-green-500/20' : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            Safer Route 🔥
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 p-4 rounded-2xl">
                        <span className="block text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Estimated Distance</span>
                        <span className="text-lg font-mono font-black text-white">{distanceKm} <span className="text-xs text-white/40">KM</span></span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl">
                        <span className="block text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Projected ETA</span>
                        <span className="text-lg font-mono font-black text-white">{etaMin} <span className="text-xs text-white/40">MIN</span></span>
                    </div>
                </div>

                {selectedRouteType === 'primary' && isBlocked && (
                    <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 mb-4 animate-pulse">
                        <p className="text-[11px] text-red-400 font-bold leading-relaxed text-center">
                            Hazard identified on this path. Switching to the alternative is highly advised.
                        </p>
                    </div>
                )}

                <button className="w-full py-4 rounded-2xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-95 transition-all">
                    Initiate Navigation Sequence
                </button>
            </div>
        </div>
    );
}
