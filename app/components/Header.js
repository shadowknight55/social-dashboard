"use client";

import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function Header() {
  return (
    <header className="mb-8">
      <nav className="bg-black/30 rounded-lg p-4 backdrop-blur-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500">
            Astro&apos;s Social Board
          </Link>
          <div className="flex space-x-4">
            <Link 
              href="/" 
              className="px-4 py-2 rounded-lg transition-colors hover:bg-white/10 text-white"
            >
              Home
            </Link>
            <Link 
              href="/profile" 
              className="px-4 py-2 rounded-lg transition-colors hover:bg-white/10 text-white"
            >
              Profile
            </Link>
            <Link 
              href="/settings" 
              className="px-4 py-2 rounded-lg transition-colors hover:bg-white/10 text-white"
            >
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/signin' })}
              className="px-4 py-2 rounded-lg transition-colors bg-purple-600 text-white hover:bg-purple-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
} 