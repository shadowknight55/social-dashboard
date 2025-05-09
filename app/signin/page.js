'use client';  // Marks this as a Client Component in Next.js

import { signIn, useSession } from 'next-auth/react';  // NextAuth function for authentication
import { useState, useEffect } from 'react';  // React hook for state management
import { useRouter, useSearchParams } from 'next/navigation';  // Next.js routing hooks
import { useTheme } from '../context/ThemeContext';

export default function SignIn() {
    const router = useRouter();  // Hook for programmatic navigation
    const searchParams = useSearchParams();  // Hook to access URL parameters
    const { data: session, status } = useSession();
    const { theme, themes } = useTheme();
    const currentTheme = themes[theme];
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [isLoading, setIsLoading] = useState(false);  // Tracks loading state
    const [error, setError] = useState('');  // Stores error messages
    const [isEmailSignIn, setIsEmailSignIn] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: ''
    });
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (status === 'authenticated') {
            router.push(callbackUrl);
        }
    }, [status, callbackUrl, router]);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setValidationError('');
    };

    const validateForm = () => {
        if (formData.password.length < 8) {
            setValidationError('Password must be at least 8 characters long');
            return false;
        }
        if (!formData.email.includes('@')) {
            setValidationError('Please enter a valid email address');
            return false;
        }
        if (formData.username.length < 3) {
            setValidationError('Username must be at least 3 characters long');
            return false;
        }
        return true;
    };

    const handleEmailSignIn = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setError('');
        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                username: formData.username,
                callbackUrl,
                redirect: false
            });

            if (result?.error) {
                setError('Invalid email or password');
            }
            if (result?.url) {
                router.push(result.url);
            }
        } catch (err) {
            console.error('Sign in error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className={`min-h-screen flex items-center justify-center bg-gradient-to-b ${currentTheme.background}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex items-center justify-center bg-gradient-to-b ${currentTheme.background}`}>
            <div className={`max-w-md w-full space-y-8 p-10 ${currentTheme.card} backdrop-blur-sm rounded-xl shadow-2xl`}>
                <div className="text-center">
                    <h1 className={`text-4xl font-bold ${currentTheme.accent}`}>
                        Astro&apos;s Social Board
                    </h1>
                    <h2 className={`mt-2 text-lg ${currentTheme.text}`}>Sign in to manage your social media</h2>
                </div>
                {error && (
                    <div className="bg-red-500/20 border-l-4 border-red-500 text-red-200 p-4 rounded" role="alert">
                        <p>{error}</p>
                    </div>
                )}
                {validationError && (
                    <div className="bg-red-500/20 border-l-4 border-red-500 text-red-200 p-4 rounded" role="alert">
                        <p>{validationError}</p>
                    </div>
                )}
                <div className="mt-8 space-y-6">
                    {!isEmailSignIn ? (
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white transition-all duration-300 transform hover:scale-105 ${
                                isLoading 
                                    ? 'bg-gray-600 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Signing in...
                                </div>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Sign in with Google
                                </>
                            )}
                        </button>
                    ) : (
                        <form onSubmit={handleEmailSignIn} className="space-y-4">
                            <div>
                                <label htmlFor="username" className={`block text-sm font-medium ${currentTheme.text}`}>
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full px-3 py-2 ${currentTheme.input} ${currentTheme.text} border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300`}
                                    placeholder="Enter your username"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className={`block text-sm font-medium ${currentTheme.text}`}>
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full px-3 py-2 ${currentTheme.input} ${currentTheme.text} border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300`}
                                    placeholder="Enter your email"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className={`block text-sm font-medium ${currentTheme.text}`}>
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full px-3 py-2 ${currentTheme.input} ${currentTheme.text} border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300`}
                                    placeholder="Enter your password"
                                />
                                <p className={`mt-1 text-sm ${currentTheme.text}`}>Password must be at least 8 characters long</p>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white transition-all duration-300 transform hover:scale-105 ${
                                    isLoading 
                                        ? 'bg-gray-600 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                                }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </form>
                    )}

                    <div className="text-center">
                        <button
                            onClick={() => setIsEmailSignIn(!isEmailSignIn)}
                            className={`${currentTheme.accent} hover:text-yellow-300 text-sm transition-colors duration-300 hover:underline`}
                        >
                            {isEmailSignIn ? 'Sign in with Google instead' : 'Sign in with email instead'}
                        </button>
                    </div>

                    <div className="text-sm text-center">
                        <p className={currentTheme.text}>
                            By signing in, you agree to our{' '}
                            <a href="/terms" className={`${currentTheme.accent} hover:text-yellow-300 transition-colors duration-300 hover:underline`}>Terms of Service</a>
                            {' '}and{' '}
                            <a href="/privacy" className={`${currentTheme.accent} hover:text-yellow-300 transition-colors duration-300 hover:underline`}>Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}