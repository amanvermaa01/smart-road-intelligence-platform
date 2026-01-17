export function bucketToCoordinate(bucket: number): number {
  return bucket / 100;
}

export function bucketToCellCenter(bucket: number): number {
  // If bucket is floor(lat * 100), center = +0.005
  return bucket / 100 + 0.005;
}
