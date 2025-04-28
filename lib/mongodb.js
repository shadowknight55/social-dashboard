import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MONGODB_URI environment variable');
}

client = new MongoClient(uri, options);
clientPromise = client.connect();
export default clientPromise;