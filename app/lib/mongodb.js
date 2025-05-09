import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const uri = process.env.MONGODB_URI;

export async function connectToDatabase() {
  const client = new MongoClient(uri);
  await client.connect();
  return client;
} 