"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import DashboardCharts from "@/app/components/DashboardCharts";
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Header from "./components/Header";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

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
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

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

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Header />
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
