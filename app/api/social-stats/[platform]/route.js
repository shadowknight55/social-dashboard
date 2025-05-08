import { MongoClient } from 'mongodb';

export async function DELETE(request, { params }) {
  try {
    const { platform } = params;
    const client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('social_dashboard');
    const collection = db.collection('social_stats');

    // Remove platform stats
    await collection.deleteMany({ 
      type: 'platform_stats',
      platform: platform 
    });

    client.close();
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting platform stats:', error);
    return Response.json({ error: 'Failed to delete platform stats' }, { status: 500 });
  }
} 