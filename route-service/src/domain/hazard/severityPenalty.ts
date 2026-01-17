export function severityPenalty(severity: number): number {
  switch (severity) {
    case 1:
      return 1.1;
    case 2:
      return 1.25;
    case 3:
      return 1.5;
    case 4:
      return 2.0;
    case 5:
      return Number.POSITIVE_INFINITY; // handled specially
    default:
      throw new Error(`Invalid severity: ${severity}`);
  }
}
