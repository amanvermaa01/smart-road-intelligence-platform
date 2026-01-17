import { Injectable } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

@Injectable()
export class RedisPubSubService {
  private readonly pubSub: RedisPubSub;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.pubSub = new RedisPubSub({
      publisher: new Redis(redisUrl),
      subscriber: new Redis(redisUrl),
    });
  }

  getPubSub(): RedisPubSub {
    return this.pubSub;
  }
}
