"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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

export default function PlatformAnalytics() {
  const params = useParams();
  const platform = params.platform;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
    maintainAspectRatio: false,
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

  const getChartData = (stats) => {
    const metrics = {
      followers: stats.followers || 0,
      views: stats.views || 0,
      likes: stats.likes || 0,
      shares: stats.shares || 0
    };

    return {
      labels: ['Followers', 'Views', 'Likes', 'Shares'],
      datasets: [{
        label: 'Platform Metrics',
        data: Object.values(metrics),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }]
    };
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
  const overviewData = getChartData(stats);

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
            <h3 className="text-xl font-semibold mb-4">Audience Metrics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Followers</p>
                <p className="text-2xl font-bold text-purple-400">{stats.followers.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Views</p>
                <p className="text-2xl font-bold text-blue-400">{stats.views.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Engagement Rate</p>
                <p className="text-2xl font-bold text-green-400">
                  {((stats.likes + stats.shares) / stats.followers * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4">Engagement Metrics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Likes</p>
                <p className="text-2xl font-bold text-pink-400">{stats.likes.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Shares</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.shares.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Views per Follower</p>
                <p className="text-2xl font-bold text-indigo-400">
                  {(stats.views / stats.followers).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 