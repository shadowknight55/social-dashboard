import { connectToDatabase } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  let client;
  try {
    client = await connectToDatabase();
    const db = client.db('social_dashboard');
    const collection = db.collection('settings');

    // Get all settings from the database
    const settings = await collection.find({}).toArray();
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function POST(request) {
  let client;
  try {
    const data = await request.json();
    client = await connectToDatabase();
    const db = client.db('social_dashboard');
    const collection = db.collection('settings');

    // Update settings
    await collection.updateOne(
      { userId: data.userId },
      { $set: data },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 