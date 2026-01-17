import { GraphLoader } from "../graph/GraphLoader";
import { Graph } from "../graph/Graph";

let graphInstance: Graph;

export async function loadGraphAtStartup() {
  graphInstance = await GraphLoader.load();
  console.log("[Graph] Loaded into memory");
}

export function getGraph(): Graph {
  if (!graphInstance) {
    throw new Error("Graph not initialized");
  }
  return graphInstance;
}
