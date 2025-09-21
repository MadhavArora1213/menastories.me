import React, { useState, useEffect } from 'react';
import {
  SEOManager,
  MetaTagManager,
  SchemaBuilder,
  SitemapGenerator,
  PerformanceMonitor,
  PerformanceReports
} from '../../Components/SEO';
import seoService from '../../services/seoService';
import SEOEditor from './SEOEditor';
import BulkSEOEditor from './BulkSEOEditor';
import SEOAnalytics from './SEOAnalytics';
import SEOSuggestions from './SEOSuggestions';

const SEOManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedContent, setSelectedContent] = useState({
    id: null,
    type: 'articles',
    title: ''
  });
  const [seoData, setSeoData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contentTypes, setContentTypes] = useState([]);
  const [bulkData, setBulkData] = useState([]);
  const [suggestions, setSuggestions] = useState(null);

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      description: 'SEO dashboard and analytics'
    },
    {
      id: 'content-seo',
      label: 'Content SEO',
      icon: '📝',
      description: 'Manage SEO for individual content items'
    },
    {
      id: 'bulk-seo',
      label: 'Bulk SEO',
      icon: '📦',
      description: 'Bulk update SEO data across content'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      description: 'SEO analytics and insights'
    },
    {
      id: 'suggestions',
      label: 'AI Suggestions',
      icon: '🤖',
      description: 'AI-powered SEO suggestions'
    },
    {
      id: 'schema',
      label: 'Schema Markup',
      icon: '📋',
      description: 'Structured data and rich snippets'
    },
    {
      id: 'sitemaps',
      label: 'Sitemaps',
      icon: '🗺️',
      description: 'XML sitemap generation and management'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: '⚡',
      description: 'Core Web Vitals and performance monitoring'
    }
  ];

  useEffect(() => {
    loadContentTypes();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics' && selectedContent.type) {
      loadAnalytics();
    }
  }, [activeTab, selectedContent.type]);

  const loadContentTypes = async () => {
    try {
      const types = await seoService.getContentTypes();
      setContentTypes(types.contentTypes || []);
    } catch (error) {
      console.error('Failed to load content types:', error);
    }
  };

  const loadAnalytics = async () => {
    if (!selectedContent.type) return;

    try {
      setLoading(true);
      const data = await seoService.getSEOAnalytics(selectedContent.type);
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBulkData = async (contentType) => {
    try {
      setLoading(true);
      const data = await seoService.getBulkSEOData(contentType);
      setBulkData(data.results || []);
    } catch (error) {
      console.error('Failed to load bulk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentSelect = (content) => {
    setSelectedContent(content);
    if (content.id && content.type) {
      loadSEOData(content.type, content.id);
    }
  };

  const loadSEOData = async (contentType, id) => {
    try {
      setLoading(true);
      const data = await seoService.getSEOData(contentType, id);
      setSeoData(data.seo);
    } catch (error) {
      console.error('Failed to load SEO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSEOData = async (seoUpdates) => {
    try {
      setLoading(true);
      await seoService.updateSEOData(selectedContent.type, selectedContent.id, seoUpdates);
      setSeoData({ ...seoData, ...seoUpdates });
      // Reload analytics if on analytics tab
      if (activeTab === 'analytics') {
        loadAnalytics();
      }
    } catch (error) {
      console.error('Failed to update SEO data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    if (!selectedContent.id || !selectedContent.type) return;

    try {
      setLoading(true);
      const data = await seoService.generateSEOSuggestions(selectedContent.type, selectedContent.id);
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* SEO Overview Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {analytics && (
                <>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Total Content</p>
                        <p className="text-2xl font-bold">{analytics.totalContent || 0}</p>
                      </div>
                      <svg className="h-8 w-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-blue-100 text-xs mt-2">Content items indexed</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Title Coverage</p>
                        <p className="text-2xl font-bold">{analytics.seoCoverage?.title?.percentage || 0}%</p>
                      </div>
                      <svg className="h-8 w-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <p className="text-green-100 text-xs mt-2">{analytics.seoCoverage?.title?.count || 0} items with titles</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Description Coverage</p>
                        <p className="text-2xl font-bold">{analytics.seoCoverage?.description?.percentage || 0}%</p>
                      </div>
                      <svg className="h-8 w-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-purple-100 text-xs mt-2">{analytics.seoCoverage?.description?.count || 0} items with descriptions</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">SEO Priority</p>
                        <p className="text-2xl font-bold">
                          {analytics.recommendations?.priority === 'high' ? 'High' :
                           analytics.recommendations?.priority === 'medium' ? 'Medium' : 'Low'}
                        </p>
                      </div>
                      <svg className="h-8 w-8 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <p className="text-orange-100 text-xs mt-2">
                      {analytics.recommendations?.missingSEO?.length || 0} items need SEO
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Content Type Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Select Content Type for Analysis
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {contentTypes.map((contentType) => (
                  <button
                    key={contentType}
                    onClick={() => {
                      setSelectedContent({ ...selectedContent, type: contentType });
                      setActiveTab('analytics');
                    }}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedContent.type === contentType
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">
                        {contentType === 'articles' ? '📝' :
                         contentType === 'videoArticles' ? '🎥' :
                         contentType === 'events' ? '📅' :
                         contentType === 'lists' ? '📋' : '📄'}
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {seoService.getContentTypeDisplayName(contentType)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'content-seo':
        return (
          <div className="space-y-6">
            {/* Content Type and Item Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Select Content to Edit SEO
              </h3>
              <div className="space-y-4">
                {/* Content Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content Type
                  </label>
                  <select
                    value={selectedContent.type}
                    onChange={(e) => setSelectedContent({ ...selectedContent, type: e.target.value, id: null })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select content type...</option>
                    {contentTypes.map((contentType) => (
                      <option key={contentType} value={contentType}>
                        {seoService.getContentTypeDisplayName(contentType)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content Item Selection - This would need to be implemented with actual content fetching */}
                {selectedContent.type && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content Item
                    </label>
                    <select
                      value={selectedContent.id || ''}
                      onChange={(e) => {
                        const id = e.target.value;
                        if (id) {
                          handleContentSelect({
                            ...selectedContent,
                            id: id,
                            title: e.target.options[e.target.selectedIndex].text
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select content item...</option>
                      {/* This would be populated with actual content items */}
                      <option value="1">Sample Content Item 1</option>
                      <option value="2">Sample Content Item 2</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* SEO Editor */}
            {selectedContent.id && seoData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  SEO Editor - {selectedContent.title}
                </h3>
                <SEOEditor
                  contentType={selectedContent.type}
                  seoData={seoData}
                  onUpdate={updateSEOData}
                  loading={loading}
                />
              </div>
            )}
          </div>
        );

      case 'bulk-seo':
        return (
          <div className="space-y-6">
            <BulkSEOEditor
              contentTypes={contentTypes}
              onLoadData={loadBulkData}
              bulkData={bulkData}
              loading={loading}
            />
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            {analytics ? (
              <SEOAnalytics
                analytics={analytics}
                contentType={selectedContent.type}
                onRefresh={loadAnalytics}
                loading={loading}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a content type from the overview to view analytics
                </p>
              </div>
            )}
          </div>
        );

      case 'suggestions':
        return (
          <div className="space-y-6">
            {selectedContent.id ? (
              <SEOSuggestions
                contentType={selectedContent.type}
                contentId={selectedContent.id}
                suggestions={suggestions}
                onGenerate={generateSuggestions}
                onApply={(suggestion) => updateSEOData(suggestion)}
                loading={loading}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Select content from the Content SEO tab to get AI suggestions
                </p>
              </div>
            )}
          </div>
        );

      case 'schema':
        return (
          <SchemaBuilder
            contentId={selectedContent.id || 1}
            contentType={selectedContent.type || 'articles'}
            content={{ title: selectedContent.title || 'Sample Content' }}
            onSchemaUpdate={(data) => {
              console.log('Schema updated:', data);
            }}
          />
        );

      case 'sitemaps':
        return <SitemapGenerator />;

      case 'performance':
        return (
          <PerformanceMonitor
            pageUrl={window.location.href}
            autoRefresh={true}
            refreshInterval={60000}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="seo-management">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          SEO Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Optimize your website for search engines and improve performance
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center px-3 py-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="text-lg mb-1">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>

      {/* SEO Tips Sidebar */}
      <div className="fixed right-6 top-24 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 hidden xl:block">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          SEO Best Practices
        </h3>

        <div className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              Title Tags
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Keep titles under 60 characters and include target keywords
            </p>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
              Meta Descriptions
            </h4>
            <p className="text-xs text-green-700 dark:text-green-300">
              Write compelling descriptions between 120-160 characters
            </p>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">
              Schema Markup
            </h4>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              Add structured data to enable rich snippets in search results
            </p>
          </div>

          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
              Core Web Vitals
            </h4>
            <p className="text-xs text-orange-700 dark:text-orange-300">
              Optimize for LCP, FID, and CLS to improve user experience
            </p>
          </div>

          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Mobile Optimization
            </h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Ensure your site works perfectly on mobile devices
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Need Help?
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Check out our SEO documentation for detailed guides and best practices.
          </p>
          <button className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
            View Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

export default SEOManagement;