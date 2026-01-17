import { getGraph } from "../bootstrap/loadGraph";

class GraphManager {
  updateEdgeCosts(edgeIds: string[], penalty: number) {
    getGraph().updateEdgeCosts(edgeIds, penalty);
  }

  deactivateEdges(edgeIds: string[]) {
    getGraph().deactivateEdges(edgeIds);
  }

  getInternalGraph() {
    return getGraph();
  }
}

export const graphManager = new GraphManager();
