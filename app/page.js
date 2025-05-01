"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import DashboardCharts from "@/app/components/DashboardCharts";

export default function Home() {
  const [totalStats, setTotalStats] = useState({
    followers: 0,
    views: 0
  });

  // Function to calculate totals from stats
  const calculateTotals = useCallback((data) => {
    return Object.values(data).reduce((acc, platformStats) => {
      if (!platformStats) return acc;
      return {
        followers: acc.followers + (platformStats.followers || 0),
        views: acc.views + (platformStats.views || 0)
      };
    }, { followers: 0, views: 0 });
  }, []);

  // Memoize the onStatsUpdate callback
  const handleStatsUpdate = useCallback((stats) => {
    const newTotals = calculateTotals(stats);
    setTotalStats(newTotals);
  }, [calculateTotals]);

  useEffect(() => {
    const fetchTotalStats = async () => {
      try {
        const response = await fetch('/api/social-stats');
        const data = await response.json();
        const totals = calculateTotals(data);
        setTotalStats(totals);
      } catch (error) {
        console.error('Error fetching total stats:', error);
      }
    };

    fetchTotalStats();

    // Listen for stat updates from DashboardCharts
    const handleStatsUpdateEvent = (event) => {
      if (event.detail && event.detail.stats) {
        handleStatsUpdate(event.detail.stats);
      }
    };

    // Add event listener for stats updates
    window.addEventListener('statsUpdated', handleStatsUpdateEvent);

    return () => {
      window.removeEventListener('statsUpdated', handleStatsUpdateEvent);
    };
  }, [calculateTotals, handleStatsUpdate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Image
              src="/Astrobear.png"
              alt="Astrobear Logo"
              width={60}
              height={60}
              className="rounded-full bg-black/20 p-1 hover:scale-105 transition-transform"
            />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500">
              Astro's Social Board
            </h1>
          </div>
          <nav className="flex gap-6">
            <button onClick={() => window.location.href = '/'} className="text-yellow-400 transition-colors px-4 py-2 rounded-lg bg-black/30 hover:bg-yellow-400 hover:text-black">Home</button>
            <button onClick={() => window.location.href = '/settings'} className="hover:text-yellow-400 transition-colors px-4 py-2 rounded-lg bg-black/30 hover:bg-yellow-400 hover:text-black">Settings</button>
          </nav>
        </header>

        <div className="flex flex-col gap-8">
          {/* Total Stats Bar */}
          <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-around items-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-1">Total Followers</h3>
                <p className="text-2xl font-bold text-yellow-400">{totalStats.followers.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-1">Total Views</h3>
                <p className="text-2xl font-bold text-yellow-400">{totalStats.views.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <DashboardCharts onStatsUpdate={handleStatsUpdate} />
        </div>
      </div>
    </div>
  );
}
