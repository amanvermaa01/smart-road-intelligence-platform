import { Module, Global } from '@nestjs/common';
import { Graph } from '../core/Graph';
import { GraphSyncService } from '../services/graphSync.service';
import { RoadEdgeRepository } from '../repositories/roadEdge.repository';

@Global()
@Module({
  providers: [
    {
      provide: Graph,
      useValue: new Graph(),
    },
    {
      provide: GraphSyncService,
      useFactory: (repo: RoadEdgeRepository, graph: Graph) => new GraphSyncService(repo, graph),
      inject: [RoadEdgeRepository, Graph],
    },
  ],
  exports: [Graph, GraphSyncService],
})
export class GraphModule {}
