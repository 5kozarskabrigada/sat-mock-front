import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();
await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
console.log('✅ UUID extension enabled');
await client.end();
