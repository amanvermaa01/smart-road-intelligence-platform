import { Module, Global } from '@nestjs/common';
import { pgPool } from '../db';
import { RoadEdgeRepository } from '../repositories/roadEdge.repository';
import { HazardRepository } from '../repositories/hazard.repository';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useValue: pgPool,
    },
    {
      provide: RoadEdgeRepository,
      useFactory: (pool) => new RoadEdgeRepository(pool),
      inject: ['DATABASE_POOL'],
    },
    {
      provide: HazardRepository,
      useFactory: (pool) => new HazardRepository(pool),
      inject: ['DATABASE_POOL'],
    },
  ],
  exports: [RoadEdgeRepository, HazardRepository, 'DATABASE_POOL'],
})
export class DbModule {}
