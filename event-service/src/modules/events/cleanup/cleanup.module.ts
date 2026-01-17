import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventCleanupService } from "./event-cleanup.service";
import { RoadEvent } from "../entities/road-event.entity";
import { RedisModule } from "../../../redis/redis.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([RoadEvent]),
    RedisModule,
  ],
  providers: [EventCleanupService],
})
export class CleanupModule {}
