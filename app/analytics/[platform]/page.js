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
  const [dateRange, setDateRange] = useState('30days');
  const [exportData, setExportData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics?platform=${platform}&range=${dateRange}`);
        const data = await response.json();
        
        if (data.error) {
          console.error('API Error:', data.error);
          setStats(null);
          setLoading(false);
          return;
        }

        setStats(data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(null);
        setLoading(false);
      }
    };

    fetchStats();
  }, [platform, dateRange]);

  const handleExport = async () => {
    if (!stats) return;

    try {
      const exportData = {
        platform,
        dateRange,
        exportDate: new Date().toISOString(),
        data: stats.map(entry => ({
          date: entry.date,
          ...entry.stats
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${platform}_analytics_${dateRange}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      await new Promise(resolve => {
        a.click();
        resolve();
      });
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

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
    console.log('Getting chart data for stats:', stats);
    if (!stats || !Array.isArray(stats)) {
      console.log('Invalid stats data:', stats);
      return null;
    }

    const dates = stats.map(entry => new Date(entry.date).toLocaleDateString());
    console.log('Dates:', dates);
    
    const metrics = {
      followers: stats.map(entry => entry.stats.followers),
      views: stats.map(entry => entry.stats.views),
      likes: stats.map(entry => entry.stats.likes),
      shares: stats.map(entry => entry.stats.shares)
    };
    console.log('Metrics:', metrics);

    return {
      labels: dates,
      datasets: [
        {
          label: 'Followers',
          data: metrics.followers,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.4
        },
        {
          label: 'Views',
          data: metrics.views,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          tension: 0.4
        },
        {
          label: 'Likes',
          data: metrics.likes,
          borderColor: 'rgba(255, 206, 86, 1)',
          backgroundColor: 'rgba(255, 206, 86, 0.5)',
          tension: 0.4
        },
        {
          label: 'Shares',
          data: metrics.shares,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.4
        }
      ]
    };
  };

  const getLatestStats = () => {
    if (!stats || !Array.isArray(stats) || stats.length === 0) return null;
    return stats[stats.length - 1].stats;
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

  const latestStats = getLatestStats();
  const chartData = getChartData(stats);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {platform.charAt(0).toUpperCase() + platform.slice(1)} Analytics
          </h1>
          <div className="flex gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-black/30 text-white border border-purple-500 rounded-lg px-4 py-2"
            >
              <option value="1day">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
            <button
              onClick={handleExport}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export Data
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-2">Total Followers</h3>
            <p className="text-3xl font-bold text-purple-400">{latestStats?.followers.toLocaleString()}</p>
          </div>
          <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-2">Total Views</h3>
            <p className="text-3xl font-bold text-blue-400">{latestStats?.views.toLocaleString()}</p>
          </div>
          <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-2">Engagement Rate</h3>
            <p className="text-3xl font-bold text-green-400">
              {((latestStats?.likes + latestStats?.shares) / latestStats?.views * 100).toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm mb-8">
          <div className="h-[400px]">
            <Line options={chartOptions} data={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
} 