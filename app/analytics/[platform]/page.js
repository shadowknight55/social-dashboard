"use client";

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PlatformAnalytics({ params }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const platform = params.platform;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/social-stats?platforms=${platform}`);
        const data = await response.json();
        setStats(data[platform]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [platform]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white',
        },
      },
      title: {
        display: true,
        text: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Analytics`,
        color: 'white',
        font: {
          size: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'white',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'white',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white p-8">
        <div className="container mx-auto">
          <div className="animate-pulse text-center">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white p-8">
        <div className="container mx-auto">
          <div className="text-center text-red-500">Failed to load platform data</div>
        </div>
      </div>
    );
  }

  // Create data for the overview chart
  const overviewData = {
    labels: ['Followers', 'Subscribers', 'Views', 'Likes', 'Shares'],
    datasets: [
      {
        label: 'Current Stats',
        data: [
          stats.followers,
          stats.subscribers,
          stats.views,
          stats.likes,
          stats.shares,
        ],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {platform.charAt(0).toUpperCase() + platform.slice(1)} Analytics
          </h1>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-2">Total Followers</h3>
            <p className="text-3xl font-bold text-purple-400">{stats.followers.toLocaleString()}</p>
          </div>
          <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-2">Total Views</h3>
            <p className="text-3xl font-bold text-blue-400">{stats.views.toLocaleString()}</p>
          </div>
          <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-2">Engagement Rate</h3>
            <p className="text-3xl font-bold text-green-400">
              {((stats.likes + stats.shares) / stats.views * 100).toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm mb-8">
          <div className="h-[400px]">
            <Line options={chartOptions} data={overviewData} />
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4">Engagement Metrics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Likes</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.likes.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Shares</p>
                <p className="text-2xl font-bold text-pink-400">{stats.shares.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4">Audience Metrics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Subscribers</p>
                <p className="text-2xl font-bold text-orange-400">{stats.subscribers.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Views per Subscriber</p>
                <p className="text-2xl font-bold text-indigo-400">
                  {(stats.views / stats.subscribers).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 