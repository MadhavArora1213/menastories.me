import React, { useState, useEffect } from 'react';
import { seoService } from '../../services/seoService';

const SEOManager = ({
  contentId,
  contentType,
  content,
  onSEOUpdate,
  className = ''
}) => {
  const [seoData, setSEOData] = useState({
    title: '',
    metaDescription: '',
    canonicalUrl: '',
    robotsDirective: 'index,follow',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogImageAlt: '',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    twitterImageAlt: '',
    structuredData: null
  });

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (contentId && contentType) {
      loadSEOData();
      loadAnalysis();
    }
  }, [contentId, contentType]);

  const loadSEOData = async () => {
    try {
      setLoading(true);
      const response = await seoService.getSEOAnalysis(contentType, contentId);
      if (response.data) {
        setSEOData(prev => ({ ...prev, ...response.data }));
      }
    } catch (err) {
      console.error('Failed to load SEO data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysis = async () => {
    try {
      const response = await seoService.getSEOAnalysis(contentType, contentId);
      setAnalysis(response.data);
    } catch (err) {
      console.error('Failed to load SEO analysis:', err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await seoService.updateSEOMetadata(contentType, contentId, seoData);

      if (onSEOUpdate) {
        onSEOUpdate(response.data);
      }

      // Reload analysis after saving
      await loadAnalysis();
    } catch (err) {
      console.error('Failed to save SEO data:', err);
      setError('Failed to save SEO data');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSEOData(prev => ({ ...prev, [field]: value }));

    // Auto-generate related fields
    if (field === 'title' && !seoData.ogTitle) {
      setSEOData(prev => ({ ...prev, ogTitle: value }));
    }
    if (field === 'metaDescription' && !seoData.ogDescription) {
      setSEOData(prev => ({ ...prev, ogDescription: value }));
    }
    if (field === 'title' && !seoData.twitterTitle) {
      setSEOData(prev => ({ ...prev, twitterTitle: value }));
    }
    if (field === 'metaDescription' && !seoData.twitterDescription) {
      setSEOData(prev => ({ ...prev, twitterDescription: value }));
    }
  };

  const generateSuggestions = () => {
    const suggestions = seoService.generateSEOSuggestions(content, seoData);
    return suggestions;
  };

  const applySuggestion = (suggestion) => {
    if (suggestion.type === 'title') {
      handleInputChange('title', suggestion.suggestion);
    } else if (suggestion.type === 'description') {
      handleInputChange('metaDescription', suggestion.suggestion);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const suggestions = generateSuggestions();

  return (
    <div className={`seo-manager bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              SEO Manager
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Optimize your content for search engines
            </p>
          </div>

          {analysis && (
            <div className={`px-4 py-2 rounded-lg ${getScoreBgColor(analysis.score)}`}>
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}/100
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  SEO Score
                </span>
              </div>
            </div>
          )}
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

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'basic', label: 'Basic SEO', icon: '📝' },
            { id: 'social', label: 'Social Media', icon: '📱' },
            { id: 'advanced', label: 'Advanced', icon: '⚙️' },
            { id: 'analysis', label: 'Analysis', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SEO Title ({seoData.title.length}/60)
              </label>
              <input
                type="text"
                value={seoData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={60}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter SEO title..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This will appear in search results and browser tabs
              </p>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Description ({seoData.metaDescription.length}/160)
              </label>
              <textarea
                value={seoData.metaDescription}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                maxLength={160}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter meta description..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This will appear under your title in search results
              </p>
            </div>

            {/* Canonical URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Canonical URL
              </label>
              <input
                type="url"
                value={seoData.canonicalUrl}
                onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://your-domain.com/canonical-url"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Prevents duplicate content issues
              </p>
            </div>

            {/* Robots Directive */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Robots Directive
              </label>
              <select
                value={seoData.robotsDirective}
                onChange={(e) => handleInputChange('robotsDirective', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="index,follow">Index, Follow (Default)</option>
                <option value="noindex,follow">No Index, Follow</option>
                <option value="index,nofollow">Index, No Follow</option>
                <option value="noindex,nofollow">No Index, No Follow</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            {/* Open Graph */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Open Graph (Facebook, LinkedIn)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    OG Title
                  </label>
                  <input
                    type="text"
                    value={seoData.ogTitle}
                    onChange={(e) => handleInputChange('ogTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    OG Description
                  </label>
                  <textarea
                    value={seoData.ogDescription}
                    onChange={(e) => handleInputChange('ogDescription', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    OG Image URL
                  </label>
                  <input
                    type="url"
                    value={seoData.ogImage}
                    onChange={(e) => handleInputChange('ogImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    OG Type
                  </label>
                  <select
                    value={seoData.ogType}
                    onChange={(e) => handleInputChange('ogType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="website">Website</option>
                    <option value="article">Article</option>
                    <option value="book">Book</option>
                    <option value="profile">Profile</option>
                    <option value="video.other">Video</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Twitter Cards */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Twitter Cards
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Twitter Card Type
                  </label>
                  <select
                    value={seoData.twitterCard}
                    onChange={(e) => handleInputChange('twitterCard', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary Large Image</option>
                    <option value="app">App</option>
                    <option value="player">Player</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Twitter Title
                  </label>
                  <input
                    type="text"
                    value={seoData.twitterTitle}
                    onChange={(e) => handleInputChange('twitterTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Twitter Description
                  </label>
                  <textarea
                    value={seoData.twitterDescription}
                    onChange={(e) => handleInputChange('twitterDescription', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Twitter Image URL
                  </label>
                  <input
                    type="url"
                    value={seoData.twitterImage}
                    onChange={(e) => handleInputChange('twitterImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            {/* Structured Data */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Structured Data (JSON-LD)
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      const schema = seoService.generateArticleSchema(content);
                      handleInputChange('structuredData', schema);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Generate Article Schema
                  </button>
                  <button
                    onClick={() => {
                      const schema = seoService.generateOrganizationSchema();
                      handleInputChange('structuredData', schema);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Generate Organization Schema
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    JSON-LD Schema
                  </label>
                  <textarea
                    value={seoData.structuredData ? JSON.stringify(seoData.structuredData, null, 2) : ''}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handleInputChange('structuredData', parsed);
                      } catch (err) {
                        // Invalid JSON, don't update
                      }
                    }}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    placeholder="Paste your JSON-LD structured data here..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* SEO Analysis */}
            {analysis && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  SEO Analysis
                </h3>

                {/* Issues */}
                {analysis.issues && analysis.issues.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-red-600 dark:text-red-400 mb-2">
                      Issues Found
                    </h4>
                    <ul className="space-y-2">
                      {analysis.issues.map((issue, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <svg className="h-5 w-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-blue-600 dark:text-blue-400 mb-2">
                      Suggestions
                    </h4>
                    <ul className="space-y-2">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start justify-between space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                {suggestion.type}
                              </span>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion.message}</p>
                              {suggestion.suggestion && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                  Suggestion: {suggestion.suggestion}
                                </p>
                              )}
                            </div>
                          </div>
                          {suggestion.suggestion && (
                            <button
                              onClick={() => applySuggestion(suggestion)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                              Apply
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metrics */}
                {analysis.metrics && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                      Content Metrics
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {analysis.metrics.wordCount || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Words</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {seoData.internalLinks || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Internal Links</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {seoData.externalLinks || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">External Links</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {seoData.headingStructure?.h1 || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">H1 Tags</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {seoData.lastModified && (
            <span>Last modified: {new Date(seoData.lastModified).toLocaleDateString()}</span>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SEOManager;