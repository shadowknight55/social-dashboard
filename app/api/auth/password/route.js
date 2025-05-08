import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('social_dashboard');
    const usersCollection = db.collection('users');

    // Get the user
    const user = await usersCollection.findOne({ email: session.user.email });
    if (!user) {
      client.close();
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      client.close();
      return Response.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await usersCollection.updateOne(
      { email: session.user.email },
      { $set: { password: hashedPassword } }
    );

    client.close();
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating password:', error);
    return Response.json({ error: 'Failed to update password' }, { status: 500 });
  }
} 