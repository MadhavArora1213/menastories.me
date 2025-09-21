import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useTheme } from "../context/ThemeContext";

const Header = ({ onMenuClick }) => {
  const { admin, logout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const isDark = theme === "dark";

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      "Master Admin": { color: "bg-red-500", text: "Master Admin" },
      "Content Admin": { color: "bg-blue-500", text: "Content Admin" },
      "Editor-in-Chief": { color: "bg-green-500", text: "Editor-in-Chief" },
      "Section Editors": { color: "bg-yellow-500", text: "Section Editor" },
      "Senior Writers": { color: "bg-purple-500", text: "Senior Writer" },
      "Staff Writers": { color: "bg-indigo-500", text: "Staff Writer" },
      "Contributors": { color: "bg-pink-500", text: "Contributor" },
      "Reviewers": { color: "bg-orange-500", text: "Reviewer" },
      "Social Media Manager": { color: "bg-teal-500", text: "Social Media" },
      "Webmaster": { color: "bg-cyan-500", text: "Webmaster" }
    };

    const config = roleConfig[role] || { color: "bg-primary-accent", text: "Admin" };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-white ${config.color} shadow-sm`}>
        {config.text}
      </span>
    );
  };

  return (
    <header className={`${isDark ? 'bg-gray-900' : 'bg-white'} border-b border-primary-border px-6 py-4 flex items-center justify-between transition-all duration-200 shadow-sm`}>
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className={`p-2 rounded-xl hover:${isDark ? 'bg-gray-800' : 'bg-gray-100'} transition-all duration-200 group`}
          aria-label="Toggle sidebar"
        >
          <svg className={`w-6 h-6 ${isDark ? 'text-white' : 'text-black'} group-hover:${isDark ? 'text-white' : 'text-black'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden md:block">
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Magazine Admin</h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className={`p-2 rounded-xl hover:${isDark ? 'bg-gray-800' : 'bg-gray-100'} transition-all duration-200 group`}
            aria-label="Theme settings"
          >
            {isDark ? (
              <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'} group-hover:${isDark ? 'text-white' : 'text-black'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'} group-hover:${isDark ? 'text-white' : 'text-black'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Theme Menu */}
          {showThemeMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowThemeMenu(false)}
              />
              <div className={`absolute right-0 mt-3 w-48 ${isDark ? 'bg-gray-900' : 'bg-white'} border border-primary-border rounded-xl shadow-lg z-20`}>
                <div className="py-2">
                  <button
                    onClick={() => {
                      toggleTheme();
                      setShowThemeMenu(false);
                    }}
                    className={`block w-full text-left px-4 py-2.5 text-sm ${isDark ? 'text-white' : 'text-black'} hover:${isDark ? 'bg-gray-800' : 'bg-gray-200'} transition-all duration-200 rounded-lg mx-2`}
                  >
                    <div className="flex items-center space-x-3">
                      {isDark ? (
                        <svg className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      ) : (
                        <svg className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      )}
                      <span>{isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Admin Profile */}
        {admin && (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center space-x-3 p-2 rounded-xl hover:${isDark ? 'bg-gray-800' : 'bg-gray-100'} transition-all duration-200 group`}
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-primary-accent rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {admin.name?.charAt(0) || admin.username?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                  {admin.name || admin.username || 'Admin'}
                </p>
                {getRoleBadge(admin.role)}
              </div>
              <svg className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'} group-hover:${isDark ? 'text-white' : 'text-black'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Menu */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className={`absolute right-0 mt-3 w-72 ${isDark ? 'bg-gray-900' : 'bg-white'} border border-primary-border rounded-xl shadow-lg z-20`}>
                  <div className="p-4 border-b border-primary-border-secondary">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-accent rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">
                          {admin.name?.charAt(0) || admin.username?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                          {admin.name || admin.username || 'Admin'}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                          {admin.email}
                        </p>
                        {getRoleBadge(admin.role)}
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/admin/profile');
                        setShowProfileMenu(false);
                      }}
                      className={`block w-full text-left px-4 py-3 text-sm ${isDark ? 'text-white' : 'text-black'} hover:${isDark ? 'bg-gray-800' : 'bg-gray-200'} transition-all duration-200`}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile Settings</span>
                      </div>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <svg className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;