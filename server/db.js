import { neon, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

// Configure websocket for Node.js environment
neonConfig.webSocketConstructor = ws;

// neon HTTP query function (works through port 443 HTTPS, bypassing ISP port 5432 blocks)
export const sql = neon(process.env.DATABASE_URL);
