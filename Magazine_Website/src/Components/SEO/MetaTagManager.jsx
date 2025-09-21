import React, { useState, useEffect } from 'react';
import { seoService } from '../../services/seoService';

const MetaTagManager = ({
  contentId,
  contentType,
  content,
  onMetaUpdate,
  className = ''
}) => {
  const [metaData, setMetaData] = useState({
    title: '',
    description: '',
    keywords: '',
    robots: 'index,follow',
    canonical: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    author: '',
    published: '',
    modified: '',
    section: '',
    tags: []
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');

  useEffect(() => {
    if (contentId && contentType) {
      loadMetaData();
    }
  }, [contentId, contentType]);

  useEffect(() => {
    // Auto-populate from content when available
    if (content) {
      setMetaData(prev => ({
        ...prev,
        title: content.title || prev.title,
        description: content.excerpt || content.description || prev.description,
        author: content.author?.name || prev.author,
        published: content.publishedAt || prev.published,
        modified: content.updatedAt || prev.modified,
        section: content.category?.name || prev.section,
        tags: content.tags || prev.tags
      }));
    }
  }, [content]);

  const loadMetaData = async () => {
    try {
      setLoading(true);
      const response = await seoService.getSEOAnalysis(contentType, contentId);
      if (response.data) {
        setMetaData(prev => ({ ...prev, ...response.data }));
      }
    } catch (err) {
      console.error('Failed to load meta data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await seoService.updateSEOMetadata(contentType, contentId, metaData);

      if (onMetaUpdate) {
        onMetaUpdate(response.data);
      }
    } catch (err) {
      console.error('Failed to save meta data:', err);
      setError('Failed to save meta data');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setMetaData(prev => ({ ...prev, [field]: value }));

    // Auto-sync related fields
    if (field === 'title' && !metaData.ogTitle) {
      setMetaData(prev => ({ ...prev, ogTitle: value }));
    }
    if (field === 'description' && !metaData.ogDescription) {
      setMetaData(prev => ({ ...prev, ogDescription: value }));
    }
    if (field === 'title' && !metaData.twitterTitle) {
      setMetaData(prev => ({ ...prev, twitterTitle: value }));
    }
    if (field === 'description' && !metaData.twitterDescription) {
      setMetaData(prev => ({ ...prev, twitterDescription: value }));
    }
  };

  const generatePreview = () => {
    const title = metaData.title || 'Page Title';
    const description = metaData.description || 'Page description appears here...';
    const url = metaData.canonical || window.location.href;

    return {
      title,
      description,
      url
    };
  };

  const getTitleLength = () => metaData.title.length;
  const getDescriptionLength = () => metaData.description.length;

  const getTitleColor = () => {
    const length = getTitleLength();
    if (length === 0) return 'text-gray-400';
    if (length <= 50) return 'text-green-600';
    if (length <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDescriptionColor = () => {
    const length = getDescriptionLength();
    if (length === 0) return 'text-gray-400';
    if (length >= 120 && length <= 160) return 'text-green-600';
    if (length >= 100 && length <= 180) return 'text-yellow-600';
    return 'text-red-600';
  };

  const preview = generatePreview();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`meta-tag-manager bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Meta Tag Manager
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Optimize meta tags for search engines and social media
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
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

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Meta Tags Form */}
          <div className="space-y-6">
            {/* Basic Meta Tags */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Basic Meta Tags
              </h3>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Title Tag
                    </label>
                    <span className={`text-xs ${getTitleColor()}`}>
                      {getTitleLength()}/60 characters
                    </span>
                  </div>
                  <input
                    type="text"
                    value={metaData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    maxLength={60}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter SEO title..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Appears in search results and browser tabs
                  </p>
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Meta Description
                    </label>
                    <span className={`text-xs ${getDescriptionColor()}`}>
                      {getDescriptionLength()}/160 characters
                    </span>
                  </div>
                  <textarea
                    value={metaData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    maxLength={160}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter meta description..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Appears under your title in search results
                  </p>
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={metaData.keywords}
                    onChange={(e) => handleInputChange('keywords', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Comma-separated keywords (optional - not heavily used by Google)
                  </p>
                </div>

                {/* Canonical URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Canonical URL
                  </label>
                  <input
                    type="url"
                    value={metaData.canonical}
                    onChange={(e) => handleInputChange('canonical', e.target.value)}
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
                    value={metaData.robots}
                    onChange={(e) => handleInputChange('robots', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="index,follow">Index, Follow (Default)</option>
                    <option value="noindex,follow">No Index, Follow</option>
                    <option value="index,nofollow">Index, No Follow</option>
                    <option value="noindex,nofollow">No Index, No Follow</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Open Graph Tags */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Open Graph (Facebook)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    OG Title
                  </label>
                  <input
                    type="text"
                    value={metaData.ogTitle}
                    onChange={(e) => handleInputChange('ogTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    OG Description
                  </label>
                  <textarea
                    value={metaData.ogDescription}
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
                    value={metaData.ogImage}
                    onChange={(e) => handleInputChange('ogImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    OG Type
                  </label>
                  <select
                    value={metaData.ogType}
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
                    value={metaData.twitterCard}
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
                    value={metaData.twitterTitle}
                    onChange={(e) => handleInputChange('twitterTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Twitter Description
                  </label>
                  <textarea
                    value={metaData.twitterDescription}
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
                    value={metaData.twitterImage}
                    onChange={(e) => handleInputChange('twitterImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div>
            <div className="sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Search Result Preview
              </h3>

              {/* Preview Mode Toggle */}
              <div className="flex items-center space-x-2 mb-4">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-3 py-1 text-sm rounded ${
                    previewMode === 'desktop'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-3 py-1 text-sm rounded ${
                    previewMode === 'mobile'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  Mobile
                </button>
              </div>

              {/* Google Search Preview */}
              <div className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 ${
                previewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
              }`}>
                <div className="space-y-2">
                  {/* Title */}
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className={`text-green-700 dark:text-green-400 text-sm truncate ${
                      previewMode === 'mobile' ? 'max-w-xs' : 'max-w-xl'
                    }`}>
                      your-domain.com › {contentType}
                    </div>
                  </div>

                  {/* Page Title */}
                  <h4 className={`text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ${
                    previewMode === 'mobile' ? 'text-base' : 'text-xl'
                  } ${getTitleColor()} ${
                    previewMode === 'mobile' ? 'line-clamp-2' : ''
                  }`}>
                    {preview.title || 'Your Page Title'}
                  </h4>

                  {/* Meta Description */}
                  <p className={`text-gray-600 dark:text-gray-400 ${
                    previewMode === 'mobile' ? 'text-sm line-clamp-3' : 'text-sm'
                  } ${getDescriptionColor()}`}>
                    {preview.description || 'Your meta description will appear here...'}
                  </p>

                  {/* URL */}
                  <div className="text-gray-500 dark:text-gray-500 text-sm truncate">
                    {preview.url}
                  </div>
                </div>
              </div>

              {/* Character Count Indicators */}
              <div className="mt-6 space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Title Length</span>
                    <span className={getTitleColor()}>
                      {getTitleLength()}/60
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        getTitleLength() <= 50 ? 'bg-green-500' :
                        getTitleLength() <= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((getTitleLength() / 60) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Description Length</span>
                    <span className={getDescriptionColor()}>
                      {getDescriptionLength()}/160
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        getDescriptionLength() >= 120 && getDescriptionLength() <= 160 ? 'bg-green-500' :
                        getDescriptionLength() >= 100 && getDescriptionLength() <= 180 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((getDescriptionLength() / 160) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  💡 SEO Tips
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Include your target keyword in the title</li>
                  <li>• Write compelling descriptions that encourage clicks</li>
                  <li>• Use numbers and power words to increase CTR</li>
                  <li>• Keep titles under 60 characters</li>
                  <li>• Keep descriptions between 120-160 characters</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaTagManager;