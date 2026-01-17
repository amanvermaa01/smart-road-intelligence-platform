import { Module } from '@nestjs/common';
import { RouteModule } from './route/route.module';
import { DbModule } from './db/db.module';
import { GraphModule } from './core/graph.module';

@Module({
  imports: [DbModule, GraphModule, RouteModule],
})
export class AppModule {}
