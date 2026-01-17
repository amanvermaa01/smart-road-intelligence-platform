import { Pool } from "pg";
import { Hazard } from "../models/Hazard";

export class HazardRepository {
  constructor(private readonly db: Pool) {}

  async create(hazard: Hazard): Promise<void> {
    await this.db.query(
      `
      INSERT INTO hazards (
        id, severity, geom, radius_m, active, expires_at
      )
      VALUES (
        $1,
        $2,
        ST_GeomFromText($3, 4326),
        $4,
        $5,
        $6
      )
      `,
      [
        hazard.id,
        hazard.severity,
        hazard.geomWKT,
        hazard.radiusM,
        hazard.active,
        hazard.expiresAt
      ]
    );
  }

  async findNearGeometry(geometry: any, distanceMeters: number = 50): Promise<Hazard[]> {
    const res = await this.db.query(`
      SELECT
        id,
        severity,
        ST_AsText(geom) AS geom_wkt,
        radius_m,
        active,
        expires_at
      FROM hazards
      WHERE active = TRUE
        AND expires_at > NOW()
        AND ST_DWithin(
          geom::geography,
          ST_GeomFromGeoJSON($1)::geography,
          $2
        )
    `, [JSON.stringify(geometry), distanceMeters]);

    return res.rows.map(r => ({
      id: r.id,
      severity: r.severity,
      geomWKT: r.geom_wkt,
      radiusM: r.radius_m,
      active: r.active,
      expiresAt: r.expires_at
    }));
  }
}
