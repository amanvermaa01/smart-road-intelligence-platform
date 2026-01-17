import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RoadEvent } from '../modules/events/entities/road-event.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'rip_user',
  password: process.env.POSTGRES_PASSWORD || 'rip_pass',
  database: process.env.POSTGRES_DB || 'rip_db',
  entities: [RoadEvent],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: false,
};
