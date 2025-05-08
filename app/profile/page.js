"use client";

import { useState, useEffect } from 'react';
import Header from "../components/Header";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    email: '',
    profilePicture: '/default-avatar.png',
    notifications: false,
    emailUpdates: false,
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [picUploading, setPicUploading] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    async function fetchProfileWithTimeout() {
      setLoading(true);
      setError('');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000); // 7 seconds
      try {
        const res = await fetch('/api/profile', { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile({
          email: data.email,
          profilePicture: data.profilePicture || '/default-avatar.png',
          notifications: !!data.notifications,
          emailUpdates: !!data.emailUpdates,
        });
      } catch (err) {
        if (err.name === 'AbortError') {
          setError('Profile API timed out. Please try again later.');
        } else {
          setError('Failed to load profile. Please try again later.');
        }
      }
      setLoading(false);
    }
    fetchProfileWithTimeout();
  }, []);

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setPicUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        const res = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profilePicture: base64 }),
        });
        if (res.ok) {
          setProfile((p) => ({ ...p, profilePicture: base64 }));
          setStatus('Profile picture updated!');
        } else {
          setStatus('Failed to update profile picture.');
        }
        setPicUploading(false);
        setTimeout(() => setStatus(''), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggle = async (field) => {
    const newValue = !profile[field];
    setProfile((p) => ({ ...p, [field]: newValue }));
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: newValue }),
    });
    if (res.ok) {
      setStatus('Preferences updated!');
    } else {
      setStatus('Failed to update preferences.');
    }
    setTimeout(() => setStatus(''), 2000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwords.new.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setPasswordError(data.error || 'Failed to update password');
        return;
      }

      setStatus('Password updated successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('An error occurred while updating password');
    }
    
    setTimeout(() => setStatus(''), 2000);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading profile...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex flex-col items-center justify-center text-red-400 text-lg">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white flex flex-col items-center py-8">
      <Header />
      <div className="w-full max-w-2xl bg-black/30 rounded-xl p-8 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>
        {status && (
          <div className="mb-4 p-2 rounded bg-green-600 text-white">{status}</div>
        )}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-32 h-32 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
            <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <input type="file" accept="image/*" id="profile-upload" className="hidden" onChange={handleProfilePictureUpload} disabled={picUploading} />
          <label htmlFor="profile-upload" className="px-4 py-2 bg-purple-600 rounded-lg cursor-pointer hover:bg-purple-700 disabled:opacity-50" style={{ opacity: picUploading ? 0.5 : 1 }}>Change Picture</label>
        </div>
        <div className="mb-6">
          <div className="mb-2">Email: <span className="font-mono text-yellow-300">{profile.email}</span></div>
          <label className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked={profile.notifications} onChange={() => handleToggle('notifications')} />
            Enable Notifications
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={profile.emailUpdates} onChange={() => handleToggle('emailUpdates')} />
            Email Updates
          </label>
        </div>
        <form onSubmit={handlePasswordChange} className="bg-black/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Change Password</h3>
          <input type="password" placeholder="Current Password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} className="w-full mb-2 p-2 rounded bg-white/10 text-white" required />
          <input type="password" placeholder="New Password" value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} className="w-full mb-2 p-2 rounded bg-white/10 text-white" required />
          <input type="password" placeholder="Confirm New Password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} className="w-full mb-2 p-2 rounded bg-white/10 text-white" required />
          {passwordError && <div className="text-red-400 mb-2">{passwordError}</div>}
          <button type="submit" className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700">Change Password</button>
        </form>
      </div>
    </div>
  );
} 