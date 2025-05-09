import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const generateRandomStats = (platform) => {
  return {
    followers: Math.floor(Math.random() * 1000000),
    subscribers: Math.floor(Math.random() * 500000),
    views: Math.floor(Math.random() * 10000000),
    likes: Math.floor(Math.random() * 2000000),
    shares: Math.floor(Math.random() * 100000)
  };
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

export default function Settings() {
  const { data: session } = useSession();
  const [activeCharts, setActiveCharts] = useState(['youtube', 'twitch']);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [refreshRate, setRefreshRate] = useState('5');
  const [profilePicture, setProfilePicture] = useState('/default-avatar.png');
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [platformColors, setPlatformColors] = useState({
    youtube: {
      background: ['rgba(255, 0, 0, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 159, 64, 0.7)'],
      border: ['rgba(255, 0, 0, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 159, 64, 1)']
    },
    twitch: {
      background: ['rgba(145, 70, 255, 0.7)', 'rgba(189, 147, 249, 0.7)', 'rgba(139, 92, 246, 0.7)'],
      border: ['rgba(145, 70, 255, 1)', 'rgba(189, 147, 249, 1)', 'rgba(139, 92, 246, 1)']
    }
  });

  const refreshRateOptions = [
    { value: 5, label: '5 Minutes' },
    { value: 10, label: '10 Minutes' },
    { value: 15, label: '15 Minutes' },
    { value: 30, label: '30 Minutes' },
    { value: 60, label: '1 Hour' }
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        const userSettings = await response.json();
        
        if (userSettings.activeCharts) {
          setActiveCharts(userSettings.activeCharts);
        }
        if (userSettings.platformColors) {
          setPlatformColors(userSettings.platformColors);
        }
        if (userSettings.refreshRate) {
          setRefreshRate(userSettings.refreshRate);
        }
        if (userSettings.theme) {
          setTheme(userSettings.theme);
        }
        if (userSettings.notifications !== undefined) {
          setNotifications(userSettings.notifications);
        }
        if (userSettings.emailUpdates !== undefined) {
          setEmailUpdates(userSettings.emailUpdates);
        }
        if (userSettings.profilePicture) {
          setProfilePicture(userSettings.profilePicture || '/default-avatar.png');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        showStatus('Failed to load settings', true);
      }
    };

    fetchSettings();
  }, [session, platformColors]);

  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
        saveSettings(activeCharts, platformColors, refreshRate, {
          theme,
          notifications,
          emailUpdates,
          profilePicture: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    saveSettings(activeCharts, platformColors, refreshRate, {
      theme: newTheme,
      notifications,
      emailUpdates,
      profilePicture
    });
  };

  const handlePreferenceChange = (preference, value) => {
    if (preference === 'notifications') {
      setNotifications(value);
    } else if (preference === 'emailUpdates') {
      setEmailUpdates(value);
    }
    saveSettings(activeCharts, platformColors, refreshRate, {
      theme,
      notifications: preference === 'notifications' ? value : notifications,
      emailUpdates: preference === 'emailUpdates' ? value : emailUpdates,
      profilePicture
    });
  };

  const saveSettings = async (newActiveCharts, newPlatformColors, newRefreshRate, profileSettings = null) => {
    const settings = JSON.parse(localStorage.getItem('dashboardSettings') || '{}');
    settings.activeCharts = newActiveCharts;
    settings.platformColors = newPlatformColors;
    settings.refreshRate = newRefreshRate || refreshRate;
    
    if (profileSettings) {
      settings.theme = profileSettings.theme;
      settings.notifications = profileSettings.notifications;
      settings.emailUpdates = profileSettings.emailUpdates;
      settings.profilePicture = profileSettings.profilePicture;
    }
    
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          activeCharts: newActiveCharts,
          platformColors: newPlatformColors,
          refreshRate: newRefreshRate || refreshRate,
          ...profileSettings
        }),
      });

      if (!response.ok) throw new Error('Failed to save settings');
      showStatus('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showStatus('Failed to save settings', true);
    }
  };

  const showStatus = (message, isError = false) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleRefreshRateChange = async (value) => {
    setRefreshRate(value);
    await saveSettings(activeCharts, platformColors, value);
    showStatus(`Refresh rate updated to ${value} minutes`);
  };

  const addNewPlatform = async () => {
    if (!newPlatformName.trim()) return;
    
    const platform = newPlatformName.toLowerCase().replace(/\s+/g, '-');
    
    if (activeCharts.includes(platform)) {
      showStatus('This platform already exists!', true);
      return;
    }
    
    try {
      const newActiveCharts = [...activeCharts, platform];
      setActiveCharts(newActiveCharts);
      
      const newColors = { ...platformColors };
      newColors[platform] = getRandomColors();
      setPlatformColors(newColors);
      
      // Save to settings collection
      await saveSettings(newActiveCharts, newColors, refreshRate);
      
      // Generate and save initial stats for the new platform
      const initialStats = generateRandomStats(platform);
      const statsResponse = await fetch('/api/social-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: platform,
          stats: initialStats
        }),
      });

      if (!statsResponse.ok) throw new Error('Failed to create platform stats');
      
      showStatus(`Added ${platform} successfully!`);
      setNewPlatformName('');
    } catch (error) {
      console.error('Error:', error);
      showStatus('Failed to add platform to database', true);
    }
  };

  const removeChart = async (platform) => {
    if (activeCharts.length <= 2 && (platform === 'youtube' || platform === 'twitch')) {
      showStatus('Cannot remove YouTube or Twitch as they are required platforms!', true);
      return;
    }

    try {
      const newActiveCharts = activeCharts.filter(p => p !== platform);
      setActiveCharts(newActiveCharts);
      
      // Update settings collection
      await saveSettings(newActiveCharts, platformColors, refreshRate);

      // Remove platform data from social_stats collection
      const response = await fetch(`/api/social-stats/${platform}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove platform data');
      
      showStatus(`Removed ${platform} successfully!`);
    } catch (error) {
      console.error('Error:', error);
      showStatus('Failed to remove platform from database', true);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Status Message */}
      {statusMessage && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg ${
          statusMessage.includes('Failed') || statusMessage.includes('Cannot')
            ? 'bg-red-500'
            : 'bg-green-500'
        } text-white shadow-lg transition-opacity duration-500`}>
          {statusMessage}
        </div>
      )}

      {/* Platform Management */}
      <div className="bg-black/30 rounded-xl p-8 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6">Platform Management</h2>
        
        {/* Add New Platform */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Add New Platform</h3>
            <div className="flex gap-4">
              <input
                type="text"
                value={newPlatformName}
                onChange={(e) => setNewPlatformName(e.target.value)}
                placeholder="Enter platform name (e.g. Instagram)"
                className="flex-1 bg-white/10 text-white border border-purple-500 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={addNewPlatform}
                disabled={!newPlatformName.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Add Platform
              </button>
            </div>
          </div>

          {/* Active Platforms */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Active Platforms</h3>
            <div className="space-y-3">
              {activeCharts.map((platform) => (
                <div 
                  key={platform}
                  className="flex items-center justify-between bg-white/5 rounded-lg p-4"
                >
                  <span className="text-lg capitalize">
                    {platform.replace(/-/g, ' ')}
                  </span>
                  <button
                    onClick={() => removeChart(platform)}
                    className="text-white hover:text-red-500 transition-colors px-4 py-2 rounded-lg hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Settings */}
      <div className="bg-black/30 rounded-xl p-8 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6">Chart Settings</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Data Refresh Rate</h3>
            <select 
              className="w-full bg-white/10 text-white border border-purple-500 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={refreshRate}
              onChange={(e) => handleRefreshRateChange(e.target.value)}
            >
              {refreshRateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-400 mt-2">
              Charts will refresh with new data after the selected interval
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Default Chart Type</h3>
            <select className="w-full bg-white/10 text-white border border-purple-500 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="pie">Pie Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="doughnut">Doughnut Chart</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
} 