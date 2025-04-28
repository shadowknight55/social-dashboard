'use client';  // Marks this as a Client Component in Next.js

import { signIn } from 'next-auth/react';  // NextAuth function for authentication
import { useState } from 'react';  // React hook for state management
import { useRouter, useSearchParams } from 'next/navigation';  // Next.js routing hooks

export default function SignIn() {
    const router = useRouter();  // Hook for programmatic navigation
    const searchParams = useSearchParams();  // Hook to access URL parameters
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [isLoading, setIsLoading] = useState(false);  // Tracks loading state
    const [error, setError] = useState('');  // Stores error messages

const handleGoogleSignIn = async () => {
        setIsLoading(true);  // Start loading state
        setError('');  // Clear any previous errors
        try {
            const result = await signIn('google', { 
                callbackUrl,  // Where to redirect after successful sign in
                redirect: false  // Prevents automatic redirect
            });
            if (result?.error) {
                setError('Failed to sign in with Google. Please try again.');
            }
            if (result?.url) {
                router.push(result.url);  // Redirect to the callback URL
            }
        } catch (err) {
            console.error('Sign in error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);  // Reset loading state
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Cozy Reads</h1>
                    <h2 className="mt-2 text-lg text-gray-600">Sign in to manage your inventory</h2>
                </div>
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4" role="alert">
                        <p>{error}</p>
                    </div>
                )}
                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            isLoading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                    >
                        {isLoading ? 'Signing in...' : 'Sign in with Google'}
                    </button>
                    <div className="text-sm text-center">
                        <p className="text-gray-500">
                            By signing in, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}