import { sql } from './db.js';

async function test() {
  try {
    const res = await sql`SELECT NOW() as now, current_database() as db, version()`;
    console.log('✅ NEON POSTGRESQL CONNECTED SUCCESSFULLY OVER HTTPS/PORT 443:');
    console.log(`Database: ${res[0].db} | Timestamp: ${res[0].now}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection error:', err);
    process.exit(1);
  }
}

test();
