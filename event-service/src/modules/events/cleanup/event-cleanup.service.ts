import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RoadEvent } from "../entities/road-event.entity";
import { RedisService } from "../../../redis/redis.service";
import { REDIS_EVENT_CHANNEL } from "../constants/redis.constants";

@Injectable()
export class EventCleanupService {
  private readonly logger = new Logger(EventCleanupService.name);

  constructor(
    @InjectRepository(RoadEvent)
    private readonly eventRepo: Repository<RoadEvent>,
    private readonly redisService: RedisService,
  ) {}

  @Cron("*/5 * * * *") // Every 5 minutes
  async cleanupExpiredEvents() {
    this.logger.log("Running expired event cleanup job");

    const expiredEvents = await this.eventRepo
      .createQueryBuilder("event")
      .where("event.expiresAt < NOW()")
      .select(["event.id"])
      .getMany();

    if (expiredEvents.length === 0) {
      return;
    }

    const client = this.redisService.getClient();

    for (const event of expiredEvents) {
      // Assuming a GEO index named 'road_events'
      await client.zrem('road_events:geo', event.id);
      // Notify clients to remove the marker
      await client.publish(REDIS_EVENT_CHANNEL, JSON.stringify({
        id: event.id,
        type: 'expired'
      }));
    }

    await this.eventRepo.delete(
      expiredEvents.map((e) => e.id),
    );

    this.logger.log(
      `Cleaned ${expiredEvents.length} expired road events`,
    );
  }
}
