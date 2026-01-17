import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { EventsGateway } from './events.gateway';
import { REDIS_EVENT_CHANNEL } from '../constants/redis.constants';

@Injectable()
export class RedisSubscriberService implements OnModuleInit {
  private readonly logger = new Logger(RedisSubscriberService.name);
  private subscriber: Redis;

  constructor(private readonly eventsGateway: EventsGateway) {}

  async onModuleInit() {
    this.subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    await this.subscriber.subscribe(REDIS_EVENT_CHANNEL);

    this.subscriber.on('message', (channel, message) => {
      if (channel === REDIS_EVENT_CHANNEL) {
        try {
          const event = JSON.parse(message);
          this.eventsGateway.broadcastEvent(event);
        } catch (err) {
          this.logger.error('Failed to parse redis message', err);
        }
      }
    });

    this.logger.log(`[Redis] Subscribed to ${REDIS_EVENT_CHANNEL}`);
  }
}
