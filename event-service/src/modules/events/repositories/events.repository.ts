import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoadEvent } from '../entities/road-event.entity';

@Injectable()
export class EventsRepository {
  constructor(
    @InjectRepository(RoadEvent)
    private readonly repo: Repository<RoadEvent>,
  ) {}

  async createEvent(data: {
    lat: number;
    lng: number;
    severity: number;
    type: string;
    description?: string;
    expiresAt: Date;
  }) {
    const location = {
      type: 'Point',
      coordinates: [data.lng, data.lat],
    };
    const event = this.repo.create({
      location: location as any,
      severity: data.severity,
      type: data.type,
      description: data.description,
      expiresAt: data.expiresAt,
    });
    return this.repo.save(event);
  }

  async findExpired() {
    return this.repo
      .createQueryBuilder('event')
      .where('event.expiresAt < NOW()')
      .getMany();
  }

  async save(event: RoadEvent) {
    return this.repo.save(event);
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findAllFiltered(filters?: { type?: string; hoursAgo?: number }) {
    let query = this.repo.createQueryBuilder('event')
      .where('event.expiresAt > NOW()')
      .orderBy('event.severity', 'DESC')
      .addOrderBy('event.createdAt', 'DESC');

    if (filters?.type) {
      query = query.andWhere('event.type = :type', { type: filters.type });
    }

    if (filters?.hoursAgo) {
      query = query.andWhere('event.createdAt > NOW() - INTERVAL :hours HOUR', { 
        hours: filters.hoursAgo 
      });
    }

    return query.getMany();
  }

  async deleteMany(ids: string[]) {
    return this.repo.delete(ids);
  }

  async findByBBox(bbox: { north: number; south: number; east: number; west: number }) {
    return this.repo
      .createQueryBuilder('event')
      .where(
        `ST_Within(
          event.location::geometry,
          ST_MakeEnvelope(:west, :south, :east, :north, 4326)
        )`,
        {
          west: bbox.west,
          south: bbox.south,
          east: bbox.east,
          north: bbox.north,
        },
      )
      .andWhere('event.expiresAt > NOW()')
      .getMany();
  }

  async findNearGeometry(geometry: any, distanceMeters: number = 200) {
    return this.repo
      .createQueryBuilder('event')
      .where(
        `ST_DWithin(
          event.location,
          ST_SetSRID(ST_GeomFromGeoJSON(:geom), 4326)::geography,
          :distance
        )`,
        {
          geom: JSON.stringify(geometry),
          distance: distanceMeters,
        },
      )
      .andWhere('event.expiresAt > NOW()')
      .getMany();
  }
}
