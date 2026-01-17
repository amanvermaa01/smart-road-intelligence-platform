import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config(); // Load local .env

const user = process.env.POSTGRES_USER || 'rip_user';
const password = process.env.POSTGRES_PASSWORD || 'rip_pass';
const database = process.env.POSTGRES_DB || 'rip_db';
let host = process.env.POSTGRES_HOST || 'localhost';
if (host === 'postgres') host = 'localhost';
const port = process.env.POSTGRES_PORT || 5433;

export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgres://${user}:${password}@${host}:${port}/${database}`,
});
