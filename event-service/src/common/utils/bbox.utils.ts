import { BoundingBox } from "../interfaces/bbox.interface";

export function isInsideBBox(
  event: { lat: number; lng: number },
  bbox: BoundingBox
): boolean {
  return (
    event.lat <= bbox.north &&
    event.lat >= bbox.south &&
    event.lng <= bbox.east &&
    event.lng >= bbox.west
  );
}
