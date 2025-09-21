import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaChartLine, FaNewspaper, FaBookOpen, FaCalendarAlt, FaBookmark, FaFire, FaTrophy } from 'react-icons/fa';
import { userActivityTracker } from '../utils/userActivityTracker';

const Dashboard = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [userStats, setUserStats] = useState({
    articlesRead: 0,
    dailyStreak: 0,
    savedArticles: 0,
    readingTime: 0,
    lastActive: null
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Load user activity data
  useEffect(() => {
    if (user) {
      loadUserActivity();
    }
  }, [user]);

  const loadUserActivity = () => {
    if (user?.id) {
      const stats = userActivityTracker.getUserStats(user.id);
      setUserStats({
        articlesRead: stats.articlesRead,
        dailyStreak: stats.dailyStreak,
        savedArticles: stats.savedArticles,
        readingTime: stats.readingTime,
        lastActive: stats.lastActive
      });
      setRecentArticles(stats.recentArticles.slice(0, 5));
      setSavedArticles(stats.savedArticlesList.slice(0, 5));
    }
  };


  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <FaUser className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.name || 'User'}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <FaUser className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Account Status
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <FaChartLine className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Role
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.role?.name || 'User'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <FaNewspaper className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Member Since
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reading Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <FaBookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Articles Read
                </h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userStats.articlesRead}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                <FaFire className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Daily Streak
                </h3>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {userStats.dailyStreak} days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <FaBookmark className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Saved Articles
                </h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {userStats.savedArticles}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <FaCalendarAlt className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Reading Time
                </h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(userStats.readingTime / 60)} min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recently Read Articles */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <FaBookOpen className="mr-2 text-blue-600" />
              Recently Read Articles
            </h2>
            {recentArticles.length > 0 ? (
              <div className="space-y-4">
                {recentArticles.map((article, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {article.title || `Article ${index + 1}`}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {article.readDate ? new Date(article.readDate).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {article.readTime ? `${article.readTime} min` : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaBookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No articles read yet</p>
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm mt-2 inline-block"
                >
                  Start reading →
                </Link>
              </div>
            )}
          </div>

          {/* Saved Articles */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <FaBookmark className="mr-2 text-green-600" />
              Saved Articles
            </h2>
            {savedArticles.length > 0 ? (
              <div className="space-y-4">
                {savedArticles.map((article, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {article.title || `Saved Article ${index + 1}`}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {article.savedDate ? new Date(article.savedDate).toLocaleDateString() : 'Recently saved'}
                      </p>
                    </div>
                    <Link
                      to={article.url || '/'}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                    >
                      Read →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaBookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No saved articles yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Save articles by clicking the bookmark icon
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <FaTrophy className="mr-2 text-yellow-600" />
            Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${userStats.articlesRead >= 1 ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-center">
                <FaBookOpen className={`h-8 w-8 mr-3 ${userStats.articlesRead >= 1 ? 'text-yellow-600' : 'text-gray-400'}`} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">First Article</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userStats.articlesRead >= 1 ? 'Completed!' : 'Read your first article'}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${userStats.dailyStreak >= 7 ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-center">
                <FaFire className={`h-8 w-8 mr-3 ${userStats.dailyStreak >= 7 ? 'text-yellow-600' : 'text-gray-400'}`} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Week Warrior</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userStats.dailyStreak >= 7 ? 'Completed!' : '7-day reading streak'}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${userStats.savedArticles >= 5 ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-center">
                <FaBookmark className={`h-8 w-8 mr-3 ${userStats.savedArticles >= 5 ? 'text-yellow-600' : 'text-gray-400'}`} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Collector</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userStats.savedArticles >= 5 ? 'Completed!' : 'Save 5 articles'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/profile"
              className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <FaUser className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
              <span className="text-gray-900 dark:text-white font-medium">Update Profile</span>
            </Link>

            <Link
              to="/"
              className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <FaNewspaper className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
              <span className="text-gray-900 dark:text-white font-medium">Browse Articles</span>
            </Link>

            <Link
              to="/newsletter-signup"
              className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <FaChartLine className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
              <span className="text-gray-900 dark:text-white font-medium">Newsletter</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;