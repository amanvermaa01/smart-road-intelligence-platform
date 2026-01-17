export interface RoadEdge {
  id: string;
  source: number;
  target: number;

  geomWKT: string; // WKT for transport, PostGIS-native

  baseCost: number;
  currentCost: number;

  isActive: boolean;
}
