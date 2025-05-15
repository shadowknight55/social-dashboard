import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

export async function POST(request) {
  let client;
  try {
    // Create a modified request object for getServerSession
    const url = new URL(request.url);
    const modifiedReq = {
      ...request,
      query: {
        nextauth: ['session']
      }
    };

    const session = await getServerSession(modifiedReq, authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    client = await connectToDatabase();
    const db = client.db('social_dashboard');
    const usersCollection = db.collection('users');

    // Get the user
    const user = await usersCollection.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const result = await usersCollection.updateOne(
      { email: session.user.email },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 