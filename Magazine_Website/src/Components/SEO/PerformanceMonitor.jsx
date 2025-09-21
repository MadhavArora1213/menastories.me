import React, { useState, useEffect } from 'react';
import { seoService } from '../../services/seoService';

const PerformanceMonitor = ({
  pageUrl,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  className = ''
}) => {
  const [metrics, setMetrics] = useState(null);
  const [coreWebVitals, setCoreWebVitals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadPerformanceData();

    if (autoRefresh) {
      const interval = setInterval(loadPerformanceData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [pageUrl, autoRefresh, refreshInterval]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load performance metrics
      const metricsResponse = await seoService.getPerformanceMetrics({
        pageUrl,
        limit: 1
      });

      if (metricsResponse.data.metrics && metricsResponse.data.metrics.length > 0) {
        setMetrics(metricsResponse.data.metrics[0]);
      }

      // Load Core Web Vitals
      const vitalsResponse = await seoService.getCoreWebVitals('7d');
      setCoreWebVitals(vitalsResponse.data);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load performance data:', err);
      setError('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getVitalsColor = (value, thresholds) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.needsImprovement) return 'text-yellow-600';
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

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`performance-monitor bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Performance Monitor
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Real-time performance metrics and Core Web Vitals
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={loadPerformanceData}
              disabled={loading}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
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
        {/* Core Web Vitals */}
        {coreWebVitals && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Core Web Vitals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* LCP */}
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  LCP
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Largest Contentful Paint
                </div>
                {coreWebVitals.summary && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Good:</span>
                      <span className="text-green-600">{coreWebVitals.summary.goodLCP || 0}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Needs Work:</span>
                      <span className="text-yellow-600">{coreWebVitals.summary.needsImprovementLCP || 0}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Poor:</span>
                      <span className="text-red-600">{coreWebVitals.summary.poorLCP || 0}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* FID */}
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  FID
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  First Input Delay
                </div>
                {coreWebVitals.summary && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Good:</span>
                      <span className="text-green-600">{coreWebVitals.summary.goodFID || 0}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Needs Work:</span>
                      <span className="text-yellow-600">{coreWebVitals.summary.needsImprovementFID || 0}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Poor:</span>
                      <span className="text-red-600">{coreWebVitals.summary.poorFID || 0}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* CLS */}
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  CLS
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Cumulative Layout Shift
                </div>
                {coreWebVitals.summary && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Good:</span>
                      <span className="text-green-600">{coreWebVitals.summary.goodCLS || 0}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Needs Work:</span>
                      <span className="text-yellow-600">{coreWebVitals.summary.needsImprovementCLS || 0}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Poor:</span>
                      <span className="text-red-600">{coreWebVitals.summary.poorCLS || 0}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Performance Scores */}
        {metrics && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Performance Scores
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`text-center p-4 rounded-lg ${getScoreBgColor(metrics.performanceScore || 0)}`}>
                <div className={`text-2xl font-bold ${getScoreColor(metrics.performanceScore || 0)}`}>
                  {metrics.performanceScore || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Performance</div>
              </div>

              <div className={`text-center p-4 rounded-lg ${getScoreBgColor(metrics.accessibilityScore || 0)}`}>
                <div className={`text-2xl font-bold ${getScoreColor(metrics.accessibilityScore || 0)}`}>
                  {metrics.accessibilityScore || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accessibility</div>
              </div>

              <div className={`text-center p-4 rounded-lg ${getScoreBgColor(metrics.bestPracticesScore || 0)}`}>
                <div className={`text-2xl font-bold ${getScoreColor(metrics.bestPracticesScore || 0)}`}>
                  {metrics.bestPracticesScore || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Best Practices</div>
              </div>

              <div className={`text-center p-4 rounded-lg ${getScoreBgColor(metrics.seoScore || 0)}`}>
                <div className={`text-2xl font-bold ${getScoreColor(metrics.seoScore || 0)}`}>
                  {metrics.seoScore || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">SEO</div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Metrics */}
        {metrics && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Loading Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatTime(metrics.firstContentfulPaint || 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">First Contentful Paint</div>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatTime(metrics.largestContentfulPaint || 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Largest Contentful Paint</div>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {formatTime(metrics.domContentLoaded || 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">DOM Content Loaded</div>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatTime(metrics.loadComplete || 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Load Complete</div>
              </div>
            </div>
          </div>
        )}

        {/* Resource Metrics */}
        {metrics && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Resource Usage
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {formatBytes(metrics.totalSize || 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Size</div>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {metrics.totalRequests || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatBytes(metrics.htmlSize || 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">HTML Size</div>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {formatBytes(metrics.jsSize || 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">JavaScript Size</div>
              </div>
            </div>
          </div>
        )}

        {/* Device and Browser Info */}
        {metrics && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Device & Browser Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                  {metrics.deviceType || 'Unknown'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Device Type</div>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {metrics.screenResolution || 'Unknown'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Screen Resolution</div>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {metrics.connectionType || 'Unknown'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Connection Type</div>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {metrics.country || 'Unknown'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Location</div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Issues */}
        {metrics && metrics.performanceIssues && metrics.performanceIssues.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Performance Issues
            </h3>
            <div className="space-y-2">
              {metrics.performanceIssues.map((issue, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <svg className="h-5 w-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      {issue.title || 'Performance Issue'}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {issue.description || issue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimization Suggestions */}
        {metrics && metrics.optimizationSuggestions && metrics.optimizationSuggestions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Optimization Suggestions
            </h3>
            <div className="space-y-2">
              {metrics.optimizationSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {suggestion.title || 'Optimization Suggestion'}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {suggestion.description || suggestion}
                    </p>
                    {suggestion.impact && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Estimated impact: {suggestion.impact}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;