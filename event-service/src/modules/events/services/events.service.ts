import { Injectable } from '@nestjs/common';
import { EventsRepository } from '../repositories/events.repository';
import { CreateEventDto } from '../dto/create-event.dto';
import { KafkaService } from '../../../kafka/kafka.service';
import { KAFKA_TOPICS } from '../../../kafka/topics';
import { RedisService } from '../../../redis/redis.service';
import { REDIS_EVENT_CHANNEL } from '../constants/redis.constants';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventRepo: EventsRepository,
    private readonly kafkaService: KafkaService,
    private readonly redisService: RedisService,
  ) {}

  async createEvent(dto: CreateEventDto) {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (dto.expiresInSeconds || 900));

    const saved = await this.eventRepo.createEvent({
      lat: dto.lat,
      lng: dto.lng,
      severity: dto.severity,
      type: dto.type,
      description: dto.description || '',
      expiresAt: expiresAt,
    });

    const eventData = {
      id: saved.id,
      lat: dto.lat,
      lng: dto.lng,
      severity: dto.severity,
      type: dto.type,
      description: dto.description,
      expiresAt: saved.expiresAt.toISOString(),
      createdAt: saved.createdAt.toISOString(),
      _publishedAt: Date.now(),
    };

    /* ----------------------------
       Kafka (ASYNC WORKFLOWS)
       ---------------------------- */
    try {
      await this.kafkaService.emit(
        KAFKA_TOPICS.ROAD_EVENTS,
        saved.id,
        eventData,
      );
    } catch (error) {
      console.error('[Kafka] Failed to emit event:', error.message);
    }

    /* ----------------------------
       Redis (REAL-TIME BROADCAST)
       ---------------------------- */
    try {
      const client = this.redisService.getClient();
      // Store event data with TTL in Redis for quick access during sync
      await client.set(
        `events:data:${saved.id}`,
        JSON.stringify(eventData),
        'EX',
        dto.expiresInSeconds || 900
      );
      
      await client.publish(
        REDIS_EVENT_CHANNEL,
        JSON.stringify(eventData),
      );

      // Add to global latest events feed
      await client.zadd(
        'events:latest',
        Date.now(),
        JSON.stringify(eventData)
      );
      // Keep only last 100 events
      await client.zremrangebyrank('events:latest', 0, -101);
    } catch (error) {
      console.error('[Redis] Failed to publish event:', error.message);
    }

    return saved;
  }

  async deleteEvent(id: string) {
    const result = await this.eventRepo.deleteMany([id]);
    
    try {
      const client = this.redisService.getClient();
      await client.del(`events:data:${id}`);
      await client.publish(
        REDIS_EVENT_CHANNEL,
        JSON.stringify({ id, _deleted: true }),
      );

      // Remove from sorted set
      const allEvents = await client.zrange('events:latest', 0, -1);
      for (const eventJson of allEvents) {
        try {
          const parsed = JSON.parse(eventJson);
          if (parsed.id === id) {
            await client.zrem('events:latest', eventJson);
            break;
          }
        } catch (e) {
          // Skip malformed entries
        }
      }
    } catch (error) {
      console.error('[Redis] Failed to publish deletion:', error.message);
    }

    return result;
  }

  async findAll(filters?: { type?: string; hoursAgo?: number }) {
    return this.eventRepo.findAllFiltered(filters);
  }

  async voteEvent(id: string, type: 'up' | 'down') {
    const event = await this.eventRepo.findOne(id);
    if (!event) return null;

    if (type === 'up') event.upvotes += 1;
    else event.downvotes += 1;

    return this.eventRepo.save(event);
  }

  async getEventsInBBox(bbox: { north: number; south: number; east: number; west: number }) {
    return this.eventRepo.findByBBox(bbox);
  }

  async getEventsNearGeometry(geometry: any, distanceMeters?: number) {
    return this.eventRepo.findNearGeometry(geometry, distanceMeters);
  }
}
