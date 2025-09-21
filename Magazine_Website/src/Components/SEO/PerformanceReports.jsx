import React, { useState, useEffect } from 'react';
import { seoService } from '../../services/seoService';
import PerformanceMonitor from './PerformanceMonitor';

const PerformanceReports = ({
  className = '',
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutes
}) => {
  const [reports, setReports] = useState({
    overview: null,
    coreWebVitals: null,
    pagePerformance: [],
    trends: null
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedPage, setSelectedPage] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const timeframes = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  useEffect(() => {
    loadReports();

    if (autoRefresh) {
      const interval = setInterval(loadReports, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [selectedTimeframe, autoRefresh, refreshInterval]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all performance data concurrently
      const [coreWebVitals, performanceMetrics] = await Promise.all([
        seoService.getCoreWebVitals(selectedTimeframe),
        seoService.getPerformanceMetrics({
          limit: 50,
          startDate: getStartDate(selectedTimeframe)
        })
      ]);

      // Process the data
      const processedData = processPerformanceData(coreWebVitals.data, performanceMetrics.data);

      setReports({
        overview: processedData.overview,
        coreWebVitals: processedData.coreWebVitals,
        pagePerformance: processedData.pagePerformance,
        trends: processedData.trends
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load performance reports:', err);
      setError('Failed to load performance reports');
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (timeframe) => {
    const now = new Date();
    switch (timeframe) {
      case '1d':
        now.setDate(now.getDate() - 1);
        break;
      case '7d':
        now.setDate(now.getDate() - 7);
        break;
      case '30d':
        now.setDate(now.getDate() - 30);
        break;
      case '90d':
        now.setDate(now.getDate() - 90);
        break;
    }
    return now.toISOString().split('T')[0];
  };

  const processPerformanceData = (coreWebVitals, performanceMetrics) => {
    const overview = {
      totalPages: performanceMetrics.metrics?.length || 0,
      averageLCP: 0,
      averageFID: 0,
      averageCLS: 0,
      averagePerformanceScore: 0,
      goodVitalsPercentage: 0
    };

    if (performanceMetrics.metrics && performanceMetrics.metrics.length > 0) {
      const metrics = performanceMetrics.metrics;

      // Calculate averages
      overview.averageLCP = metrics.reduce((sum, m) => sum + (m.largestContentfulPaint || 0), 0) / metrics.length;
      overview.averageFID = metrics.reduce((sum, m) => sum + (m.firstInputDelay || 0), 0) / metrics.length;
      overview.averageCLS = metrics.reduce((sum, m) => sum + (m.cumulativeLayoutShift || 0), 0) / metrics.length;
      overview.averagePerformanceScore = metrics.reduce((sum, m) => sum + (m.performanceScore || 0), 0) / metrics.length;

      // Calculate good vitals percentage
      const goodVitals = metrics.filter(m =>
        (m.largestContentfulPaint || 0) <= 2500 &&
        (m.firstInputDelay || 0) <= 100 &&
        (m.cumulativeLayoutShift || 0) <= 0.1
      ).length;
      overview.goodVitalsPercentage = (goodVitals / metrics.length) * 100;
    }

    // Process page performance
    const pagePerformance = performanceMetrics.metrics?.map(metric => ({
      url: metric.pageUrl,
      performanceScore: metric.performanceScore || 0,
      lcp: metric.largestContentfulPaint || 0,
      fid: metric.firstInputDelay || 0,
      cls: metric.cumulativeLayoutShift || 0,
      loadTime: metric.loadComplete || 0,
      pageSize: metric.totalSize || 0,
      requests: metric.totalRequests || 0
    })) || [];

    return {
      overview,
      coreWebVitals,
      pagePerformance,
      trends: calculateTrends(performanceMetrics.metrics || [])
    };
  };

  const calculateTrends = (metrics) => {
    if (metrics.length < 2) return null;

    const sortedMetrics = metrics.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const recent = sortedMetrics.slice(-10); // Last 10 measurements
    const previous = sortedMetrics.slice(-20, -10); // Previous 10 measurements

    const calculateAverage = (arr, field) =>
      arr.reduce((sum, m) => sum + (m[field] || 0), 0) / arr.length;

    return {
      lcp: {
        current: calculateAverage(recent, 'largestContentfulPaint'),
        previous: calculateAverage(previous, 'largestContentfulPaint'),
        trend: calculateAverage(recent, 'largestContentfulPaint') - calculateAverage(previous, 'largestContentfulPaint')
      },
      performanceScore: {
        current: calculateAverage(recent, 'performanceScore'),
        previous: calculateAverage(previous, 'performanceScore'),
        trend: calculateAverage(recent, 'performanceScore') - calculateAverage(previous, 'performanceScore')
      }
    };
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVitalsColor = (value, good, needsImprovement) => {
    if (value <= good) return 'text-green-600';
    if (value <= needsImprovement) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return '📈';
    if (trend < 0) return '📉';
    return '➡️';
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading && !reports.overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`performance-reports bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Performance Reports
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive performance analytics and Core Web Vitals tracking
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={loadReports}
              disabled={loading}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center space-x-2 mt-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Timeframe:</span>
          {timeframes.map(timeframe => (
            <button
              key={timeframe.value}
              onClick={() => setSelectedTimeframe(timeframe.value)}
              className={`px-3 py-1 text-sm rounded ${
                selectedTimeframe === timeframe.value
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <div className="p-6 space-y-8">
        {/* Overview Cards */}
        {reports.overview && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Performance Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {reports.overview.totalPages}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pages Monitored</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className={`text-2xl font-bold ${getScoreColor(reports.overview.averagePerformanceScore)}`}>
                  {reports.overview.averagePerformanceScore.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Performance Score</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className={`text-2xl font-bold ${getVitalsColor(reports.overview.averageLCP, 2500, 4000)}`}>
                  {formatTime(reports.overview.averageLCP)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg LCP</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className={`text-2xl font-bold ${getVitalsColor(reports.overview.goodVitalsPercentage, 75, 50)}`}>
                  {reports.overview.goodVitalsPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Good Core Web Vitals</div>
              </div>
            </div>
          </div>
        )}

        {/* Trends */}
        {reports.trends && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Performance Trends
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">LCP Trend</span>
                  <span className={`text-sm ${getTrendColor(reports.trends.lcp.trend)}`}>
                    {getTrendIcon(reports.trends.lcp.trend)} {Math.abs(reports.trends.lcp.trend).toFixed(0)}ms
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatTime(reports.trends.lcp.current)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Previous: {formatTime(reports.trends.lcp.previous)}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Performance Score Trend</span>
                  <span className={`text-sm ${getTrendColor(reports.trends.performanceScore.trend)}`}>
                    {getTrendIcon(reports.trends.performanceScore.trend)} {Math.abs(reports.trends.performanceScore.trend).toFixed(1)}
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {reports.trends.performanceScore.current.toFixed(1)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Previous: {reports.trends.performanceScore.previous.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Performance Table */}
        {reports.pagePerformance.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Page Performance Details
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Page URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Performance Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      LCP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      FID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      CLS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Load Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reports.pagePerformance.slice(0, 10).map((page, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white truncate max-w-xs">
                          {page.url}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getScoreColor(page.performanceScore)}`}>
                          {page.performanceScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${getVitalsColor(page.lcp, 2500, 4000)}`}>
                          {formatTime(page.lcp)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${getVitalsColor(page.fid, 100, 300)}`}>
                          {formatTime(page.fid)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${getVitalsColor(page.cls, 0.1, 0.25)}`}>
                          {page.cls.toFixed(3)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatTime(page.loadTime)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedPage(page)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Performance Monitor */}
        {selectedPage && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Detailed Performance Analysis
              </h3>
              <button
                onClick={() => setSelectedPage(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PerformanceMonitor
              pageUrl={selectedPage.url}
              autoRefresh={false}
              className="border border-gray-200 dark:border-gray-700 rounded-lg"
            />
          </div>
        )}

        {/* Recommendations */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Performance Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                🚀 Quick Wins
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Optimize and compress images</li>
                <li>• Enable browser caching</li>
                <li>• Minify CSS and JavaScript</li>
                <li>• Use a CDN for static assets</li>
                <li>• Implement lazy loading</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                📈 Advanced Optimizations
              </h4>
              <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                <li>• Implement code splitting</li>
                <li>• Optimize database queries</li>
                <li>• Use server-side rendering</li>
                <li>• Implement service workers</li>
                <li>• Monitor third-party scripts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReports;