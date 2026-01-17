import { HeatmapResponse } from "../types/analytics";

export async function fetchHeatmapData(params: {
  from: string;
  to: string;
  bbox: string;
  resolution: string;
}, signal?: AbortSignal): Promise<HeatmapResponse> {
  const query = new URLSearchParams(params).toString();
  const baseUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL || 'http://localhost:3004';

  const res = await fetch(
    `${baseUrl}/analytics/heatmap?${query}`,
    { cache: "no-store", signal }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch heatmap data");
  }

  return res.json();
}
