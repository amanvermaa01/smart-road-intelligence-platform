export type RoadEventType = "accident" | "pothole" | "flooding" | "other";

export interface RoadEvent {
  id: string;
  lat: number;
  lng: number;
  severity: number; // 1–5
  type: RoadEventType;
  description?: string;
  expiresAt: string;
  upvotes: number;
  downvotes: number;
}
