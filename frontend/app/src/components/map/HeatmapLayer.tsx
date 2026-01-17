import { useEffect } from "react";
import maplibregl from "maplibre-gl";
import { useMapStore } from "@/app/src/stores/mapStore";

interface Props {
    map: maplibregl.Map | null;
}

export default function HeatmapLayer({ map }: Props) {
    const { showHeatmap, heatmapData } = useMapStore();

    useEffect(() => {
        if (!map || !showHeatmap) return;

        const sourceId = "heatmap-source";
        const layerId = "heatmap-layer";

        if (map.getLayer(layerId)) return;

        const geojson = {
            type: "FeatureCollection",
            features: heatmapData.map((b) => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [
                        b.lon_bucket / 100 + 0.005,
                        b.lat_bucket / 100 + 0.005,
                    ],
                },
                properties: {
                    intensity: b.intensity,
                    severity: b.severity,
                },
            })),
        };

        map.addSource(sourceId, {
            type: "geojson",
            data: geojson as any,
        });

        map.addLayer({
            id: layerId,
            type: "heatmap",
            source: sourceId,
            paint: {
                "heatmap-weight": [
                    "interpolate",
                    ["linear"],
                    ["get", "severity"],
                    1, 0,
                    5, 1
                ],
                "heatmap-intensity": 1,
                "heatmap-radius": 20,
                "heatmap-opacity": 0.8,
                "heatmap-color": [
                    "interpolate",
                    ["linear"],
                    ["heatmap-density"],
                    0, "rgba(34, 197, 94, 0)",
                    0.2, "rgb(34, 197, 94)",
                    0.6, "rgb(234, 179, 8)",
                    1, "rgb(239, 68, 68)",
                ],
            },
        });

        return () => {
            if (map.getLayer(layerId)) map.removeLayer(layerId);
            if (map.getSource(sourceId)) map.removeSource(sourceId);
        };
    }, [map, showHeatmap, heatmapData]);

    return null;
}
