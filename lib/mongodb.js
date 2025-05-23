import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import dns from 'dns';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Try to load .env.local first, then fall back to .env
const envLocalPath = join(rootDir, '.env.local');
const envPath = join(rootDir, '.env');

if (existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
} else if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MONGODB_URI environment variable to .env.local');
}

// Convert MongoDB URI from SRV to direct connection format if needed
let uri = process.env.MONGODB_URI;
if (uri.includes('mongodb+srv://')) {
    // Replace mongodb+srv:// with mongodb://
    uri = uri.replace('mongodb+srv://', 'mongodb://');
    // Remove any query parameters that might cause issues
    uri = uri.split('?')[0];
    // Add the cluster nodes directly
    uri = uri.replace('cluster0.5tuomhp.mongodb.net', 'cluster0-shard-00-00.5tuomhp.mongodb.net:27017,cluster0-shard-00-01.5tuomhp.mongodb.net:27017,cluster0-shard-00-02.5tuomhp.mongodb.net:27017');
    // Add back the database name and options
    uri = `${uri}/?ssl=true&replicaSet=atlas-14b8sh-shard-0&authSource=admin&retryWrites=true&w=majority`;
}

// Configure DNS resolution
dns.setServers(['8.8.8.8', '8.8.4.4']); // Use Google's DNS servers

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 10000,
    ssl: true,
};

let client;
let clientPromise;

async function connectWithRetry() {
    try {
        console.log('Attempting to connect to MongoDB...');
        client = new MongoClient(uri, options);
        await client.connect();
        console.log('Successfully connected to MongoDB.');
        return client;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        if (error.code === 'ENOTFOUND') {
            console.error('DNS resolution failed. Please check your network connection and DNS settings.');
        }
        throw error;
    }
}

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
        global._mongoClientPromise = connectWithRetry();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable.
    clientPromise = connectWithRetry();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;