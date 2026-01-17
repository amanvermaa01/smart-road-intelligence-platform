export type NodeId = number;
export type EdgeId = string;

export interface GraphEdge {
  edgeId: EdgeId;
  targetNode: NodeId;
  cost: number;
  isActive: boolean;
}

export type AdjacencyList = Map<NodeId, GraphEdge[]>;
