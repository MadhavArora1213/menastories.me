import React, { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';

const SEOAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedKeyword, setSelectedKeyword] = useState('');

  useEffect(() => {
    loadData();
  }, [dateRange, selectedKeyword]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...analyticsService.getDateRanges()[dateRange],
        ...(selectedKeyword && { keyword: selectedKeyword })
      };

      const response = await analyticsService.getSEOAnalytics(params);
      setData(response.data);
    } catch (err) {
      console.error('Failed to load SEO analytics:', err);
      setError('Failed to load SEO analytics data');
    } finally {
      setLoading(false);
    }
  };

  const KeywordPerformance = ({ keywords }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Keyword Performance
      </h3>
      <div className="space-y-3">
        {keywords?.map((keyword, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                  {index + 1}.
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {keyword.keyword}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 ml-6">
                <span>Position: {keyword.avgPosition?.toFixed(1) || 'N/A'}</span>
                <span>CTR: {keyword.avgCTR?.toFixed(1) || 0}%</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {analyticsService.formatNumber(keyword.totalImpressions || 0)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">impressions</div>
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

  return (
    <div className="seo-analytics space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            SEO Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor your search engine performance and keyword rankings.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Filter by keyword..."
            value={selectedKeyword}
            onChange={(e) => setSelectedKeyword(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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

      {/* SEO Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Position</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.keywordSummary?.[0]?.avgPosition?.toFixed(1) || 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Impressions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsService.formatNumber(
                  data?.keywordSummary?.reduce((sum, k) => sum + (k.totalImpressions || 0), 0) || 0
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsService.formatNumber(
                  data?.keywordSummary?.reduce((sum, k) => sum + (k.totalClicks || 0), 0) || 0
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🖱️</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. CTR</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.keywordSummary?.length > 0
                  ? (data.keywordSummary.reduce((sum, k) => sum + (k.avgCTR || 0), 0) / data.keywordSummary.length).toFixed(1)
                  : '0'
                }%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Keyword Performance */}
      <KeywordPerformance keywords={data?.keywordSummary} />

      {/* Detailed SEO Data Table */}
      {data?.seoData && data.seoData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Detailed SEO Data
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Keyword
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Impressions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Search Engine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.seoData.map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {record.keyword}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {record.position || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {analyticsService.formatNumber(record.impressions || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {analyticsService.formatNumber(record.clicks || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {record.ctr ? `${record.ctr.toFixed(1)}%` : '0%'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white capitalize">
                        {record.searchEngine}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(record.date).toLocaleDateString()}
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

export default SEOAnalytics;