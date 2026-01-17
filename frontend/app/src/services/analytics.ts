import { HeatmapResponse } from "../types/analytics";

const baseUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL || 'http://127.0.0.1:3004';

export async function fetchHeatmapData(params: {
  from: string;
  to: string;
  bbox: string;
  resolution: string;
}, signal?: AbortSignal): Promise<HeatmapResponse> {
  const query = new URLSearchParams(params).toString();

  const res = await fetch(
    `${baseUrl}/analytics/heatmap?${query}`,
    { cache: "no-store", signal }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch heatmap data");
  }

  return res.json();
}
