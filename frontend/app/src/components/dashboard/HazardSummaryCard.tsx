"use client";

import { useQuery } from "@apollo/client";
import { ROUTE_HAZARD_SUMMARY } from "@/app/src/lib/apollo/queries";

export function HazardSummaryCard({ routeId }: { routeId?: string }) {
  const { data, loading } = useQuery(ROUTE_HAZARD_SUMMARY, {
    variables: { routeId },
    skip: !routeId
  });

  if (!routeId) {
    return (
      <div className="glass-card m-4 p-6 rounded-2xl border-white/5 text-center">
        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
          Operational Data Offline<br />
          <span className="text-blue-400/50">Select route to initialize sync</span>
        </p>
      </div>
    );
  }

  if (loading) return (
    <div className="p-8 text-center animate-pulse">
      <div className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em]">Establishing Link...</div>
    </div>
  );

  const byType = data?.routeHazardSummary?.byType ? [...data.routeHazardSummary.byType].sort((a, b) => b.count - a.count) : [];
  const bySeverity = data?.routeHazardSummary?.bySeverity || [];

  return (
    <div className="glass-card m-4 rounded-3xl overflow-hidden border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.6)]">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-orange-500 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.6)]"></div>
          <div>
            <h3 className="font-black text-white text-[10px] uppercase tracking-[0.2em]">Network Hazards</h3>
            <div className="text-[9px] text-white/40 font-mono">
              {/* Simple estimation: 5 min per active hazard for demo logic */}
              {data?.routeHazardSummary?.totalHazards > 0 ? (
                <span className="text-red-400">+{data.routeHazardSummary.totalHazards * 5} MIN DELAY EST</span>
              ) : (
                <span className="text-emerald-400">OPTIMAL FLOW</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Active Link</span>
          <span className="bg-orange-500/20 text-orange-400 text-[10px] px-3 py-1 rounded-full font-black border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            {data?.routeHazardSummary?.totalHazards || 0}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Severity Metrics */}
        <div className="space-y-3">
          <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Threat Assessment</h4>
          <div className="grid grid-cols-2 gap-3">
            {bySeverity.map((s: any) => (
              <div key={s.type} className="bg-white/5 p-3 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-1">{s.type}</div>
                <div className="text-lg font-black text-white">{s.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hazard Types List */}
        <div className="space-y-4">
          <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Detected Anomalies</h4>
          {byType.length === 0 ? (
            <div className="text-[10px] text-white/30 italic uppercase tracking-widest text-center py-6 border border-dashed border-white/5 rounded-2xl">
              Sector Clear • No Anomalies Detected
            </div>
          ) : (
            byType.map((h: any) => (
              <div key={h.type} className="space-y-2 group">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white/60 capitalize group-hover:text-white transition-colors tracking-[0.1em]">
                    {h.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-black text-blue-400">{h.count}</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.3)] transition-all duration-1000"
                    style={{ width: `${Math.min(h.count * 20, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}