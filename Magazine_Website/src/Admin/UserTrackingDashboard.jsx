import React, { useState, useEffect } from 'react';
import { FaUsers, FaBookOpen, FaHeart, FaBookmark, FaCalendarAlt, FaFire, FaEye, FaShare, FaTrophy } from 'react-icons/fa';
import toast from 'react-hot-toast';

const UserTrackingDashboard = () => {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalArticles: 0,
    totalReads: 0,
    totalLikes: 0,
    totalSaves: 0,
    totalShares: 0
  });
  const [topUsers, setTopUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [engagementMetrics, setEngagementMetrics] = useState({
    averageSessionDuration: 0,
    averageArticlesPerUser: 0,
    mostReadCategory: '',
    mostLikedCategory: '',
    peakActivityHour: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load overall statistics
      const statsResponse = await fetch('/api/admin/user-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setUserStats(statsData.stats || userStats);
      }

      // Load top users
      const topUsersResponse = await fetch('/api/admin/top-users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (topUsersResponse.ok) {
        const topUsersData = await topUsersResponse.json();
        setTopUsers(topUsersData.users || []);
      }

      // Load recent activity
      const activityResponse = await fetch('/api/admin/recent-activity', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities || []);
      }

      // Load engagement metrics
      const engagementResponse = await fetch('/api/admin/engagement-metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (engagementResponse.ok) {
        const engagementData = await engagementResponse.json();
        setEngagementMetrics(engagementData.metrics || engagementMetrics);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'read': return <FaBookOpen className="text-blue-500" />;
      case 'like': return <FaHeart className="text-red-500" />;
      case 'save': return <FaBookmark className="text-green-500" />;
      case 'share': return <FaShare className="text-purple-500" />;
      default: return <FaEye className="text-gray-500" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'read':
        return `read "${activity.articleTitle}"`;
      case 'like':
        return `liked "${activity.articleTitle}"`;
      case 'save':
        return `saved "${activity.articleTitle}"`;
      case 'share':
        return `shared "${activity.articleTitle}" on ${activity.platform}`;
      default:
        return activity.description || 'performed an action';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">User Tracking Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor user engagement and activity patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaUsers className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-600">{formatNumber(userStats.totalUsers)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaBookOpen className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Articles Read</p>
              <p className="text-2xl font-bold text-green-600">{formatNumber(userStats.totalReads)}</p>
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
              <p className="text-2xl font-bold text-red-600">{formatNumber(userStats.totalLikes)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaBookmark className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Articles Saved</p>
              <p className="text-2xl font-bold text-purple-600">{formatNumber(userStats.totalSaves)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Session Duration</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDuration(engagementMetrics.averageSessionDuration)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Articles per User</span>
              <span className="text-sm font-medium text-gray-900">
                {engagementMetrics.averageArticlesPerUser.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Most Read Category</span>
              <span className="text-sm font-medium text-gray-900">
                {engagementMetrics.mostReadCategory || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Peak Activity Hour</span>
              <span className="text-sm font-medium text-gray-900">
                {engagementMetrics.peakActivityHour}:00
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Active Users</h3>
          <div className="space-y-3">
            {topUsers.slice(0, 5).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {index === 0 && <FaTrophy className="h-5 w-5 text-yellow-500" />}
                    {index === 1 && <FaTrophy className="h-5 w-5 text-gray-400" />}
                    {index === 2 && <FaTrophy className="h-5 w-5 text-amber-600" />}
                    {index > 2 && <span className="text-sm text-gray-500 w-5 text-center">{index + 1}</span>}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.activityScore}</p>
                  <p className="text-xs text-gray-500">score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent User Activity</h3>
          <p className="text-sm text-gray-600">Latest user interactions and engagement</p>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No recent activity</p>
            </div>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{activity.userName}</p>
                    <p className="text-sm text-gray-600">
                      {getActivityText(activity)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                  {activity.deviceType && (
                    <p className="text-xs text-gray-400">{activity.deviceType}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Streaks and Achievements */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Streaks & Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-3">
              <FaFire className="h-8 w-8 text-orange-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900">Reading Streaks</h4>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {topUsers.filter(u => u.currentStreak >= 7).length}
            </p>
            <p className="text-xs text-gray-500">Users with 7+ day streaks</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
              <FaBookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900">Power Readers</h4>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {topUsers.filter(u => u.articlesRead >= 50).length}
            </p>
            <p className="text-xs text-gray-500">Users who read 50+ articles</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
              <FaShare className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900">Social Sharers</h4>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {topUsers.filter(u => u.sharesCount >= 10).length}
            </p>
            <p className="text-xs text-gray-500">Users who shared 10+ articles</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTrackingDashboard;