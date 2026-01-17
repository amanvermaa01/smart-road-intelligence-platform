"use client";

import { useQuery, gql } from "@apollo/client";
import { useDashboardFilters } from "../../stores/filters.store";
import { voteEvent } from "../../services/eventApi";
import { toast } from "sonner";
import { EVENT_FEED } from "../../lib/apollo/queries";


export function EventFeedList() {
    const { severity, eventType, hoursAgo } = useDashboardFilters(); // Ensure store supports these
    const { data, loading, refetch } = useQuery(EVENT_FEED, {
        variables: {
            severityMin: severity ? Number(severity) : undefined,
            type: eventType,
            hoursAgo
        },
        pollInterval: 15000,
    });

    const handleVote = async (id: string, type: 'up' | 'down') => {
        try {
            await voteEvent(id, type);
            toast.success("Vote recorded");
            refetch();
        } catch (e) {
            toast.error("Failed to vote");
        }
    };

    const events = [...(data?.eventFeed || [])].sort((a: any, b: any) => {
        // Sort by severity (desc) then time (desc)
        if (b.severity !== a.severity) return b.severity - a.severity;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {loading && (
                    <div className="flex items-center gap-3 p-4 animate-pulse">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span className="text-[10px] font-black text-blue-400/40 uppercase tracking-widest">Scanning Frequencies...</span>
                    </div>
                )}

                {events.length === 0 && !loading && (
                    <div className="text-center py-12 opacity-20">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Activity Detected</p>
                    </div>
                )}

                {events.map((e: any) => (
                    <div key={e.id} className="glass-card p-4 rounded-xl border-white/5 group hover:border-blue-500/30">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-black text-white/90 capitalize tracking-tight group-hover:text-blue-400 transition-colors">
                                {e.type}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-md font-black border uppercase tracking-tighter ${e.severity >= 4
                                ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                                : e.severity >= 3
                                    ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                SEV {e.severity}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                                    {new Date(e.timestamp).toLocaleTimeString([], { hour12: false })}
                                </span>
                            </div>
                            <span className="text-[8px] font-mono text-blue-400/20 group-hover:text-blue-400/60 transition-colors">ID:{e.id.substring(0, 8)}</span>
                        </div>

                        {/* Voting Controls */}
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleVote(e.id, 'up')}
                                    className="px-2 py-1 rounded bg-green-500/10 hover:bg-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
                                >
                                    ▲ {e.upvotes || 0}
                                </button>
                                <button
                                    onClick={() => handleVote(e.id, 'down')}
                                    className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
                                >
                                    ▼ {e.downvotes || 0}
                                </button>
                            </div>
                            <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Validate</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}