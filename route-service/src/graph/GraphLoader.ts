import { pgPool } from "../db";
import { Graph } from "./Graph";
import { GraphEdge } from "./GraphTypes";

export class GraphLoader {
  static async load(): Promise<Graph> {
    const graph = new Graph();

    const query = `
      SELECT
        id,
        source,
        target,
        current_cost,
        is_active
      FROM road_edges
    `;

    const { rows } = await pgPool.query(query);

    for (const row of rows) {
      const edge: GraphEdge = {
        edgeId: row.id,
        targetNode: Number(row.target),
        cost: Number(row.current_cost),
        isActive: row.is_active,
      };

      graph.addEdge(Number(row.source), Number(row.target), edge);
    }

    return graph;
  }
}
