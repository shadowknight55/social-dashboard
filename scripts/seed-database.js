import clientPromise from '../lib/mongodb.js';

async function initDB() {
  try {
    const db = await clientPromise;

    // Initial dummy data
    const initialStats = {
      youtube: {
        subscribers: 1200,
        views: 5000,
        videos: 50
      },
      twitch: {
        followers: 2000,
        subscribers: 500,
        views: 10000
      },
      timestamp: new Date()
    };

    // Insert initial data
    await db.collection('socialStats').insertOne(initialStats);
    console.log('Database initialized with dummy data');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDB(); 