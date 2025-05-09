import { MongoClient } from 'mongodb';

export async function DELETE(request, { params }) {
  let client;
  try {
    const { platform } = params;
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    client = await MongoClient.connect(uri);
    const db = client.db('social_dashboard');
    
    // Remove from social_stats collection
    const socialStatsCollection = db.collection('social_stats');
    await socialStatsCollection.deleteMany({ 
      platform: platform 
    });

    // Remove from analytics_stats collection
    const analyticsStatsCollection = db.collection('analytics_stats');
    await analyticsStatsCollection.deleteMany({ 
      platform: platform 
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting platform stats:', error);
    return Response.json({ error: 'Failed to delete platform stats' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 