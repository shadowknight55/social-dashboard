"use client";

import { useState, useEffect } from 'react';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';

// Register all chart components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

// Data for pie and doughnut charts
const pieChartData = {
  labels: ['Subscribers', 'Views', 'Videos'],
  datasets: [{
    data: [1200, 5000, 50],
    backgroundColor: [
      'rgba(255, 0, 0, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(255, 159, 64, 0.7)',
    ],
    borderColor: [
      'rgba(255, 0, 0, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(255, 159, 64, 1)',
    ],
    borderWidth: 1,
  }],
};

// Data for bar and line charts
const barLineChartData = {
  labels: ['Subscribers', 'Views', 'Videos'],
  datasets: [{
    label: 'YouTube Stats',
    data: [1200, 5000, 50],
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderColor: 'rgba(255, 0, 0, 1)',
    borderWidth: 1,
  }],
};

// Twitch data for pie and doughnut charts
const twitchPieChartData = {
  labels: ['Followers', 'Subscribers', 'Views'],
  datasets: [{
    data: [2000, 500, 10000],
    backgroundColor: [
      'rgba(145, 70, 255, 0.7)',
      'rgba(189, 147, 249, 0.7)',
      'rgba(139, 92, 246, 0.7)',
    ],
    borderColor: [
      'rgba(145, 70, 255, 1)',
      'rgba(189, 147, 249, 1)',
      'rgba(139, 92, 246, 1)',
    ],
    borderWidth: 1,
  }],
};

// Twitch data for bar and line charts
const twitchBarLineChartData = {
  labels: ['Followers', 'Subscribers', 'Views'],
  datasets: [{
    label: 'Twitch Stats',
    data: [2000, 500, 10000],
    backgroundColor: 'rgba(145, 70, 255, 0.7)',
    borderColor: 'rgba(145, 70, 255, 1)',
    borderWidth: 1,
  }],
};

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

export default function DashboardCharts() {
  const [chartTypes, setChartTypes] = useState({
    youtubeChartType: 'pie',
    twitchChartType: 'pie'
  });

  // Load chart type settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setChartTypes({
        youtubeChartType: settings.youtubeChartType || 'pie',
        twitchChartType: settings.twitchChartType || 'pie'
      });
    }
  }, []);

  // Function to render the appropriate chart based on type
  const renderChart = (type, isYoutube = true) => {
    // Select the appropriate data format based on chart type
    const chartData = (type === 'pie' || type === 'doughnut') 
      ? (isYoutube ? pieChartData : twitchPieChartData)
      : (isYoutube ? barLineChartData : twitchBarLineChartData);

    switch (type) {
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
    <>
      {/* YouTube Chart */}
      <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-bold mb-4 text-center">YouTube Stats</h2>
        <div className="aspect-square">
          {renderChart(chartTypes.youtubeChartType, true)}
        </div>
        <select className="mt-4 w-full bg-white border border-purple-500 rounded-lg p-2 text-black shadow-lg">
          <option value="daily">Daily Stats</option>
          <option value="weekly">Weekly Stats</option>
          <option value="monthly">Monthly Stats</option>
        </select>
      </div>

      {/* Twitch Chart */}
      <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-bold mb-4 text-center">Twitch Stats</h2>
        <div className="aspect-square">
          {renderChart(chartTypes.twitchChartType, false)}
        </div>
        <select className="mt-4 w-full bg-white border border-purple-500 rounded-lg p-2 text-black shadow-lg">
          <option value="daily">Daily Stats</option>
          <option value="weekly">Weekly Stats</option>
          <option value="monthly">Monthly Stats</option>
        </select>
      </div>
    </>
  );
} 