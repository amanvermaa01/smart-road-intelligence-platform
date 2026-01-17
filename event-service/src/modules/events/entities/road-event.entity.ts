import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'road_events' })
export class RoadEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Stored as PostGIS geography POINT(lng lat)
   * Example: 'POINT(77.2167 28.6448)'
   */
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: false,
  })
  location: any;

  @Column({ type: 'int' })
  severity: number;

  @Column({ type: 'int', default: 0 })
  upvotes: number;

  @Column({ type: 'int', default: 0 })
  downvotes: number;

  @Column({ type: 'text' })
  type: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
