import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeDemoHeader = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <header
      className={`w-full p-6 transition-all duration-300 ${
        isDark
          ? 'bg-black text-white'
          : 'bg-white text-black'
      } shadow-lg`}
      role="banner"
      aria-label="Main header with theme toggle"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Header Title */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold md:text-3xl">
            Magazine Website
          </h1>
          <p className={`text-sm mt-1 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Responsive Theme Demo
          </p>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isDark
              ? 'bg-gray-800 hover:bg-gray-700 text-white focus:ring-gray-600'
              : 'bg-gray-100 hover:bg-gray-200 text-black focus:ring-gray-400'
          }`}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          aria-pressed={isDark}
          title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        >
          {isDark ? (
            // Sun icon for switching to light mode
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            // Moon icon for switching to dark mode
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Current Theme Indicator */}
      <div className="max-w-4xl mx-auto mt-4 text-center">
        <p className={`text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Current theme: <span className="font-semibold capitalize">{theme}</span>
        </p>
      </div>
    </header>
  );
};

export default ThemeDemoHeader;