"use client";

import Image from "next/image";
import Link from "next/link";
import DashboardCharts from "@/app/components/DashboardCharts";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
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

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* YouTube Chart */}
          <DashboardCharts />

          {/* Central Stats */}
          <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-center">
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Total Followers</h3>
                <p className="text-4xl font-bold text-yellow-400">3,700</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Following</h3>
                <p className="text-4xl font-bold text-yellow-400">890</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
