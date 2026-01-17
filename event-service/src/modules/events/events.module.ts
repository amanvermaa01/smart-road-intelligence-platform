import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoadEvent } from './entities/road-event.entity';
import { EventsService } from './services/events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './repositories/events.repository';
import { RedisModule } from '../../redis/redis.module';
import { EventsGateway } from './gateway/events.gateway';
import { RedisSubscriberService } from './gateway/redis-subscriber.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoadEvent]),
    RedisModule,
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    EventsRepository,
    EventsGateway,
    RedisSubscriberService,
  ],
  exports: [EventsGateway],
})
export class EventsModule {}
