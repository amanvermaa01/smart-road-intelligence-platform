export interface Edge {
  id: string;
  from: number;
  to: number;
  cost: number;
}

export class Graph {
  private adjacencyList: Map<number, Edge[]> = new Map();
  private edges: Map<string, Edge> = new Map();

  addEdge(edge: Edge) {
    if (!this.adjacencyList.has(edge.from)) {
      this.adjacencyList.set(edge.from, []);
    }
    this.adjacencyList.get(edge.from)!.push(edge);
    this.edges.set(edge.id, edge);
  }

  updateCost(edgeId: string, newCost: number) {
    const edge = this.edges.get(edgeId);
    if (edge) {
      edge.cost = newCost;
    }
  }

  getNeighbors(node: number): Edge[] {
    return this.adjacencyList.get(node) || [];
  }
}
