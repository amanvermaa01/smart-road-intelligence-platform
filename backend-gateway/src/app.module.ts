import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from './graphql/graphql.module';
import { RedisModule } from './redis/redis.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    GraphQLModule,
    RedisModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
