"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    youtubeChartType: "pie",
    twitchChartType: "pie",
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings to localStorage
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    console.log("Settings saved:", settings);
    alert("Settings saved successfully!");
  };

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
            <button onClick={() => window.location.href = '/'} className="hover:text-yellow-400 transition-colors px-4 py-2 rounded-lg bg-black/30 hover:bg-yellow-400 hover:text-black">Home</button>
            <button onClick={() => window.location.href = '/settings'} className="text-yellow-400 transition-colors px-4 py-2 rounded-lg bg-black/30 hover:bg-yellow-400 hover:text-black">Settings</button>
          </nav>
        </header>

        {/* Settings Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-black/30 rounded-xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  <p className="text-gray-300">Receive notifications for new followers and comments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={settings.notifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>

              {/* Email Updates */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Email Updates</h3>
                  <p className="text-gray-300">Receive email updates about your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailUpdates"
                    checked={settings.emailUpdates}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>

              {/* YouTube Chart Type */}
              <div>
                <h3 className="text-lg font-semibold mb-2">YouTube Chart Type</h3>
                <select
                  name="youtubeChartType"
                  value={settings.youtubeChartType}
                  onChange={handleChange}
                  className="w-full bg-white border border-purple-500 rounded-lg p-2 text-black shadow-lg"
                >
                  <option value="pie">Pie Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="doughnut">Doughnut Chart</option>
                </select>
              </div>

              {/* Twitch Chart Type */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Twitch Chart Type</h3>
                <select
                  name="twitchChartType"
                  value={settings.twitchChartType}
                  onChange={handleChange}
                  className="w-full bg-white border border-purple-500 rounded-lg p-2 text-black shadow-lg"
                >
                  <option value="pie">Pie Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="doughnut">Doughnut Chart</option>
                </select>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Save Settings
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 