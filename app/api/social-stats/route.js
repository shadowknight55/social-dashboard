import { MongoClient } from 'mongodb';

const generateRandomStats = (platform) => {
  return {
    followers: Math.floor(Math.random() * 1000000),
    subscribers: Math.floor(Math.random() * 500000),
    views: Math.floor(Math.random() * 10000000),
    likes: Math.floor(Math.random() * 2000000),
    shares: Math.floor(Math.random() * 100000)
  };
};

export async function GET(request) {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('social_dashboard');
    const collection = db.collection('social_stats');

    // Get the requested platforms from the URL
    const { searchParams } = new URL(request.url);
    const requestedPlatforms = searchParams.get('platforms')?.split(',') || [];

    // Get active platforms from settings
    const settings = await collection.findOne({ type: 'settings' }) || {};
    const activeCharts = [...new Set([...settings.activeCharts || ['youtube', 'twitch'], ...requestedPlatforms])];

    // Generate random stats for all active platforms
    const stats = {};
    activeCharts.forEach(platform => {
      if (platform) {  // Only generate stats if platform is not empty
        stats[platform] = generateRandomStats(platform);
      }
    });

    client.close();
    return Response.json(stats);
  } catch (error) {
    console.error('Error fetching social stats:', error);
    return Response.json({ error: 'Failed to fetch social stats' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('social_dashboard');
    const collection = db.collection('social_stats');

    if (data.type === 'settings') {
      // Update settings
      await collection.updateOne(
        { type: 'settings' },
        { $set: data },
        { upsert: true }
      );
    } else {
      // Update platform stats
      for (const [platform, stats] of Object.entries(data)) {
        await collection.updateOne(
          { platform },
          { $set: { platform, stats } },
          { upsert: true }
        );
      }
    }

    client.close();
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating stats:', error);
    return Response.json({ error: 'Failed to update stats' }, { status: 500 });
  }
} 