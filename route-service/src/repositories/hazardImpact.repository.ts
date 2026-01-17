import { PoolClient } from "pg";

export class HazardImpactRepository {
  static async findAffectedEdges(
    client: PoolClient,
    hazardId: string
  ): Promise<string[]> {
    const result = await client.query(
      `
      SELECT e.id
      FROM road_edges e
      JOIN hazards h
        ON ST_DWithin(
          e.geom::geography,
          h.geom::geography,
          h.radius_m
        )
      WHERE h.id = $1
        AND e.is_active = true
      `,
      [hazardId]
    );

    return result.rows.map((r) => r.id);
  }

  static async applyPenalty(
    client: PoolClient,
    edgeIds: string[],
    penalty: number
  ) {
    if (edgeIds.length === 0) return;

    await client.query(
      `
      UPDATE road_edges
      SET current_cost =
        CASE
          WHEN $2 = 'Infinity' THEN current_cost
          ELSE base_cost * $2
        END
      WHERE id = ANY($1::uuid[])
      `,
      [edgeIds, penalty]
    );
  }

  static async deactivateEdges(
    client: PoolClient,
    edgeIds: string[]
  ) {
    if (edgeIds.length === 0) return;

    await client.query(
      `
      UPDATE road_edges
      SET is_active = false
      WHERE id = ANY($1::uuid[])
      `,
      [edgeIds]
    );
  }

  static async upsertHazard(
    client: PoolClient,
    hazard: {
      id: string;
      severity: number;
      lat: number;
      lng: number;
      radius_m: number;
      active: boolean;
      expires_at: Date;
    }
  ) {
    await client.query(
      `
      INSERT INTO hazards (id, severity, geom, radius_m, active, expires_at)
      VALUES ($1, $2, ST_SetSRID(ST_Point($3, $4), 4326), $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        severity = EXCLUDED.severity,
        active = EXCLUDED.active,
        expires_at = EXCLUDED.expires_at,
        radius_m = EXCLUDED.radius_m
      `,
      [
        hazard.id,
        hazard.severity,
        hazard.lng,
        hazard.lat,
        hazard.radius_m,
        hazard.active,
        hazard.expires_at,
      ]
    );
  }
}
