import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { EventFeedItem } from './dto/event-feed-item.dto';
import { RouteHazardSummary } from './dto/route-hazard-summary.dto';
import { RouteResponse } from './dto/route-response.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly redis: RedisService) {}

  async getRouteHazardSummary(routeId: string): Promise<RouteHazardSummary> {
    // Try to get cached geometry to perform dynamic calculation
    const geomKey = `route:${routeId}:geometry`;
    const cachedGeom = await this.redis.getClient().get(geomKey);

    if (cachedGeom) {
      return this.calculateHazardSummary(routeId, JSON.parse(cachedGeom));
    }

    // Fallback to old hash-based summary if any (or mocks)
    const key = `route:${routeId}:hazards:summary`;
    const data = await this.redis.getClient().hgetall(key);

    let byType = Object.entries(data).map(([type, count]) => ({
      type,
      count: Number(count),
    }));

    if (byType.length === 0) {
      byType = [
        { type: 'surface', count: 2 },
        { type: 'tactical', count: 1 },
      ];
    }

    const totalHazards = byType.reduce((s, h) => s + h.count, 0);
    const bySeverity = [
      { type: 'Critical (L5)', count: byType.find(t => t.type === 'tactical')?.count || 0 },
      { type: 'Major (L4)', count: Math.ceil(totalHazards * 0.3) },
      { type: 'Moderate (L3)', count: Math.floor(totalHazards * 0.5) },
    ].filter(s => s.count > 0);

    return { routeId, totalHazards, byType, bySeverity };
  }

  async getEventFeed(
    routeId?: string,
    severityMin?: number,
    type?: string,
    hoursAgo?: number,
    limit = 20,
  ): Promise<EventFeedItem[]> {
    const key = `route:${routeId}:events:latest`;
    const rawEvents = await this.redis
      .getClient()
      .zrevrange(key, 0, limit - 1);

    let parsed = rawEvents.map(e => JSON.parse(e));

    // If no route-specific events, return general latest events as fallback
    if (parsed.length === 0) {
        const globalKey = 'events:latest';
        const globalRaw = await this.redis.getClient().zrevrange(globalKey, 0, limit - 1);
        parsed.push(...globalRaw.map(e => JSON.parse(e)));
    }

    return parsed.filter(e => {
      if (severityMin != null && e.severity < severityMin) return false;
      if (type != null && e.type !== type) return false;
      if (hoursAgo != null) {
        const eventTime = new Date(e.timestamp).getTime();
        const cutoff = Date.now() - (hoursAgo * 60 * 60 * 1000);
        if (eventTime < cutoff) return false;
      }
      return true;
    });
  }

  async getRoute(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
  ): Promise<RouteResponse> {
    const routeServiceUrl = process.env.ROUTE_SERVICE_URL || 'http://localhost:3001';
    const response = await fetch(`${routeServiceUrl}/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: { lat: startLat, lng: startLng },
        end: { lat: endLat, lng: endLng },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch route from route-service');
    }

    const data = await response.json();
    const routeId = Math.random().toString(36).substring(7);

    // Cache geometry for HazardSummaryCard queries
    await this.redis.getClient().set(`route:${routeId}:geometry`, JSON.stringify(data.geometry), 'EX', 3600);

    // Calculate real hazards near the route
    const hazardSummary = await this.calculateHazardSummary(routeId, data.geometry);

    return {
      id: routeId,
      distanceMeters: data.distance_meters,
      etaSeconds: data.eta_seconds,
      geometry: data.geometry,
      hazardSummary,
      alternativeRoute: data.alternative_route,
      isBlocked: data.is_blocked || false,
    };
  }

  private async calculateHazardSummary(routeId: string, geometry: any): Promise<RouteHazardSummary> {
    const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
    try {
      const response = await fetch(`${eventServiceUrl}/events/near`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geometry, distanceMeters: 500 }),
      });

      if (response.ok) {
        const events = await response.json();
        const typesMap = new Map<string, number>();
        const severityMap = new Map<number, number>();

        events.forEach((e: any) => {
          typesMap.set(e.type, (typesMap.get(e.type) || 0) + 1);
          severityMap.set(e.severity, (severityMap.get(e.severity) || 0) + 1);
        });

        const byType = Array.from(typesMap.entries()).map(([type, count]) => ({ type, count }));
        const totalHazards = events.length;
        const bySeverity = [
            { type: 'Critical (L5)', count: severityMap.get(5) || 0 },
            { type: 'Major (L4)', count: severityMap.get(4) || 0 },
            { type: 'Moderate (L3)', count: (severityMap.get(3) || 0) + (severityMap.get(2) || 0) + (severityMap.get(1) || 0) },
        ].filter(s => s.count > 0);

        return { routeId, totalHazards, byType, bySeverity };
      }
    } catch (err) {
      console.error('Failed to calculate hazard summary:', err.message);
    }

    // Default return if something fails
    return { routeId, totalHazards: 0, byType: [], bySeverity: [] };
  }

  async deleteEvent(id: string): Promise<boolean> {
    const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
    const response = await fetch(`${eventServiceUrl}/events/${id}`, {
      method: 'DELETE',
    });

    return response.ok;
  }

  async voteEvent(id: string, type: string): Promise<boolean> {
    const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
    try {
      const response = await fetch(`${eventServiceUrl}/events/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      return response.ok;
    } catch (err) {
      console.error('Failed to vote event:', err);
      return false;
    }
  }
}
