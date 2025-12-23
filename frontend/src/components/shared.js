import React, { useState, useEffect } from 'react';
import { Sun, Moon, BookOpen, Search } from 'lucide-react';

// Theme Toggle Component
export const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check initial theme
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);

        if (newTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-cream-200 dark:bg-dark-400 hover:bg-cream-300 dark:hover:bg-dark-500 transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <Sun className="w-5 h-5 text-golden-500" />
            ) : (
                <Moon className="w-5 h-5 text-brown-600" />
            )}
        </button>
    );
};

// Logo Component
export const Logo = ({ size = "large" }) => {
    const iconSize = size === "large" ? "w-16 h-16" : "w-10 h-10";
    const textSize = size === "large" ? "text-3xl" : "text-xl";

    return (
        <div className="flex items-center gap-3">
            <div className={`${iconSize} relative`}>
                <div className="absolute inset-0 bg-gradient-to-br from-golden-400 to-golden-600 rounded-xl transform rotate-3"></div>
                <div className="absolute inset-0 bg-cream-50 dark:bg-dark-300 rounded-xl flex items-center justify-center border-2 border-golden-500">
                    <BookOpen className={`${size === "large" ? "w-8 h-8" : "w-5 h-5"} text-brown-700 dark:text-cream-100`} />
                    <Search className={`${size === "large" ? "w-4 h-4" : "w-3 h-3"} text-golden-600 absolute bottom-1 right-1`} />
                </div>
            </div>
            <div>
                <h1 className={`${textSize} font-bold text-brown-700 dark:text-cream-100 font-heading`}>
                    Smart <span className="text-golden-600 dark:text-golden-400">Organizer</span>
                </h1>
                {size === "large" && (
                    <p className="text-sm text-brown-500 dark:text-cream-300">Intelligent Document Classification</p>
                )}
            </div>
        </div>
    );
};

export default { ThemeToggle, Logo };
