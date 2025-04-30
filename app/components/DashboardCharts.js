"use client";

import { useState, useEffect } from 'react';
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

export default function DashboardCharts() {
  const [activeCharts, setActiveCharts] = useState(['youtube', 'twitch']);
  const [chartTypes, setChartTypes] = useState({});
  const [stats, setStats] = useState({});
  const [platformColors, setPlatformColors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get settings from localStorage
        let settings = {};
        const savedSettings = localStorage.getItem('dashboardSettings');
        if (savedSettings) {
          settings = JSON.parse(savedSettings);
          setChartTypes(settings.chartTypes || {});
          setActiveCharts(settings.activeCharts || ['youtube', 'twitch']);
          setPlatformColors(settings.platformColors || {});
        }

        // Fetch stats from API with current active charts
        const currentActiveCharts = settings.activeCharts || ['youtube', 'twitch'];
        const response = await fetch(`/api/social-stats?platforms=${currentActiveCharts.join(',')}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        
        // Generate colors for new platforms
        const updatedPlatformColors = { ...platformColors };
        currentActiveCharts.forEach(platform => {
          if (!updatedPlatformColors[platform]) {
            updatedPlatformColors[platform] = getRandomColors();
          }
        });
        setPlatformColors(updatedPlatformColors);

        // Save updated settings
        const updatedSettings = {
          ...settings,
          platformColors: updatedPlatformColors,
          activeCharts: currentActiveCharts
        };
        localStorage.setItem('dashboardSettings', JSON.stringify(updatedSettings));
        setStats(data);

        // Save active charts to database
        await fetch('/api/social-stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'settings',
            activeCharts: currentActiveCharts
          }),
        });
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  const saveChartType = (platform, type) => {
    const settings = JSON.parse(localStorage.getItem('dashboardSettings') || '{}');
    const newChartTypes = { ...chartTypes, [platform]: type };
    settings.chartTypes = newChartTypes;
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    setChartTypes(newChartTypes);
  };

  const getChartData = (platform) => {
    const data = stats[platform] || {};
    const values = [
      data.followers || 0,
      data.subscribers || 0,
      data.views || 0,
      data.likes || 0,
      data.shares || 0
    ];
    
    const labels = ['Followers', 'Subscribers', 'Views', 'Likes', 'Shares'];

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      {activeCharts.map((platform) => (
        <div key={platform} className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
          <h2 
            onClick={() => window.location.href = `/analytics/${platform}`}
            className="text-2xl font-bold mb-4 text-center cursor-pointer hover:text-purple-400 transition-colors"
          >
            {platform.charAt(0).toUpperCase() + platform.slice(1).replace(/-/g, ' ')} Stats
          </h2>
          <div className="h-[300px] w-full">
            {renderChart(platform)}
          </div>
          <select 
            className="mt-4 w-full bg-white border border-purple-500 rounded-lg p-2 text-black shadow-lg text-lg"
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