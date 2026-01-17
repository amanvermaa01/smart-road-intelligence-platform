import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HazardRepository } from '../repositories/hazard.repository';
import { RoadEdgeRepository } from '../repositories/roadEdge.repository';
import { graphManager } from '../graph/graphManager';

@Injectable()
export class RouteService {
  constructor(
    private readonly hazardRepo: HazardRepository,
    private readonly roadEdgeRepo: RoadEdgeRepository
  ) {}

  async getRoute(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
  ) {
    const baseUrl = process.env.OSRM_URL || 'http://localhost:5000';
    const osrmUrl = `${baseUrl}/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    let response;
    try {
      response = await fetch(osrmUrl);
    } catch (err) {
      throw new InternalServerErrorException('OSRM service unreachable');
    }

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) {
      throw new InternalServerErrorException('No route found');
    }

    const route = data.routes[0];
    const hazards = await this.hazardRepo.findNearGeometry(route.geometry, 100);
    const hasSignificantHazards = hazards.some(h => h.severity >= 3);
    const isBlocked = hazards.some(h => h.severity === 5);

    let alternative_route: any = null;

    if (hasSignificantHazards) {
        try {
            const startNode = await this.roadEdgeRepo.findNearestNode(start.lat, start.lng);
            const endNode = await this.roadEdgeRepo.findNearestNode(end.lat, end.lng);
            
            const graph = graphManager.getInternalGraph();
            const edgePath = graph.findPath(startNode, endNode);

            if (edgePath) {
                const altGeom = await this.roadEdgeRepo.findGeometryByEdges(edgePath);
                alternative_route = {
                    geometry: altGeom,
                    description: "Safer alternative avoiding hazards"
                };
            }
        } catch (err) {
            console.error("[RouteService] Alternative routing failed:", err);
        }
    }

    return {
      distance_meters: route.distance,
      eta_seconds: route.duration,
      geometry: route.geometry,
      hazards: hazards.map(h => ({ id: h.id, severity: h.severity })),
      is_blocked: isBlocked,
      alternative_route
    };
  }
}
