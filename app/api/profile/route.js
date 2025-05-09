import { getServerSession } from 'next-auth';
import { GET as authHandler } from '../auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

const handler = {
  async GET(request) {
    let client;
    try {
      const session = await getServerSession(authHandler);
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      client = await connectToDatabase();
      const db = client.db('social_dashboard');
      const usersCollection = db.collection('users');

      const user = await usersCollection.findOne(
        { email: session.user.email },
        { projection: { password: 0 } }
      );

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    } finally {
      if (client) {
        await client.close();
      }
    }
  },

  async POST(request) {
    let client;
    try {
      const session = await getServerSession(authHandler);
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const updates = await request.json();
      if (!updates || Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
      }

      // Remove any sensitive fields from updates
      delete updates.password;
      delete updates.email;

      client = await connectToDatabase();
      const db = client.db('social_dashboard');
      const usersCollection = db.collection('users');

      const result = await usersCollection.updateOne(
        { email: session.user.email },
        { $set: updates }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    } finally {
      if (client) {
        await client.close();
      }
    }
  }
};

export const GET = handler.GET;
export const POST = handler.POST; 