'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
    dark: {
        name: 'Dark',
        background: 'from-indigo-900 via-purple-900 to-black',
        card: 'bg-black/30',
        text: 'text-white',
        accent: 'text-yellow-400',
        button: 'bg-purple-600 hover:bg-purple-700',
        input: 'bg-white/10 border-gray-600',
    },
    light: {
        name: 'Light',
        background: 'from-blue-100 via-purple-100 to-pink-100',
        card: 'bg-white/80',
        text: 'text-gray-900',
        accent: 'text-purple-600',
        button: 'bg-purple-500 hover:bg-purple-600',
        input: 'bg-white border-gray-300',
    },
    cyberpunk: {
        name: 'Cyberpunk',
        background: 'from-pink-900 via-purple-900 to-blue-900',
        card: 'bg-black/40',
        text: 'text-cyan-100',
        accent: 'text-pink-400',
        button: 'bg-pink-600 hover:bg-pink-700',
        input: 'bg-black/30 border-pink-500',
    },
    nature: {
        name: 'Nature',
        background: 'from-green-900 via-emerald-900 to-teal-900',
        card: 'bg-black/30',
        text: 'text-green-100',
        accent: 'text-emerald-400',
        button: 'bg-emerald-600 hover:bg-emerald-700',
        input: 'bg-white/10 border-emerald-600',
    }
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
    }, []);

    const changeTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, themes, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
} 