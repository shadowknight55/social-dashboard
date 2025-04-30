"use client";

import Settings from '../components/Settings';
import Image from 'next/image';

export default function SettingsPage() {
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
            <button 
              onClick={() => window.location.href = '/'} 
              className="hover:text-yellow-400 transition-colors px-4 py-2 rounded-lg bg-black/30 hover:bg-yellow-400 hover:text-black"
            >
              Home
            </button>
            <button 
              onClick={() => window.location.href = '/settings'} 
              className="text-yellow-400 transition-colors px-4 py-2 rounded-lg bg-black/30 hover:bg-yellow-400 hover:text-black"
            >
              Settings
            </button>
          </nav>
        </header>

        <Settings />
      </div>
    </div>
  );
} 