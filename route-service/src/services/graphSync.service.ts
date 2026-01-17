import { RoadEdgeRepository } from "../repositories/roadEdge.repository";
import { Graph } from "../core/Graph";

export class GraphSyncService {
  constructor(
    private readonly repo: RoadEdgeRepository,
    private readonly graph: Graph
  ) {}

  async loadGraph(): Promise<void> {
    const edges = await this.repo.findAllActive();

    for (const edge of edges) {
      this.graph.addEdge({
        id: edge.id,
        from: edge.source,
        to: edge.target,
        cost: edge.currentCost
      });
    }
  }

  updateEdgeCost(edgeId: string, newCost: number) {
    this.graph.updateCost(edgeId, newCost);
  }
}
