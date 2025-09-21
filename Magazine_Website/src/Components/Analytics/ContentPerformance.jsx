import React, { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';
import { formatDistanceToNow } from 'date-fns';

const ContentPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState('last30days');
  const [sortBy, setSortBy] = useState('recentViews');
  const [sortOrder, setSortOrder] = useState('DESC');

  useEffect(() => {
    loadData();
  }, [dateRange, sortBy, sortOrder]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...analyticsService.getDateRanges()[dateRange],
        sortBy,
        sortOrder
      };

      const response = await analyticsService.getContentPerformance(params);
      setData(response.data);
    } catch (err) {
      console.error('Failed to load content performance:', err);
      setError('Failed to load content performance data');
    } finally {
      setLoading(false);
    }
  };

  const PerformanceCard = ({ article, index }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-lg font-bold text-gray-500 dark:text-gray-400 mr-3">
              #{index + 1}
            </span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
              {article.title}
            </h3>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>By {article.author?.name || 'Unknown'}</span>
            <span>•</span>
            <span>{article.publishedAt ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true }) : 'No date'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {analyticsService.formatNumber(article.recentViews || 0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Recent Views</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {analyticsService.formatNumber(article.viewCount || 0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Views</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {article.avgReadTime ? `${Math.round(article.avgReadTime)}m` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Avg. Read Time</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {article.metrics?.comments || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Comments</div>
        </div>
      </div>
    </div>
  );

  const CategoryChart = ({ categoryData }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Performance by Category
      </h3>
      <div className="space-y-3">
        {categoryData?.map((category, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                index === 0 ? 'bg-blue-500' :
                index === 1 ? 'bg-green-500' :
                index === 2 ? 'bg-purple-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {category.categoryName || 'Uncategorized'}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {analyticsService.formatNumber(category.views)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">views</div>
            </div>
          </div>
        ))}
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

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
        </div>
        <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-4 py-2 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="content-performance space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Content Performance
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analyze how your content performs across different metrics.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="last7days">Last 7 days</option>
            <option value="last30days">Last 30 days</option>
            <option value="last90days">Last 90 days</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="recentViews-DESC">Most Viewed (Recent)</option>
            <option value="viewCount-DESC">Most Viewed (Total)</option>
            <option value="avgReadTime-DESC">Longest Read Time</option>
            <option value="publishedAt-DESC">Recently Published</option>
            <option value="publishedAt-ASC">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.articlePerformance?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsService.formatNumber(
                  data?.articlePerformance?.reduce((sum, article) => sum + (article.recentViews || 0), 0) || 0
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👁️</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Read Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.articlePerformance?.length > 0
                  ? `${Math.round(
                      data.articlePerformance.reduce((sum, article) => sum + (article.avgReadTime || 0), 0) /
                      data.articlePerformance.length
                    )}m`
                  : '0m'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.categoryPerformance?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📂</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Articles */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Top Performing Articles
            </h3>
            <div className="space-y-4">
              {data?.articlePerformance?.slice(0, 10).map((article, index) => (
                <PerformanceCard key={article.id} article={article} index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div>
          <CategoryChart categoryData={data?.categoryPerformance} />
        </div>
      </div>

      {/* Author Performance Table */}
      {data?.authorPerformance && data.authorPerformance.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Author Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Articles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Avg. Views/Article
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.authorPerformance.map((author, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {author.authorName || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {author.totalArticles || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {analyticsService.formatNumber(author.totalViews || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {analyticsService.formatNumber(author.avgViewsPerArticle || 0)}
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

export default ContentPerformance;