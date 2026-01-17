export interface RoadEventMessage {
  id: string;
  lat: number;
  lng: number;
  severity: number;
  type: string;
  expiresAt: string;
  createdAt: string;
}
