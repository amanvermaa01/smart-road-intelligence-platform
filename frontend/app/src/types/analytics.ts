export interface HeatmapBucket {
  lat_bucket: number;
  lon_bucket: number;
  intensity: number;
  severity: number;
}

export interface HeatmapResponse {
  buckets: HeatmapBucket[];
}
