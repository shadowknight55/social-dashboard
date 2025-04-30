import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

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

const uri = process.env.MONGODB_URI;
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MONGODB_URI environment variable to .env.local');
}

client = new MongoClient(uri, options);
clientPromise = client.connect().then(client => {
    return client.db('social_dashboard');
});

export default clientPromise;