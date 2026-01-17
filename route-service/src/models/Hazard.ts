export interface Hazard {
  id: string;

  severity: 1 | 2 | 3 | 4 | 5;

  geomWKT: string;

  radiusM: number;

  active: boolean;

  expiresAt: Date;
}
