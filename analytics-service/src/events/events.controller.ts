import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClickHouseService } from '../clickhouse/clickhouse.service';

@Controller()
export class EventsController {
  constructor(private readonly clickhouse: ClickHouseService) {}

  @MessagePattern('road-events')
  async handleRoadEvent(@Payload() event: any) {
    // Format for ClickHouse raw table
    const row = {
      event_time: new Date(event.timestamp || Date.now()).toISOString().slice(0, 19).replace('T', ' '),
      lat: Number(event.lat),
      lon: Number(event.lng),
      severity: Number(event.severity || 1),
      event_type: event.type || 'unknown',
      route_id: event.route_id || '',
    };

    await this.clickhouse.insert('traffic_events_raw', [row]);
    // Note: Aggregation can be done via Materialized Views in ClickHouse 
    // or periodically in the service. For now, we rely on the raw table.
  }
}
