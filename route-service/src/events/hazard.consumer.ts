import { processHazardImpact } from "../services/hazardImpact.service";

export async function onHazardUpdated(event: {
  hazardId: string;
  severity: number;
  lat: number;
  lng: number;
  type: string;
}) {
  await processHazardImpact({
    id: event.hazardId,
    severity: event.severity,
    lat: event.lat,
    lng: event.lng,
    type: event.type,
  });
}
