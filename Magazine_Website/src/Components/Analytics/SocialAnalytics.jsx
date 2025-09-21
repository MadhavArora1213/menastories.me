import React, { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';

const SocialAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedPlatform, setSelectedPlatform] = useState('');

  useEffect(() => {
    loadData();
  }, [dateRange, selectedPlatform]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...analyticsService.getDateRanges()[dateRange],
        ...(selectedPlatform && { platform: selectedPlatform })
      };

      const response = await analyticsService.getSocialAnalytics(params);
      setData(response.data);
    } catch (err) {
      console.error('Failed to load social analytics:', err);
      setError('Failed to load social analytics data');
    } finally {
      setLoading(false);
    }
  };

  const PlatformCard = ({ platform, data }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
          {platform}
        </h3>
        <div className="text-2xl">
          {platform === 'facebook' ? '📘' :
           platform === 'twitter' ? '🐦' :
           platform === 'instagram' ? '📷' :
           platform === 'linkedin' ? '💼' :
           platform === 'youtube' ? '📺' : '📱'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {analyticsService.formatNumber(data.totalLikes || 0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Likes</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {analyticsService.formatNumber(data.totalShares || 0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Shares</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {analyticsService.formatNumber(data.totalComments || 0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Comments</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
            {analyticsService.formatNumber(data.totalViews || 0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Engagement Rate</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {data.avgEngagementRate ? `${data.avgEngagementRate.toFixed(1)}%` : '0%'}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="social-analytics space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Social Media Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your social media performance across all platforms.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="youtube">YouTube</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="last7days">Last 7 days</option>
            <option value="last30days">Last 30 days</option>
            <option value="last90days">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.platformSummary?.map((platform, index) => (
          <PlatformCard key={index} platform={platform.platform} data={platform} />
        ))}
      </div>

      {/* Detailed Social Data */}
      {data?.socialData && data.socialData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Social Media Posts
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Likes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Comments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.socialData.slice(0, 20).map((post, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">
                          {post.platform === 'facebook' ? '📘' :
                           post.platform === 'twitter' ? '🐦' :
                           post.platform === 'instagram' ? '📷' :
                           post.platform === 'linkedin' ? '💼' :
                           post.platform === 'youtube' ? '📺' : '📱'}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {post.platform}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {post.contentType === 'article' ? 'Article Post' : 'Media Post'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {post.postUrl}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {analyticsService.formatNumber(post.likes || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {analyticsService.formatNumber(post.shares || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {analyticsService.formatNumber(post.comments || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {analyticsService.formatNumber(post.views || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {analyticsService.formatNumber(post.engagement || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(post.date).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialAnalytics;