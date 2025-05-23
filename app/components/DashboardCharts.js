"use client";

import { useState, useEffect, useCallback } from 'react';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { useSession } from 'next-auth/react';

// Register all chart components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const chartOptions = {
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: 'white',
        font: {
          size: 12
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: 'white'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    },
    x: {
      ticks: {
        color: 'white'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    }
  }
};

const generateRandomStats = (platform) => {
  return {
    followers: Math.floor(Math.random() * 1000000),
    subscribers: Math.floor(Math.random() * 500000),
    views: Math.floor(Math.random() * 10000000),
    likes: Math.floor(Math.random() * 2000000),
    shares: Math.floor(Math.random() * 100000)
  };
};

const platformColors = {
  youtube: {
    background: ['rgba(255, 0, 0, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 159, 64, 0.7)'],
    border: ['rgba(255, 0, 0, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 159, 64, 1)']
  },
  twitch: {
    background: ['rgba(145, 70, 255, 0.7)', 'rgba(189, 147, 249, 0.7)', 'rgba(139, 92, 246, 0.7)'],
    border: ['rgba(145, 70, 255, 1)', 'rgba(189, 147, 249, 1)', 'rgba(139, 92, 246, 1)']
  }
};

const getRandomColors = () => {
  const hue = Math.floor(Math.random() * 360);
  return {
    background: [
      `hsla(${hue}, 70%, 50%, 0.7)`,
      `hsla(${(hue + 40) % 360}, 70%, 50%, 0.7)`,
      `hsla(${(hue + 80) % 360}, 70%, 50%, 0.7)`
    ],
    border: [
      `hsla(${hue}, 70%, 50%, 1)`,
      `hsla(${(hue + 40) % 360}, 70%, 50%, 1)`,
      `hsla(${(hue + 80) % 360}, 70%, 50%, 1)`
    ]
  };
};

export default function DashboardCharts({ onStatsUpdate }) {
  const { data: session } = useSession();
  const [activeCharts, setActiveCharts] = useState([]);
  const [chartTypes, setChartTypes] = useState({});
  const [stats, setStats] = useState({});
  const [platformColors, setPlatformColors] = useState({});
  const [lastRefreshed, setLastRefreshed] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSound] = useState(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/mp3/beepgt.mp3');
      audio.volume = 0.5;
      return audio;
    }
    return null;
  });
  const [canPlaySound, setCanPlaySound] = useState(false);
  const [refreshRate, setRefreshRate] = useState(5 * 60 * 1000); // Default 5 minutes

  // Handle user interaction to enable sound
  useEffect(() => {
    const handleInteraction = () => {
      setCanPlaySound(true);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Load settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        const userSettings = data.find(s => s.userId === session.user.id);
        
        if (userSettings) {
          setActiveCharts(userSettings.activeCharts || ['youtube', 'twitch']);
          setPlatformColors(userSettings.platformColors || {});
          setChartTypes(userSettings.chartTypes || {});
          setRefreshRate((userSettings.refreshRate || 5) * 60 * 1000);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, [session]);

  // Show reminder notification
  const showReminder = useCallback(async () => {
    // Only play sound if we have permission and the sound is loaded
    if (canPlaySound && notificationSound) {
      try {
        await notificationSound.play();
      } catch (error) {
        console.error('Error playing notification sound:', error);
      }
    }

    // Show visual notification
    setNotificationMessage("Time to check your social media stats!");
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  }, [canPlaySound, notificationSound]);

  // Set up reminder interval
  useEffect(() => {
    console.log(`Setting up reminder interval: ${refreshRate}ms`);
    const interval = setInterval(showReminder, refreshRate);
    return () => clearInterval(interval);
  }, [refreshRate, showReminder]);

  // Fetch data for a single platform
  const refreshPlatform = useCallback(async (platform) => {
    console.log('Refreshing platform:', platform);
    try {
      const response = await fetch(`/api/social-stats?platforms=${platform}&range=1day&refresh=true`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      
      if (data[platform] && data[platform].length > 0) {
        // Get the most recent entry
        const latestEntry = data[platform][data[platform].length - 1];
        
        setStats(prevStats => {
          const newStats = {
            ...prevStats,
            [platform]: latestEntry.stats
          };
          return newStats;
        });
      }
      
      setLastRefreshed(prev => ({
        ...prev,
        [platform]: new Date().toISOString()
      }));
      
      await showReminder();
    } catch (error) {
      console.error(`Error refreshing ${platform} stats:`, error);
    }
  }, [showReminder]);

  // Effect to handle stats updates
  useEffect(() => {
    const handleStatsUpdate = async () => {
      if (Object.keys(stats).length > 0) {
        // Notify parent component of stats update
        onStatsUpdate?.(stats);

        // Also dispatch event for any other listeners
        const event = new CustomEvent('statsUpdated', {
          detail: { stats }
        });
        window.dispatchEvent(event);
      }
    };

    handleStatsUpdate();
  }, [stats, onStatsUpdate, activeCharts.length]);

  // Memoize the fetchInitialData function
  const fetchInitialData = useCallback(async () => {
    try {
      // Fetch the most recent stats for each platform
      const response = await fetch(`/api/social-stats?platforms=${activeCharts.join(',')}&range=1day`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      
      // Transform the data to get the most recent stats for each platform
      const latestStats = {};
      Object.keys(data).forEach(platform => {
        if (data[platform] && data[platform].length > 0) {
          // Get the most recent entry
          const latestEntry = data[platform][data[platform].length - 1];
          latestStats[platform] = latestEntry.stats;
        }
      });
      
      setStats(latestStats);
      
      // Notify parent of initial stats
      onStatsUpdate?.(latestStats);
      
      const now = new Date().toISOString();
      const initialRefreshTimes = {};
      activeCharts.forEach(platform => {
        initialRefreshTimes[platform] = now;
      });
      setLastRefreshed(initialRefreshTimes);
    } catch (error) {
      console.error('Error fetching initial stats:', error);
    }
  }, [activeCharts, onStatsUpdate]);

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      if (activeCharts.length > 0) {
        await fetchInitialData();
      }
    };

    initializeData();
  }, [fetchInitialData]);

  // Set up refresh interval for random chart selection
  useEffect(() => {
    console.log(`Setting up refresh interval with rate: ${refreshRate}ms`);
    let lastRefreshedPlatform = null;
    
    const interval = setInterval(async () => {
      if (activeCharts.length > 0) {
        // Randomly select one chart to refresh, but not the same one twice in a row
        let randomIndex;
        let platformToRefresh;
        do {
          randomIndex = Math.floor(Math.random() * activeCharts.length);
          platformToRefresh = activeCharts[randomIndex];
        } while (platformToRefresh === lastRefreshedPlatform && activeCharts.length > 1);
        
        lastRefreshedPlatform = platformToRefresh;
        console.log(`Refreshing random platform: ${platformToRefresh}`);
        await refreshPlatform(platformToRefresh);
      }
    }, refreshRate);

    return () => clearInterval(interval);
  }, [activeCharts, refreshRate, refreshPlatform]);

  const saveChartType = useCallback(async (platform, type) => {
    if (!session?.user?.id) return;

    setChartTypes(prev => {
      const newChartTypes = { ...prev, [platform]: type };
      return newChartTypes;
    });

    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      const userSettings = data.find(s => s.userId === session.user.id) || {};

      const updatedSettings = {
        ...userSettings,
        userId: session.user.id,
        chartTypes: { ...userSettings.chartTypes, [platform]: type }
      };

      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });
    } catch (error) {
      console.error('Error saving chart type:', error);
    }
  }, [session]);

  const getChartData = (platform) => {
    const data = stats[platform] || {};
    const values = [
      data.followers || 0,
      data.views || 0,
      data.likes || 0,
      data.shares || 0
    ];
    
    const labels = ['Followers', 'Views', 'Likes', 'Shares'];

    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: platformColors[platform]?.background || ['rgba(75, 192, 192, 0.7)'],
        borderColor: platformColors[platform]?.border || ['rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      }],
    };
  };

  const renderChart = (platform) => {
    const chartType = chartTypes[platform] || 'pie';
    const chartData = getChartData(platform);

    switch (chartType) {
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />;
      default:
        return <Pie data={chartData} options={chartOptions} />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 relative">
      {showNotification && (
        <div 
          className="fixed top-4 right-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg z-50 animate-notification cursor-pointer"
          onClick={() => setShowNotification(false)}
        >
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>{notificationMessage}</span>
          </div>
        </div>
      )}
      {activeCharts.map(platform => (
        <div key={platform} className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 
              onClick={() => window.location.href = `/analytics/${platform}`}
              className="text-2xl font-bold cursor-pointer hover:text-purple-400 transition-colors"
            >
              {platform.charAt(0).toUpperCase() + platform.slice(1).replace(/-/g, ' ')} Stats
            </h2>
            {lastRefreshed[platform] && (
              <span className="text-sm text-gray-400">
                Last updated: {new Date(lastRefreshed[platform]).toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="h-[300px] w-full">
            {renderChart(platform)}
          </div>
          <select 
            className="mt-4 w-full bg-white/90 backdrop-blur-sm border border-purple-500 rounded-lg p-2 text-black shadow-lg text-lg"
            value={chartTypes[platform] || 'pie'}
            onChange={(e) => saveChartType(platform, e.target.value)}
          >
            <option value="pie">Pie Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="doughnut">Doughnut Chart</option>
          </select>
        </div>
      ))}
    </div>
  );
} 