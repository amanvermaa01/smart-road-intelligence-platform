"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl, { Map, Marker } from "maplibre-gl";
import { useRouteStore } from "@/app/src/stores/routeStore";
import { fetchRoute } from "@/app/src/lib/routeApi";
import { useEventSocket } from "@/app/src/hooks/useEventSocket";
import { getBBoxFromMap } from "@/app/src/hooks/useMapBounds";
import { useMapStore } from "@/app/src/stores/mapStore";
import { RouteInfoOverlay } from "../map/RouteInfoOverlay";
import EventMarkers from "./EventMarkers";
import ReportEventModal from "./ReportEventModal";
import HeatmapLayer from "./HeatmapLayer";
import TimeSlider from "./TimeSlider";

export default function MapView() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<Map | null>(null);
    const sourceMarker = useRef<Marker | null>(null);
    const destMarker = useRef<Marker | null>(null);
    const reportMarker = useRef<Marker | null>(null);

    const [bbox, setBbox] = useState<{ north: number, south: number, east: number, west: number } | null>(null);
    const [clickedLocation, setClickedLocation] = useState<maplibregl.LngLat | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [isReportingMode, setIsReportingMode] = useState(false);

    const {
        setSource,
        setDestination,
        setRoute,
        setIsBlocked,
        setSelectedRouteId,
        selectedRouteType,
        reset,
    } = useRouteStore();

    const { flyToCoord, setFlyToCoord } = useMapStore();

    useEventSocket(bbox);

    const placeSourceMarker = (coords: [number, number]) => {
        sourceMarker.current?.remove();
        const el = document.createElement('div');
        el.className = 'w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse';

        const marker = new maplibregl.Marker({ element: el, draggable: true })
            .setLngLat(coords)
            .addTo(mapInstance.current!);
        sourceMarker.current = marker;
    };

    const placeDestinationMarker = (coords: [number, number]) => {
        destMarker.current?.remove();
        const el = document.createElement('div');
        el.className = 'w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse';

        const marker = new maplibregl.Marker({ element: el, draggable: true })
            .setLngLat(coords)
            .addTo(mapInstance.current!);
        destMarker.current = marker;
    };

    const drawRoute = (primaryGeom: GeoJSON.LineString, altGeom?: GeoJSON.LineString, isBlocked: boolean = false) => {
        const map = mapInstance.current!;

        // Cleanup existing
        const sources = ["route-primary", "route-alt"];
        sources.forEach(s => {
            if (map.getSource(s)) {
                if (map.getLayer(`${s}-line`)) map.removeLayer(`${s}-line`);
                if (map.getLayer(`${s}-casing`)) map.removeLayer(`${s}-casing`);
                map.removeSource(s);
            }
        });

        // Add Primary
        map.addSource("route-primary", {
            type: "geojson",
            data: { type: "Feature", properties: {}, geometry: primaryGeom },
        });

        const primaryColor = isBlocked ? "#ef4444" : "#38bdf8";
        const primaryCasing = isBlocked ? "#f87171" : "#0ea5e9";

        map.addLayer({
            id: "route-primary-casing",
            type: "line",
            source: "route-primary",
            paint: {
                "line-width": 8,
                "line-color": primaryCasing,
                "line-opacity": 0.2,
                "line-blur": 3
            },
        });

        map.addLayer({
            id: "route-primary-line",
            type: "line",
            source: "route-primary",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
                "line-width": 4,
                "line-color": primaryColor
            },
        });

        // Add Alternative if exists
        if (altGeom) {
            map.addSource("route-alt", {
                type: "geojson",
                data: { type: "Feature", properties: {}, geometry: altGeom },
            });

            map.addLayer({
                id: "route-alt-casing",
                type: "line",
                source: "route-alt",
                paint: {
                    "line-width": 10,
                    "line-color": "#10b981",
                    "line-opacity": 0.1,
                    "line-blur": 5
                },
            });

            map.addLayer({
                id: "route-alt-line",
                type: "line",
                source: "route-alt",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: {
                    "line-width": 4,
                    "line-color": "#10b981",
                    "line-dasharray": [2, 1]
                },
            });
        }
    };

    const clearMap = () => {
        sourceMarker.current?.remove();
        sourceMarker.current = null;
        destMarker.current?.remove();
        destMarker.current = null;
        reportMarker.current?.remove();
        reportMarker.current = null;
        const map = mapInstance.current!;

        const sources = ["route-primary", "route-alt"];
        sources.forEach(s => {
            if (map?.getSource(s)) {
                if (map.getLayer(`${s}-line`)) map.removeLayer(`${s}-line`);
                if (map.getLayer(`${s}-casing`)) map.removeLayer(`${s}-casing`);
                map.removeSource(s);
            }
        });
    };

    const updateRoute = async (start: [number, number], end: [number, number]) => {
        try {
            const data = await fetchRoute(start, end);
            if (data?.geometry?.coordinates) {
                setRoute(data.geometry, data.alternativeRoute);
                setSelectedRouteId(data.id);
                setIsBlocked(data.isBlocked);
                drawRoute(data.geometry, data.alternativeRoute, data.isBlocked);

                const bounds = new maplibregl.LngLatBounds();
                data.geometry.coordinates.forEach((coord: number[]) => {
                    bounds.extend(coord as [number, number]);
                });
                if (data.alternativeRoute) {
                    data.alternativeRoute.coordinates.forEach((coord: number[]) => {
                        bounds.extend(coord as [number, number]);
                    });
                }
                mapInstance.current?.fitBounds(bounds, { padding: 100 });
            }
        } catch (error) {
            console.error("Failed to fetch route:", error);
        }
    };

    const handleClick = useCallback((e: maplibregl.MapMouseEvent) => {
        const { source, destination } = useRouteStore.getState();
        const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

        if (isReportingMode || e.originalEvent.shiftKey) {
            reportMarker.current?.remove();

            const el = document.createElement('div');
            el.className = 'w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-bounce flex items-center justify-center text-[10px] text-white font-bold';
            el.innerText = '!';

            reportMarker.current = new maplibregl.Marker({ element: el })
                .setLngLat(e.lngLat)
                .addTo(mapInstance.current!);

            setClickedLocation(e.lngLat);
            setIsReportingMode(false);
            return;
        }

        if (!source) {
            setSource(coords);
            placeSourceMarker(coords);
            return;
        }

        if (!destination) {
            setDestination(coords);
            placeDestinationMarker(coords);
            updateRoute(source, coords);
            return;
        }

        clearMap();
        reset();
    }, [setSource, setDestination, reset, isReportingMode]);

    useEffect(() => {
        const map = mapInstance.current;
        if (!map || !mapReady) return;

        if (map.getLayer("route-primary-line")) {
            map.setPaintProperty("route-primary-line", "line-width", selectedRouteType === 'primary' ? 6 : 3);
            map.setPaintProperty("route-primary-line", "line-opacity", selectedRouteType === 'primary' ? 1 : 0.4);
        }
        if (map.getLayer("route-alt-line")) {
            map.setPaintProperty("route-alt-line", "line-width", selectedRouteType === 'alternative' ? 6 : 3);
            map.setPaintProperty("route-alt-line", "line-opacity", selectedRouteType === 'alternative' ? 1 : 0.4);
        }
    }, [selectedRouteType, mapReady]);

    useEffect(() => {
        if (flyToCoord && mapInstance.current) {
            mapInstance.current.flyTo({
                center: flyToCoord,
                zoom: 15,
                essential: true
            });
            setFlyToCoord(null);
        }
    }, [flyToCoord, setFlyToCoord]);

    useEffect(() => {
        if (!containerRef.current) return;

        mapInstance.current = new maplibregl.Map({
            container: containerRef.current,
            style: "https://tiles.openfreemap.org/styles/dark",
            center: [80.9462, 26.8467],
            zoom: 12,
        });

        const map = mapInstance.current;

        map.on("load", () => {
            setMapReady(true);
            setBbox(getBBoxFromMap(map));
        });

        map.on("moveend", () => {
            setBbox(getBBoxFromMap(map));
        });

        map.addControl(new maplibregl.NavigationControl(), 'top-right');
        map.on("click", handleClick);

        return () => {
            map.remove();
        };
    }, [handleClick]);

    return (
        <div className="relative w-full h-full bg-[#020617]" suppressHydrationWarning>
            <div
                ref={containerRef}
                className={`w-full h-full transition-opacity duration-1000 ${mapReady ? 'opacity-100' : 'opacity-0'} ${isReportingMode ? 'cursor-crosshair' : ''}`}
                id="map"
                suppressHydrationWarning
            />

            {mapReady && <EventMarkers mapRef={mapInstance} />}
            {mapReady && <HeatmapLayer map={mapInstance.current} />}
            {mapReady && <TimeSlider />}

            {clickedLocation && (
                <ReportEventModal
                    location={clickedLocation}
                    onClose={() => {
                        setClickedLocation(null);
                        reportMarker.current?.remove();
                        reportMarker.current = null;
                    }}
                />
            )}

            <RouteInfoOverlay />

            {/* Floating Action Buttons */}
            <div className="absolute top-8 left-8 flex flex-col gap-4 z-10">
                <button
                    onClick={() => setIsReportingMode(!isReportingMode)}
                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95 ${isReportingMode
                        ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] border border-red-400/50'
                        : 'glass-panel text-white hover:bg-white/10'
                        }`}
                >
                    <span className="text-lg">{isReportingMode ? '✕' : '🚨'}</span>
                    {isReportingMode ? 'Cancel Selection' : 'Log Incident'}
                </button>
            </div>

            <div className="absolute bottom-10 left-8 glass-panel py-4 px-6 rounded-2xl shadow-2xl border-white/5 z-10 pointer-events-none">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Operational Status</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            <span className="text-xs font-black text-white uppercase tracking-widest italic">Grid Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
