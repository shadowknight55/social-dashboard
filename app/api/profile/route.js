import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

async function GET(request) {
  let client;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    client = await connectToDatabase();
    const db = client.db('social_dashboard');
    const user = await db.collection('users').findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only return safe fields
    const { profilePicture, notifications, emailUpdates, email } = user;
    return NextResponse.json({ profilePicture, notifications, emailUpdates, email });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function POST(request) {
  let client;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { profilePicture, notifications, emailUpdates } = body;

    client = await connectToDatabase();
    const db = client.db('social_dashboard');

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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { email, profilePicture: pic, notifications: notif, emailUpdates: emails } = result.value;
    return NextResponse.json({ email, profilePicture: pic, notifications: notif, emailUpdates: emails });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export { GET, POST }; 