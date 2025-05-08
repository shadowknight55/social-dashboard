import { MongoClient } from 'mongodb';

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

const getInitialStats = (platform) => {
  // Base stats for each platform
  const stats = {
    youtube: {
      followers: 100000,
      views: 500000,
      likes: 50000,
      shares: 10000
    },
    twitch: {
      followers: 50000,
      views: 200000,
      likes: 25000,
      shares: 5000
    },
    snapchat: {
      followers: 75000,
      views: 300000,
      likes: 35000,
      shares: 7500
    }
  };

  return stats[platform] || stats.youtube;
};

async function initializeDatabase() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    console.log('Connecting to MongoDB...');
    const client = await MongoClient.connect(uri);
    const db = client.db('social_dashboard');
    
    // Create collections if they don't exist
    await db.createCollection('social_stats');
    await db.createCollection('settings');
    await db.createCollection('analytics_stats');
    
    // Clear existing data in analytics_stats
    await db.collection('analytics_stats').deleteMany({});
    
    // Generate data for the last year
    const platforms = ['youtube', 'twitch', 'snapchat'];
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - 1); // Go back 1 year
    
    const analyticsData = [];
    
    for (const platform of platforms) {
      const baseStats = getInitialStats(platform);
      console.log(`Generating analytics data for ${platform}...`);
      
      // Generate daily data points
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        analyticsData.push({
          platform,
          date: new Date(d),
          stats: generateTrendingStats(platform, new Date(d), baseStats),
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    console.log(`Inserting ${analyticsData.length} analytics records...`);
    await db.collection('analytics_stats').insertMany(analyticsData);
    
    // Create indexes for better query performance
    await db.collection('analytics_stats').createIndex({ platform: 1, date: -1 });
    await db.collection('analytics_stats').createIndex({ date: -1 });
    
    console.log('Database initialized successfully');
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase(); 