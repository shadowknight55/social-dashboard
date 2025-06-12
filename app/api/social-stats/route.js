import { connectToDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

const generateRandomStats = (platform, date) => {
  // Base stats that will be modified based on the date
  const baseStats = {
    followers: Math.floor(Math.random() * 1000000),
    views: Math.floor(Math.random() * 10000000),
    likes: Math.floor(Math.random() * 2000000),
    shares: Math.floor(Math.random() * 100000)
  };

  // Add some variation based on the date
  const dayModifier = new Date(date).getDate() / 30; // 0-1 modifier based on day of month
  return {
    followers: Math.floor(baseStats.followers * (0.8 + dayModifier * 0.4)),
    views: Math.floor(baseStats.views * (0.7 + dayModifier * 0.6)),
    likes: Math.floor(baseStats.likes * (0.9 + dayModifier * 0.2)),
    shares: Math.floor(baseStats.shares * (0.85 + dayModifier * 0.3))
  };
};

const getDateRange = (range) => {
  const end = new Date();
  const start = new Date();

  switch (range) {
    case '1day':
      start.setDate(end.getDate() - 1);
      break;
    case '7days':
      start.setDate(end.getDate() - 7);
      break;
    case '30days':
      start.setDate(end.getDate() - 30);
      break;
    case '90days':
      start.setDate(end.getDate() - 90);
      break;
    case '1year':
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      start.setDate(end.getDate() - 30); // Default to 30 days
  }

  return { start, end };
};

export async function GET(request) {
  try {
    const client = await connectToDb();
    const db = client.db('social_dashboard');
    const collection = db.collection('social_stats');

    // Get the requested platforms and parameters from the URL
    const { searchParams } = new URL(request.url);
    const requestedPlatforms = searchParams.get('platforms')?.split(',') || [];
    const shouldRefresh = searchParams.get('refresh') === 'true';
    const range = searchParams.get('range') || '30days';

    const { start, end } = getDateRange(range);

    // Get existing stats from database
    const existingStats = await collection.find({ 
      type: 'platform_stats',
      platform: { $in: requestedPlatforms },
      date: { $gte: start, $lte: end }
    }).toArray();

    // Group stats by platform
    const statsMap = existingStats.reduce((acc, stat) => {
      if (!acc[stat.platform]) {
        acc[stat.platform] = [];
      }
      acc[stat.platform].push({
        date: stat.date,
        stats: stat.stats
      });
      return acc;
    }, {});

    // Generate or return stats for each platform
    const stats = {};
    const updates = [];

    for (const platform of requestedPlatforms) {
      if (!platform) continue;

      if (!statsMap[platform] || shouldRefresh) {
        // Generate daily stats for the date range
        const dailyStats = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const newStats = generateRandomStats(platform, d);
          dailyStats.push({
            date: new Date(d),
            stats: newStats
          });
          updates.push({
            updateOne: {
              filter: { platform },
              update: { 
                $set: {
                  platform,
                  stats: newStats,
                  updatedAt: new Date().toISOString()
                }
              },
              upsert: true // Create if doesn't exist
            }
          });
        }
        stats[platform] = dailyStats;
      } else {
        stats[platform] = statsMap[platform];
      }
    }

    // Perform bulk updates if needed
    if (updates.length > 0) {
      await collection.bulkWrite(updates);
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in social-stats API:', error);
    return NextResponse.json({ error: 'Failed to fetch social stats', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const client = await connectToDb();
    const db = client.db('social_dashboard');
    const collection = db.collection('social_stats');

    if (data.platform && data.stats) {
      await collection.updateOne(
        { platform: data.platform },
        { 
          $set: { 
            platform: data.platform,
            stats: data.stats,
            updatedAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating stats:', error);
    return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
  }
} 