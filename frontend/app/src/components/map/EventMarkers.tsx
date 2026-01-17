"use client";

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { useEventStore } from "@/app/src/stores/eventStore";
import { useDashboardFilters } from "../../stores/filters.store";
import { deleteEvent } from "@/app/src/services/eventApi";
import { voteEvent } from "@/app/src/services/eventApi";
import { toast } from "sonner";

const getColor = (severity: number, type?: string) => {
    if (type === "other") return "#a855f7"; // purple-500
    if (severity >= 4) return "#ef4444"; // red-500
    if (severity === 3) return "#f97316"; // orange-500
    return "#eab308"; // yellow-500
};

export default function EventMarkers({ mapRef }: { mapRef: React.RefObject<maplibregl.Map | null> }) {
    const rawEvents = useEventStore((s) => s.events);
    const { severity: filterSev, eventType: filterType, hoursAgo } = useDashboardFilters();
    const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

    // Filter events based on global filters
    const filteredEvents = new Map([...rawEvents].filter(([_, event]) => {
        if (filterSev && event.severity < Number(filterSev)) return false;
        if (filterType && event.type !== filterType) return false;

        if (hoursAgo) {
            const eventTime = new Date(event.timestamp).getTime();
            const cutoff = Date.now() - (hoursAgo * 60 * 60 * 1000);
            if (eventTime < cutoff) return false;
        }

        return true;
    }));

    useEffect(() => {
        if (!mapRef.current) return;

        // Remove markers that are no longer in the filtered set
        markersRef.current.forEach((marker, id) => {
            if (!filteredEvents.has(id)) {
                marker.remove();
                markersRef.current.delete(id);
            }
        });

        // Add or update markers from the filtered set
        filteredEvents.forEach((event, id) => {
            if (!markersRef.current.has(id)) {
                const color = getColor(event.severity, event.type);
                const icon = event.type === 'accident' ? '🚨' : event.type === 'pothole' ? '🕳' : event.type === 'flooding' ? '🌊' : '❓';

                const el = document.createElement("div");
                el.className = 'relative flex items-center justify-center cursor-pointer group';

                // Pulsing light effect
                const aura = document.createElement("div");
                aura.className = 'absolute w-10 h-10 rounded-full animate-pulse opacity-20 transition-all duration-1000 group-hover:opacity-40';
                aura.style.backgroundColor = color;
                aura.style.filter = 'blur(8px)';

                // Inner core with icon
                const core = document.createElement("div");
                core.className = 'relative w-8 h-8 rounded-full border-2 border-white shadow-2xl flex items-center justify-center text-sm transition-transform duration-300 group-hover:scale-110';
                core.style.backgroundColor = color;
                core.style.boxShadow = `0 0 20px ${color}`;
                core.innerText = icon;

                el.appendChild(aura);
                el.appendChild(core);

                const popup = new maplibregl.Popup({
                    offset: 25,
                    className: 'cmd-popup',
                    closeButton: false
                })
                    .setHTML(`
                    <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; min-width: 140px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                            <div style="width: 2px; height: 10px; background: ${color}; border-radius: 4px;"></div>
                            <h4 style="margin: 0; text-transform: uppercase; color: white; font-size: 10px; font-weight: 900; letter-spacing: 0.1em;">
                                ${event.type === 'other' ? 'Other Issue' : event.type}
                            </h4>
                        </div>
                        <div style="display: flex; gap: 4px; margin-bottom: 8px;">
                            ${Array.from({ length: 5 }).map((_, i) => `
                                <div style="width: 12px; height: 3px; border-radius: 1px; background: ${i < event.severity ? color : 'rgba(255,255,255,0.1)'}"></div>
                            `).join('')}
                        </div>
                        ${event.description ? `<p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.6); line-height: 1.4; font-style: italic;">"${event.description}"</p>` : ''}
                        
                        <button id="delete-btn-${id}" style="margin-top: 12px; width: 100%; padding: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; color: #ef4444; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s;">
                            Decommission Incident
                        </button>
                        
                        <div style="display: flex; gap: 8px; margin-top: 8px;">
                            <button id="vote-up-${id}" style="flex: 1; padding: 6px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 6px; color: #22c55e; font-size: 9px; font-weight: 900; cursor: pointer;">
                                ▲ ${event.upvotes || 0}
                            </button>
                            <button id="vote-down-${id}" style="flex: 1; padding: 6px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 6px; color: #ef4444; font-size: 9px; font-weight: 900; cursor: pointer;">
                                ▼ ${event.downvotes || 0}
                            </button>
                        </div>
                    </div>
                `);

                popup.on('open', () => {
                    const btn = document.getElementById(`delete-btn-${id}`);
                    const upBtn = document.getElementById(`vote-up-${id}`);
                    const downBtn = document.getElementById(`vote-down-${id}`);

                    if (upBtn) {
                        upBtn.onclick = async (e) => {
                            e.stopPropagation();
                            try {
                                await voteEvent(id, 'up');
                                toast.success("Upvote recorded");
                                // Optimistic update (requires reload to see persistent count in popup unless we re-render marker)
                            } catch (err) {
                                toast.error("Failed to vote");
                            }
                        };
                    }

                    if (downBtn) {
                        downBtn.onclick = async (e) => {
                            e.stopPropagation();
                            try {
                                await voteEvent(id, 'down');
                                toast.success("Downvote recorded");
                            } catch (err) {
                                toast.error("Failed to vote");
                            }
                        };
                    }

                    if (btn) {
                        btn.onclick = async () => {
                            try {
                                btn.innerText = 'Transmitting...';
                                await deleteEvent(id);
                                toast.success("Incident Decommissioned");
                                marker.remove();
                                markersRef.current.delete(id);
                            } catch (err) {
                                toast.error("Tactical failure: Unable to delete");
                                btn.innerText = 'Decommission Incident';
                            }
                        };

                        btn.onmouseenter = () => {
                            btn.style.background = 'rgba(239, 68, 68, 0.2)';
                            btn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                        };
                        btn.onmouseleave = () => {
                            btn.style.background = 'rgba(239, 68, 68, 0.1)';
                            btn.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                        };
                    }
                });

                const marker = new maplibregl.Marker({ element: el })
                    .setLngLat([event.lng, event.lat])
                    .addTo(mapRef.current!);

                // Hover to show popup
                el.addEventListener('mouseenter', () => {
                    popup.addTo(mapRef.current!);
                    popup.setLngLat([event.lng, event.lat]);
                });

                el.addEventListener('mouseleave', () => {
                    // Delay to allow clicking the delete button
                    setTimeout(() => {
                        if (!popup.getElement()?.matches(':hover')) {
                            popup.remove();
                        }
                    }, 100);
                });

                // Keep popup open when hovering over it
                popup.on('open', () => {
                    const popupEl = popup.getElement();
                    if (popupEl) {
                        popupEl.addEventListener('mouseleave', () => {
                            popup.remove();
                        });

                        const btn = document.getElementById(`delete-btn-${id}`);
                        if (btn) {
                            btn.onclick = async () => {
                                try {
                                    btn.innerText = 'Transmitting...';
                                    await deleteEvent(id);
                                    toast.success("Incident Decommissioned");
                                    popup.remove();
                                    marker.remove();
                                    markersRef.current.delete(id);
                                } catch (err) {
                                    toast.error("Tactical failure: Unable to delete");
                                    btn.innerText = 'Decommission Incident';
                                }
                            };

                            btn.onmouseenter = () => {
                                btn.style.background = 'rgba(239, 68, 68, 0.2)';
                                btn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                            };
                            btn.onmouseleave = () => {
                                btn.style.background = 'rgba(239, 68, 68, 0.1)';
                                btn.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                            };
                        }
                    }
                });

                markersRef.current.set(id, marker);
            }
        });
    }, [filteredEvents, mapRef]);

    return null;
}
