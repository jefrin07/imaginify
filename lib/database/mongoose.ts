import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URI;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Extend the global object to include mongoose caching
declare global {
  var mongoose: MongooseConnection | undefined;
}

let cached: MongooseConnection = global.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
  if (cached.conn) {
    console.log('Already connected to MongoDB.');
    return cached.conn;
  }

  if (!MONGODB_URL) throw new Error('Missing MONGODB_URL');

  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URL, {
      dbName: 'imaginify',
      bufferCommands: false,
    });

  cached.conn = await cached.promise;

  console.log('Connected to MongoDB:', mongoose.connection.readyState === 1 ? '✅' : '❌');
  
  return cached.conn;
};

// Function to check connection status
export const checkConnectionStatus = () => {
  const status = mongoose.connection.readyState;
  const statusMessages: Record<number, string> = {
    0: 'Disconnected ❌',
    1: 'Connected ✅',
    2: 'Connecting ⏳',
    3: 'Disconnecting 🔄',
  };

  console.log('MongoDB Connection Status:', statusMessages[status] || 'Unknown');
};
