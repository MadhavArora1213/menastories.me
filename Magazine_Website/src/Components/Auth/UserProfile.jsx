import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaHeart, FaBookmark, FaCalendarAlt, FaFire, FaTrophy, FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaCog } from 'react-icons/fa';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [savedArticles, setSavedArticles] = useState([]);
  const [likedArticles, setLikedArticles] = useState([]);
  const [userStats, setUserStats] = useState({
    dailyStreak: 0,
    totalArticlesRead: 0,
    totalLikes: 0,
    totalSaves: 0,
    joinDate: null,
    lastActive: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);

      // Load saved articles using authService
      try {
        const savedResponse = await authService.api.get('/user/saved-articles');
        setSavedArticles(savedResponse.data.articles || []);
      } catch (error) {
        console.error('Error loading saved articles:', error);
        // Don't show error for missing endpoints, just set empty array
        setSavedArticles([]);
      }

      // Load liked articles using authService
      try {
        const likedResponse = await authService.api.get('/user/liked-articles');
        setLikedArticles(likedResponse.data.articles || []);
      } catch (error) {
        console.error('Error loading liked articles:', error);
        // Don't show error for missing endpoints, just set empty array
        setLikedArticles([]);
      }

      // Load user stats using authService
      try {
        const statsResponse = await authService.api.get('/user/stats');
        setUserStats(statsResponse.data.stats || userStats);
      } catch (error) {
        console.error('Error loading user stats:', error);
        // Don't show error for missing endpoints, just use default stats
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSaved = async (articleId) => {
    try {
      // Use toggle endpoint to unsave the article
      await authService.api.post(`/user/saved-articles/${articleId}/toggle`);
      setSavedArticles(prev => prev.filter(article => article.id !== articleId));
      toast.success('Article removed from saved');
    } catch (error) {
      console.error('Error removing saved article:', error);
      toast.error('Failed to remove saved article');
    }
  };

  const handleRemoveLiked = async (articleId) => {
    try {
      // Use toggle endpoint to unlike the article
      await authService.api.post(`/user/liked-articles/${articleId}/toggle`);
      setLikedArticles(prev => prev.filter(article => article.id !== articleId));
      toast.success('Article unliked');
    } catch (error) {
      console.error('Error removing liked article:', error);
      toast.error('Failed to unlike article');
    }
  };

  const getStreakColor = (streak) => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 14) return 'text-blue-600';
    if (streak >= 7) return 'text-green-600';
    if (streak >= 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStreakIcon = (streak) => {
    if (streak >= 30) return <FaTrophy className="text-purple-600" />;
    if (streak >= 14) return <FaFire className="text-blue-600" />;
    if (streak >= 7) return <FaFire className="text-green-600" />;
    return <FaFire className="text-gray-600" />;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaUser className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Not authenticated</h3>
          <p className="mt-1 text-sm text-gray-500">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          <div className="relative px-6 pb-6">
            <div className="flex items-center">
              <div className="relative -mt-16">
                <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="w-16 h-16 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="ml-6 mt-4">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <FaEnvelope className="mr-2" />
                  {user.email}
                </p>
                {user.phoneNumber && (
                  <p className="text-gray-600 flex items-center mt-1">
                    <FaPhone className="mr-2" />
                    {user.phoneNumber}
                  </p>
                )}
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role?.name || 'User'}
                  </span>
                  {user.isMfaEnabled && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FaShieldAlt className="mr-1" />
                      MFA Enabled
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {getStreakIcon(userStats.dailyStreak)}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Daily Streak</p>
                <p className={`text-2xl font-bold ${getStreakColor(userStats.dailyStreak)}`}>
                  {userStats.dailyStreak}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaBookmark className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Articles Read</p>
                <p className="text-2xl font-bold text-blue-600">{userStats.totalArticlesRead}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaHeart className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-red-600">{userStats.totalLikes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCalendarAlt className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Member Since</p>
                <p className="text-sm font-bold text-green-600">
                  {userStats.joinDate ? new Date(userStats.joinDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: FaUser },
                { id: 'saved', label: 'Saved Articles', icon: FaBookmark },
                { id: 'liked', label: 'Liked Articles', icon: FaHeart },
                { id: 'settings', label: 'Settings', icon: FaCog }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Account Information</h4>
                    <dl className="mt-2 space-y-2">
                      <div>
                        <dt className="text-sm text-gray-600">Email Verified</dt>
                        <dd className="text-sm text-gray-900">{user.isEmailVerified ? 'Yes' : 'No'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">Two-Factor Authentication</dt>
                        <dd className="text-sm text-gray-900">{user.isMfaEnabled ? 'Enabled' : 'Disabled'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">Last Login</dt>
                        <dd className="text-sm text-gray-900">
                          {userStats.lastActive ? new Date(userStats.lastActive).toLocaleString() : 'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Activity Summary</h4>
                    <dl className="mt-2 space-y-2">
                      <div>
                        <dt className="text-sm text-gray-600">Articles Saved</dt>
                        <dd className="text-sm text-gray-900">{userStats.totalSaves}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">Articles Liked</dt>
                        <dd className="text-sm text-gray-900">{userStats.totalLikes}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">Reading Streak</dt>
                        <dd className={`text-sm font-medium ${getStreakColor(userStats.dailyStreak)}`}>
                          {userStats.dailyStreak} days
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Saved Articles</h3>
                  <p className="text-sm text-gray-600">Articles you've saved for later reading</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {isLoading ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : savedArticles.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <FaBookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No saved articles yet</p>
                    </div>
                  ) : (
                    savedArticles.map((article) => (
                      <div key={article.id} className="p-6 flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{article.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{article.excerpt}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Saved on {new Date(article.savedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <a
                            href={`/articles/${article.slug}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Read
                          </a>
                          <button
                            onClick={() => handleRemoveSaved(article.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'liked' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Liked Articles</h3>
                  <p className="text-sm text-gray-600">Articles you've liked</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {isLoading ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    </div>
                  ) : likedArticles.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <FaHeart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No liked articles yet</p>
                    </div>
                  ) : (
                    likedArticles.map((article) => (
                      <div key={article.id} className="p-6 flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{article.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{article.excerpt}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Liked on {new Date(article.likedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <a
                            href={`/articles/${article.slug}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Read
                          </a>
                          <button
                            onClick={() => handleRemoveLiked(article.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Unlike
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div>
                    <button
                      onClick={() => window.location.href = '/mfa-setup'}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {user.isMfaEnabled ? 'Manage MFA' : 'Setup MFA'}
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => window.location.href = '/newsletter-preferences'}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Newsletter Preferences
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={logout}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;