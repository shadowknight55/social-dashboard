import clientPromise from '@/app/lib/mongodb';

export async function DELETE(request, { params }) {
  try {
    const { platform } = params;
    const client = await clientPromise;
    const db = client.db('social_dashboard');
    
    // Remove from social_stats collection
    const socialStatsCollection = db.collection('social_stats');
    await socialStatsCollection.deleteMany({ 
      platform: platform 
    });

    // Remove from analytics_stats collection
    const analyticsStatsCollection = db.collection('analytics_stats');
    await analyticsStatsCollection.deleteMany({ 
      platform: platform 
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting platform stats:', error);
    return Response.json({ error: 'Failed to delete platform stats' }, { status: 500 });
  }
} 