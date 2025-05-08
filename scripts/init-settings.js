import { MongoClient } from 'mongodb';

async function initSettings() {
  try {
    // Use a direct connection string - replace with your actual MongoDB connection string
    const uri = 'mongodb://localhost:27017';
    const client = await MongoClient.connect(uri);
    const db = client.db('social_dashboard');
    
    // Create settings collection
    const settingsCollection = db.collection('settings');
    
    // Create indexes
    await settingsCollection.createIndex({ userId: 1 }, { unique: true });
    
    console.log('Settings collection initialized successfully');
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error initializing settings collection:', error);
    process.exit(1);
  }
}

initSettings(); 