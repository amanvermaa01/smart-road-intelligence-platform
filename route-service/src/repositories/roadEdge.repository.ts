import { Pool } from "pg";
import { RoadEdge } from "../models/RoadEdge";

export class RoadEdgeRepository {
  constructor(private readonly db: Pool) {}

  async findAllActive(): Promise<RoadEdge[]> {
    const res = await this.db.query(`
      SELECT
        id,
        source,
        target,
        ST_AsText(geom) AS geom_wkt,
        base_cost,
        current_cost,
        is_active
      FROM road_edges
      WHERE is_active = TRUE
    `);

    return res.rows.map(r => ({
      id: r.id,
      source: Number(r.source),
      target: Number(r.target),
      geomWKT: r.geom_wkt,
      baseCost: Number(r.base_cost),
      currentCost: Number(r.current_cost),
      isActive: r.is_active
    }));
  }

  async updateCurrentCost(edgeIds: string[], newCost: number): Promise<void> {
    await this.db.query(
      `
      UPDATE road_edges
      SET current_cost = $1, updated_at = NOW()
      WHERE id = ANY($2)
      `,
      [newCost, edgeIds]
    );
  }

  async resetToBaseCost(edgeIds: string[]): Promise<void> {
    await this.db.query(
      `
      UPDATE road_edges
      SET current_cost = base_cost, updated_at = NOW()
      WHERE id = ANY($1)
      `,
      [edgeIds]
    );
  }

  async findNearestNode(lat: number, lng: number): Promise<number> {
    const res = await this.db.query(`
      WITH nearest_edge AS (
        SELECT 
          source, 
          target,
          ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as dist,
          geom
        FROM road_edges
        ORDER BY geom <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
        LIMIT 1
      )
      SELECT 
        CASE 
          WHEN ST_Distance(ST_StartPoint(geom)::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) < 
               ST_Distance(ST_EndPoint(geom)::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)
          THEN source
          ELSE target
        END as nearest_node
      FROM nearest_edge
    `, [lng, lat]);

    if (res.rows.length === 0) throw new Error("No road network found nearby");
    return Number(res.rows[0].nearest_node);
  }

  async findGeometryByEdges(edgeIds: string[]): Promise<any> {
    const res = await this.db.query(`
      SELECT ST_AsGeoJSON(ST_LineMerge(ST_Union(geom))) as geojson
      FROM road_edges
      WHERE id = ANY($1)
    `, [edgeIds]);

    if (res.rows.length === 0 || !res.rows[0].geojson) return null;
    return JSON.parse(res.rows[0].geojson);
  }
}
