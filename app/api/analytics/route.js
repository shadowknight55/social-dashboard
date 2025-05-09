import { connectToDatabase } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

const generateTrendingStats = (platform, date, baseStats) => {
  // Calculate days from start to determine growth
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1); // Go back 1 year
  const daysSinceStart = Math.max(0, (date - startDate) / (1000 * 60 * 60 * 24));
  
  // Create growth factors based on time periods
  const growthRate = {
    followers: 1.002, // 0.2% daily growth
    views: 1.005,     // 0.5% daily growth
    likes: 1.003,     // 0.3% daily growth
    shares: 1.002     // 0.2% daily growth
  };

  // Add some randomness to make it more realistic
  const randomFactor = () => 0.8 + Math.random() * 0.4; // Random between 0.8 and 1.2

  // Calculate stats with compound growth and daily variation
  return {
    followers: Math.floor(baseStats.followers * Math.pow(growthRate.followers, daysSinceStart) * randomFactor()),
    views: Math.floor(baseStats.views * Math.pow(growthRate.views, daysSinceStart) * randomFactor()),
    likes: Math.floor(baseStats.likes * Math.pow(growthRate.likes, daysSinceStart) * randomFactor()),
    shares: Math.floor(baseStats.shares * Math.pow(growthRate.shares, daysSinceStart) * randomFactor())
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
  let client;
  try {
    client = await connectToDatabase();
    const db = client.db('social_dashboard');
    const collection = db.collection('analytics_stats');

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const range = searchParams.get('range') || '30days';
    const shouldRefresh = searchParams.get('refresh') === 'true';

    if (!platform) {
      return NextResponse.json({ error: 'Platform parameter is required' }, { status: 400 });
    }

    const { start, end } = getDateRange(range);

    // Get analytics data for the specified platform and date range
    const analyticsData = await collection.find({
      platform,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 }).toArray();

    // If refresh is requested or no data exists, update the records
    if (shouldRefresh || analyticsData.length === 0) {
      const baseStats = analyticsData.length > 0 ? analyticsData[0].stats : {
        followers: 100000,
        views: 500000,
        likes: 50000,
        shares: 10000
      };

      const updates = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        updates.push({
          updateOne: {
            filter: {
              platform,
              date: new Date(d)
            },
            update: {
              $set: {
                stats: generateTrendingStats(platform, new Date(d), baseStats),
                updatedAt: new Date().toISOString()
              }
            },
            upsert: true
          }
        });
      }

      // Perform bulk update
      if (updates.length > 0) {
        await collection.bulkWrite(updates);
      }

      // Fetch updated data
      const updatedData = await collection.find({
        platform,
        date: { $gte: start, $lte: end }
      }).sort({ date: 1 }).toArray();

      return NextResponse.json({
        platform,
        range,
        data: updatedData
      });
    }

    return NextResponse.json({
      platform,
      range,
      data: analyticsData
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics data', details: error.message }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 