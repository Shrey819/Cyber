import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;
let memoryServer = null;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vortex_cybersecurity';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'vortex_cybersecurity';

/**
 * Centralized MongoDB Connection Utility
 * Implements connection pooling, connection reuse, and automatic local/memory fallback.
 */
export async function connectDb() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const clientOptions = {
    dbName: MONGODB_DB_NAME,
    maxPoolSize: 25,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 45000,
    autoIndex: true
  };

  try {
    const maskedUri = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`🔗 Connecting to MongoDB at ${maskedUri}...`);
    await mongoose.connect(MONGODB_URI, clientOptions);
    isConnected = true;
    console.log(`✅ Connected to MongoDB database: ${mongoose.connection.name}`);
    return mongoose.connection;
  } catch (primaryErr) {
    console.warn(`⚠️ Primary MongoDB instance unavailable (${primaryErr.message}).`);

    // Check if we already have an in-memory instance running
    if (memoryServer) {
      const uri = memoryServer.getUri();
      await mongoose.connect(uri, clientOptions);
      isConnected = true;
      console.log(`✅ Connected to existing In-Memory MongoDB at ${uri}`);
      return mongoose.connection;
    }

    try {
      console.log('🔄 Initializing embedded In-Memory MongoDB instance for development & testing...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: MONGODB_DB_NAME
        }
      });
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri, clientOptions);
      isConnected = true;
      console.log(`✅ Connected to In-Memory MongoDB instance at ${memoryUri} (DB: ${MONGODB_DB_NAME})`);
      return mongoose.connection;
    } catch (fallbackErr) {
      console.error('❌ Failed to initialize MongoDB connection:', fallbackErr);
      throw primaryErr;
    }
  }
}

export async function disconnectDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('ℹ️ MongoDB connection closed.');
});

mongoose.connection.on('error', (err) => {
  if (isConnected) {
    console.error('❌ MongoDB runtime connection error:', err);
  }
});

export { mongoose };
export default connectDb;
