"use client";

import { useState, useEffect, useCallback } from 'react';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';

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
  const [activeCharts, setActiveCharts] = useState(['youtube', 'twitch']);
  const [chartTypes, setChartTypes] = useState({});
  const [stats, setStats] = useState({});
  const [platformColors, setPlatformColors] = useState({});
  const [lastRefreshed, setLastRefreshed] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [refreshedPlatform, setRefreshedPlatform] = useState('');
  const [notificationSound, setNotificationSound] = useState(null);
  const [refreshRate, setRefreshRate] = useState(5 * 60 * 1000); // Default 5 minutes

  // Initialize Audio on client side
  useEffect(() => {
    try {
      const audio = new Audio('/mp3/beepgt.mp3');
      audio.volume = 0.5; // Set volume to 50%
      audio.preload = 'auto'; // Preload the sound
      
      // Add event listeners to handle loading
      audio.addEventListener('canplaythrough', () => {
        console.log('Audio loaded successfully');
        setNotificationSound(audio);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Error loading audio:', e);
      });
      
      // Start loading the audio
      audio.load();
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }, []);

  // Load settings and set up refresh rate monitoring
  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('dashboardSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setChartTypes(parsedSettings.chartTypes || {});
        setActiveCharts(parsedSettings.activeCharts || ['youtube', 'twitch']);
        setPlatformColors(parsedSettings.platformColors || {});
        setRefreshRate((parsedSettings.refreshRate || 5) * 60 * 1000);
      }
    };

    loadSettings();

    const handleStorageChange = (e) => {
      if (e.key === 'dashboardSettings') {
        const newSettings = JSON.parse(e.newValue);
        if (newSettings.refreshRate) {
          setRefreshRate(newSettings.refreshRate * 60 * 1000);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle notifications
  const showRefreshNotification = useCallback(async (platform) => {
    console.log('Showing notification for:', platform);
    // Play sound first
    if (notificationSound) {
      try {
        notificationSound.currentTime = 0; // Reset sound to start
        await notificationSound.play();
      } catch (error) {
        console.error('Error playing notification sound:', error);
      }
    }

    // Show visual notification
    setRefreshedPlatform(platform);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  }, [notificationSound]);

  // Fetch data for a single platform
  const refreshPlatform = useCallback(async (platform) => {
    console.log('Refreshing platform:', platform);
    try {
      const response = await fetch(`/api/social-stats?platforms=${platform}&refresh=true`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      
      // Only update the stats for the specific platform
      setStats(prevStats => {
        const newStats = {
          ...prevStats,
          [platform]: data[platform]
        };
        return newStats;
      });
      
      setLastRefreshed(prev => ({
        ...prev,
        [platform]: new Date().toISOString()
      }));
      
      await showRefreshNotification(platform);
    } catch (error) {
      console.error(`Error refreshing ${platform} stats:`, error);
    }
  }, [showRefreshNotification]);

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
  }, [stats, onStatsUpdate]);

  // Memoize the fetchInitialData function
  const fetchInitialData = useCallback(async () => {
    try {
      const response = await fetch(`/api/social-stats?platforms=${activeCharts.join(',')}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      
      // Notify parent of initial stats
      onStatsUpdate?.(data);
      
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

  const saveChartType = useCallback((platform, type) => {
    setChartTypes(prev => {
      const newChartTypes = { ...prev, [platform]: type };
      const settings = JSON.parse(localStorage.getItem('dashboardSettings') || '{}');
      const newSettings = { ...settings, chartTypes: newChartTypes };
      localStorage.setItem('dashboardSettings', JSON.stringify(newSettings));
      return newChartTypes;
    });
  }, []);

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
          className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 animate-notification"
          onClick={() => {
            // Play sound on click for testing
            if (notificationSound) {
              notificationSound.currentTime = 0;
              notificationSound.play().catch(console.error);
            }
          }}
        >
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>
              {refreshedPlatform.charAt(0).toUpperCase() + refreshedPlatform.slice(1)} stats refreshed!
            </span>
          </div>
        </div>
      )}
      {activeCharts.map((platform) => (
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