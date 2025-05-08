import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('social_dashboard');
    const collection = db.collection('social_stats');

    // Get all settings from the database
    const settings = await collection.find({ type: 'settings' }).toArray();
    
    client.close();
    return Response.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return Response.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
} 