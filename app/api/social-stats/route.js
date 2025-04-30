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

    // Get existing stats from database
    const existingStats = await collection.find({ 
      type: 'platform_stats'
    }).toArray();

    // Convert to map for easy lookup
    const statsMap = existingStats.reduce((acc, stat) => {
      acc[stat.platform] = stat.stats;
      return acc;
    }, {});

    // Return stats, generating new ones for missing platforms
    const stats = {};
    const updatesNeeded = [];
    
    activeCharts.forEach(platform => {
      if (platform) {
        // If platform doesn't have stats, generate them
        if (!statsMap[platform]) {
          const newStats = generateRandomStats(platform);
          stats[platform] = newStats;
          // Queue an update to save these stats
          updatesNeeded.push({
            platform,
            stats: newStats
          });
        } else {
          stats[platform] = statsMap[platform];
        }
      }
    });

    // Save any newly generated stats to the database
    if (updatesNeeded.length > 0) {
      await Promise.all(updatesNeeded.map(update => 
        collection.updateOne(
          { type: 'platform_stats', platform: update.platform },
          { 
            $setOnInsert: { 
              type: 'platform_stats',
              platform: update.platform,
              stats: update.stats,
              createdAt: new Date().toISOString()
            }
          },
          { upsert: true }
        )
      ));
    }

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
      // Get current settings to compare
      const currentSettings = await collection.findOne({ type: 'settings' }) || { activeCharts: [] };
      const newPlatforms = data.activeCharts.filter(p => !currentSettings.activeCharts.includes(p));

      // Generate and save stats for new platforms
      for (const platform of newPlatforms) {
        const stats = generateRandomStats(platform);
        await collection.updateOne(
          { type: 'platform_stats', platform },
          { 
            $setOnInsert: { 
              type: 'platform_stats',
              platform,
              stats,
              createdAt: new Date().toISOString()
            }
          },
          { upsert: true }
        );
      }

      // Update settings
      await collection.updateOne(
        { type: 'settings' },
        { $set: data },
        { upsert: true }
      );
    }

    client.close();
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating stats:', error);
    return Response.json({ error: 'Failed to update stats' }, { status: 500 });
  }
} 