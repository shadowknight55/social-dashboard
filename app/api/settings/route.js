import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('social_dashboard');
    const collection = db.collection('settings');

    // Get all settings from the database
    const settings = await collection.find({}).toArray();
    
    client.close();
    return Response.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return Response.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('social_dashboard');
    const collection = db.collection('settings');

    // Update settings
    await collection.updateOne(
      { userId: data.userId },
      { $set: data },
      { upsert: true }
    );

    client.close();
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return Response.json({ error: 'Failed to update settings' }, { status: 500 });
  }
} 