"use client";

import Settings from '../components/Settings';
import Image from 'next/image';
import Header from "../components/Header";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Header />
        <Settings />
      </div>
    </div>
  );
} 