import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = new Redis(redisUrl);
  }

  getClient(): Redis {
    return this.client;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
