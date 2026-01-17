import { Injectable } from '@nestjs/common';
import { ClickHouseService } from '../clickhouse/clickhouse.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly clickhouse: ClickHouseService) {}

  async getHeatmap(from: string, to: string, resolution: string, bbox: string) {
    const table = this.getTableForResolution(resolution);
    const [latMin, lonMin, latMax, lonMax] = bbox.split(',').map(Number);

    const formattedFrom = this.formatDate(from);
    const formattedTo = this.formatDate(to);

    const query = `
      SELECT
        lat_bucket,
        lon_bucket,
        SUM(event_count) AS intensity,
        AVG(avg_severity) AS severity
      FROM ${table}
      WHERE window_start BETWEEN {from:DateTime} AND {to:DateTime}
        AND lat_bucket BETWEEN {latMin:Int32} AND {latMax:Int32}
        AND lon_bucket BETWEEN {lonMin:Int32} AND {lonMax:Int32}
      GROUP BY lat_bucket, lon_bucket
      LIMIT 10000
    `;

    const result = await this.clickhouse.query(query, {
      from: formattedFrom,
      to: formattedTo,
      latMin: Math.floor(latMin * 100),
      latMax: Math.floor(latMax * 100),
      lonMin: Math.floor(lonMin * 100),
      lonMax: Math.floor(lonMax * 100),
    });

    const buckets = await result.json();
    return { buckets };
  }

  private formatDate(dateStr: string): string {
    // Standardize ISO strings (2026-01-14T18:46:54.979Z) to ClickHouse DateTime (YYYY-MM-DD HH:MM:SS)
    return new Date(dateStr).toISOString().slice(0, 19).replace('T', ' ');
  }

  private getTableForResolution(res: string): string {
    switch (res) {
      case '15m': return 'traffic_heatmap_15m';
      case '1h': return 'traffic_heatmap_1h';
      default: return 'traffic_heatmap_5m';
    }
  }
}
