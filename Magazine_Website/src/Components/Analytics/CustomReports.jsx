import React, { useState } from 'react';
import analyticsService from '../../services/analyticsService';

const CustomReports = () => {
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    metrics: [],
    dateRange: 'last30days',
    filters: {},
    format: 'pdf',
    schedule: 'none'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const availableMetrics = [
    { id: 'page_views', label: 'Page Views', category: 'traffic' },
    { id: 'unique_visitors', label: 'Unique Visitors', category: 'traffic' },
    { id: 'bounce_rate', label: 'Bounce Rate', category: 'engagement' },
    { id: 'avg_session_duration', label: 'Avg. Session Duration', category: 'engagement' },
    { id: 'article_views', label: 'Article Views', category: 'content' },
    { id: 'newsletter_signups', label: 'Newsletter Signups', category: 'engagement' },
    { id: 'social_shares', label: 'Social Shares', category: 'social' },
    { id: 'search_queries', label: 'Search Queries', category: 'search' },
    { id: 'seo_impressions', label: 'SEO Impressions', category: 'seo' },
    { id: 'seo_clicks', label: 'SEO Clicks', category: 'seo' }
  ];

  const handleMetricToggle = (metricId) => {
    setReportConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(id => id !== metricId)
        : [...prev.metrics, metricId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportConfig.name.trim() || reportConfig.metrics.length === 0) {
      setError('Please provide a report name and select at least one metric.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Format the report config for the backend
      const formattedConfig = {
        name: reportConfig.name,
        description: reportConfig.description,
        reportType: 'comprehensive', // Default to comprehensive
        dateRange: analyticsService.getDateRanges()[reportConfig.dateRange] || analyticsService.getDateRanges().last30days,
        metrics: reportConfig.metrics,
        filters: reportConfig.filters || {},
        format: reportConfig.format
      };

      const response = await analyticsService.createCustomReport(formattedConfig);

      if (response.downloaded) {
        setSuccess(response.message);
      } else {
        setSuccess('Custom report created successfully! You can find it in your downloads folder.');
      }
    } catch (err) {
      console.error('Failed to create custom report:', err);
      setError('Failed to create custom report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const MetricCategory = ({ title, metrics, category }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
      <div className="space-y-2">
        {metrics.map(metric => (
          <label key={metric.id} className="flex items-center">
            <input
              type="checkbox"
              checked={reportConfig.metrics.includes(metric.id)}
              onChange={() => handleMetricToggle(metric.id)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {metric.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="custom-reports space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Custom Reports
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create and schedule custom analytics reports tailored to your needs.
        </p>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        </div>
      )}

      {/* Report Configuration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Report Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Report Name *
              </label>
              <input
                type="text"
                value={reportConfig.name}
                onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter report name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Range
              </label>
              <select
                value={reportConfig.dateRange}
                onChange={(e) => setReportConfig(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="last7days">Last 7 days</option>
                <option value="last30days">Last 30 days</option>
                <option value="last90days">Last 90 days</option>
                <option value="last12months">Last 12 months</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={reportConfig.description}
              onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Describe what this report covers..."
            />
          </div>
        </div>

        {/* Metrics Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Select Metrics *
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCategory
              title="Traffic"
              metrics={availableMetrics.filter(m => m.category === 'traffic')}
            />
            <MetricCategory
              title="Engagement"
              metrics={availableMetrics.filter(m => m.category === 'engagement')}
            />
            <MetricCategory
              title="Content"
              metrics={availableMetrics.filter(m => m.category === 'content')}
            />
            <MetricCategory
              title="Social Media"
              metrics={availableMetrics.filter(m => m.category === 'social')}
            />
            <MetricCategory
              title="Search"
              metrics={availableMetrics.filter(m => m.category === 'search')}
            />
            <MetricCategory
              title="SEO"
              metrics={availableMetrics.filter(m => m.category === 'seo')}
            />
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Export Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Format
              </label>
              <select
                value={reportConfig.format}
                onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Schedule
              </label>
              <select
                value={reportConfig.schedule}
                onChange={(e) => setReportConfig(prev => ({ ...prev, schedule: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="none">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || reportConfig.metrics.length === 0}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Creating Report...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomReports;