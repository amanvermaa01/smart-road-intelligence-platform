import { withTransaction } from "../db";
import { HazardImpactRepository } from "../repositories/hazardImpact.repository";
import { severityPenalty } from "../domain/hazard/severityPenalty";
import { graphManager } from "../graph/graphManager";

export async function processHazardImpact(
  hazard: {
    id: string;
    severity: number;
    lat: number;
    lng: number;
    type: string;
  }
) {
  const penalty = severityPenalty(hazard.severity);
  const radius_m = 100; // Default radius for impact
  const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 min default expiry

  await withTransaction(async (client) => {
    // 1. Persist hazard state
    await HazardImpactRepository.upsertHazard(client, {
      id: hazard.id,
      severity: hazard.severity,
      lat: hazard.lat,
      lng: hazard.lng,
      radius_m,
      active: true,
      expires_at,
    });

    // 2. Identify and apply impact to edges
    const affectedEdges =
      await HazardImpactRepository.findAffectedEdges(client, hazard.id);

    if (hazard.severity === 5) {
      // Rule: severity 5 blocks roads
      await HazardImpactRepository.deactivateEdges(
        client,
        affectedEdges
      );

      // In-memory graph mutation
      graphManager.deactivateEdges(affectedEdges);
      return;
    }

    await HazardImpactRepository.applyPenalty(
      client,
      affectedEdges,
      penalty
    );

    // Sync in-memory graph
    graphManager.updateEdgeCosts(
      affectedEdges,
      penalty
    );
  });
}
