import { AdjacencyList, GraphEdge, NodeId, EdgeId } from "./GraphTypes";

export class Graph {
  private adjacencyList: AdjacencyList = new Map();
  private edgeMap: Map<EdgeId, GraphEdge> = new Map();

  addEdge(
    source: NodeId,
    target: NodeId,
    edge: GraphEdge
  ) {
    if (!this.adjacencyList.has(source)) {
      this.adjacencyList.set(source, []);
    }

    this.adjacencyList.get(source)!.push(edge);
    this.edgeMap.set(edge.edgeId, edge);
  }

  getNeighbors(node: NodeId): GraphEdge[] {
    return this.adjacencyList.get(node) || [];
  }

  updateEdgeCost(edgeId: EdgeId, newCost: number) {
    const edge = this.edgeMap.get(edgeId);
    if (edge) {
      edge.cost = newCost;
    }
  }

  deactivateEdge(edgeId: EdgeId) {
    const edge = this.edgeMap.get(edgeId);
    if (edge) {
      edge.isActive = false;
      edge.cost = Number.POSITIVE_INFINITY;
    }
  }

  updateEdgeCosts(edgeIds: EdgeId[], penalty: number) {
    for (const id of edgeIds) {
      const edge = this.edgeMap.get(id);
      if (edge && edge.isActive) {
        edge.cost = edge.cost * penalty; // Assuming cost is current_cost from load
      }
    }
  }

  deactivateEdges(edgeIds: EdgeId[]) {
    for (const id of edgeIds) {
      this.deactivateEdge(id);
    }
  }

  activateEdge(edgeId: EdgeId, baseCost: number) {
    const edge = this.edgeMap.get(edgeId);
    if (edge) {
      edge.isActive = true;
      edge.cost = baseCost;
    }
  }

  getGraph(): AdjacencyList {
    return this.adjacencyList;
  }

  findPath(startNode: NodeId, endNode: NodeId): EdgeId[] | null {
    const distances = new Map<NodeId, number>();
    const previous = new Map<NodeId, { edgeId: EdgeId; fromNode: NodeId }>();
    const nodes = new Set<NodeId>();

    // Initialize
    for (const [nodeId] of this.adjacencyList) {
      distances.set(nodeId, Number.POSITIVE_INFINITY);
      nodes.add(nodeId);
    }
    
    if (!nodes.has(startNode) || !nodes.has(endNode)) return null;
    
    distances.set(startNode, 0);

    while (nodes.size > 0) {
      // Find node with smallest distance
      let closestNode: NodeId | null = null;
      for (const node of nodes) {
        if (closestNode === null || (distances.get(node) ?? Infinity) < (distances.get(closestNode) ?? Infinity)) {
          closestNode = node;
        }
      }

      if (closestNode === null || distances.get(closestNode) === Number.POSITIVE_INFINITY) break;
      if (closestNode === endNode) break;

      nodes.delete(closestNode);

      const neighbors = this.getNeighbors(closestNode);
      for (const edge of neighbors) {
        if (!edge.isActive) continue;

        const alt = distances.get(closestNode)! + edge.cost;
        if (alt < (distances.get(edge.targetNode) ?? Infinity)) {
          distances.set(edge.targetNode, alt);
          previous.set(edge.targetNode, { edgeId: edge.edgeId, fromNode: closestNode });
        }
      }
    }

    // Reconstruct path
    const path: EdgeId[] = [];
    let curr = endNode;
    while (previous.has(curr)) {
      const prev = previous.get(curr)!;
      path.unshift(prev.edgeId);
      curr = prev.fromNode;
    }

    return path.length > 0 ? path : null;
  }
}
