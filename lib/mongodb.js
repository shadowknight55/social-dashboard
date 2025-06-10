import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('CRITICAL: MONGODB_URI is not defined in the Vercel environment.');
}

console.log(`[DB] Attempting to connect to MongoDB. URI starts with: ${uri.substring(0, 20)}...`);

const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
};

const client = new MongoClient(uri, options);
const clientPromise = client.connect();

// Add a catch block to the promise to log any connection errors during the build
clientPromise.catch(err => {
    console.error(`[DB] MongoDB connection promise rejected. This is the root cause.`, err);
    console.error(`[DB] Check: 1. Is your NEW password correct in Vercel? 2. Are special characters in the password URL-encoded? 3. Is the database name correct? 4. Is your IP Access List set to 0.0.0.0/0?`);
});

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;