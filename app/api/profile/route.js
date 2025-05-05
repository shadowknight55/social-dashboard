import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';

export async function GET(req) {
  console.time('profile-api-total');
  console.time('get-session');
  const session = await getServerSession(authOptions);
  console.timeEnd('get-session');
  if (!session || !session.user?.email) {
    console.timeEnd('profile-api-total');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  console.time('get-mongo-client');
  const client = await clientPromise;
  console.timeEnd('get-mongo-client');
  const db = client.db();
  console.time('find-user');
  const user = await db.collection('users').findOne({ email: session.user.email });
  console.timeEnd('find-user');
  if (!user) {
    console.timeEnd('profile-api-total');
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }
  // Only return safe fields
  const { profilePicture, notifications, emailUpdates, email } = user;
  console.timeEnd('profile-api-total');
  return new Response(JSON.stringify({ profilePicture, notifications, emailUpdates, email }), { status: 200 });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const body = await req.json();
  const { profilePicture, notifications, emailUpdates } = body;
  const client = await clientPromise;
  const db = client.db();
  const update = {};
  if (profilePicture !== undefined) update.profilePicture = profilePicture;
  if (notifications !== undefined) update.notifications = notifications;
  if (emailUpdates !== undefined) update.emailUpdates = emailUpdates;
  const result = await db.collection('users').findOneAndUpdate(
    { email: session.user.email },
    { $set: update },
    { returnDocument: 'after' }
  );
  if (!result.value) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }
  const { email, profilePicture: pic, notifications: notif, emailUpdates: emails } = result.value;
  return new Response(JSON.stringify({ email, profilePicture: pic, notifications: notif, emailUpdates: emails }), { status: 200 });
} 