import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, ClickHouseClient } from '@clickhouse/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClickHouseService implements OnModuleInit, OnModuleDestroy {
  private client: ClickHouseClient;

  constructor(private config: ConfigService) {
    this.client = createClient({
      host: this.config.get<string>('CLICKHOUSE_HOST') || 'http://localhost:8123',
      database: this.config.get<string>('CLICKHOUSE_DB') || 'analytics',
      username: this.config.get<string>('CLICKHOUSE_USER') || 'default',
      password: this.config.get<string>('CLICKHOUSE_PASS') || '',
    });
  }

  onModuleInit() {
    // Basic ping to verify connectivity
    this.client.ping();
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  getClient(): ClickHouseClient {
    return this.client;
  }

  async insert(table: string, values: any[]) {
    return this.client.insert({
      table,
      values,
      format: 'JSONEachRow',
    });
  }

  async query(query: string, query_params?: Record<string, any>) {
    return this.client.query({
      query,
      query_params,
      format: 'JSONEachRow',
    });
  }
}
