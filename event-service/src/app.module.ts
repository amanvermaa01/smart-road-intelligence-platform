import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { EventsModule } from './modules/events/events.module';
import { KafkaModule } from './kafka/kafka.module';
import { RedisModule } from './redis/redis.module';
import { CleanupModule } from './modules/events/cleanup/cleanup.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    KafkaModule,
    RedisModule,
    EventsModule,
    CleanupModule,
  ],
})
export class AppModule {}
