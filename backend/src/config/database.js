import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';
const host = process.env.POSTGRES_HOST || 'localhost';

const pool = new Pool({
  host: host,
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER || 'bloguser',
  password: process.env.POSTGRES_PASSWORD || 'blogpassword',
  database: process.env.POSTGRES_DB || 'blogdb',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Enable SSL for production connections (required by AWS RDS)
  ssl: isProduction && host !== 'localhost' ? { rejectUnauthorized: false } : false,
});

// Test connection
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
