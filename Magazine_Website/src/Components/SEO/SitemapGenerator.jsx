import React, { useState, useEffect } from 'react';
import { seoService } from '../../services/seoService';

const SitemapGenerator = ({ className = '' }) => {
  const [sitemaps, setSitemaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({});
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSitemap, setEditingSitemap] = useState(null);

  const [formData, setFormData] = useState({
    sitemapType: 'articles',
    filename: '',
    includeImages: false,
    includeVideos: false,
    includeNews: false,
    maxUrls: 50000,
    autoGenerate: true,
    generationFrequency: 'daily',
    defaultPriority: 0.5,
    defaultChangeFrequency: 'weekly'
  });

  useEffect(() => {
    loadSitemaps();
  }, []);

  const loadSitemaps = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all sitemaps
      const types = ['main', 'articles', 'categories', 'tags', 'authors', 'images', 'videos', 'news'];
      const sitemapPromises = types.map(type => seoService.getSitemap(type).catch(() => null));
      const results = await Promise.all(sitemapPromises);

      const validSitemaps = results.filter(result => result && result.data).map(result => result.data);
      setSitemaps(validSitemaps);
    } catch (err) {
      console.error('Failed to load sitemaps:', err);
      setError('Failed to load sitemaps');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (sitemapType) => {
    try {
      setGenerating(prev => ({ ...prev, [sitemapType]: true }));
      setError(null);

      const response = await seoService.generateSitemap(sitemapType);
      await loadSitemaps(); // Refresh the list

      // Show success message
      console.log(`Sitemap ${sitemapType} generated successfully`);
    } catch (err) {
      console.error(`Failed to generate sitemap ${sitemapType}:`, err);
      setError(`Failed to generate sitemap: ${err.message}`);
    } finally {
      setGenerating(prev => ({ ...prev, [sitemapType]: false }));
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate filename if not provided
      const filename = formData.filename || `sitemap-${formData.sitemapType}.xml`;

      // Create sitemap configuration (this would typically be done via API)
      const sitemapData = {
        ...formData,
        filename,
        url: `${window.location.origin}/${filename}`,
        status: 'active'
      };

      // In a real implementation, this would call an API to create the sitemap
      console.log('Creating sitemap:', sitemapData);

      setShowForm(false);
      setFormData({
        sitemapType: 'articles',
        filename: '',
        includeImages: false,
        includeVideos: false,
        includeNews: false,
        maxUrls: 50000,
        autoGenerate: true,
        generationFrequency: 'daily',
        defaultPriority: 0.5,
        defaultChangeFrequency: 'weekly'
      });

      await loadSitemaps();
    } catch (err) {
      console.error('Failed to create sitemap:', err);
      setError('Failed to create sitemap');
    } finally {
      setLoading(false);
    }
  };

  const getSitemapTypeInfo = (type) => {
    const typeInfo = {
      main: {
        label: 'Main Sitemap',
        description: 'Primary sitemap containing all important pages',
        icon: '🏠',
        color: 'bg-blue-100 text-blue-800'
      },
      articles: {
        label: 'Articles Sitemap',
        description: 'All published articles and blog posts',
        icon: '📝',
        color: 'bg-green-100 text-green-800'
      },
      categories: {
        label: 'Categories Sitemap',
        description: 'Article categories and sections',
        icon: '📂',
        color: 'bg-purple-100 text-purple-800'
      },
      tags: {
        label: 'Tags Sitemap',
        description: 'Content tags and keywords',
        icon: '🏷️',
        color: 'bg-orange-100 text-orange-800'
      },
      authors: {
        label: 'Authors Sitemap',
        description: 'Author profiles and pages',
        icon: '👤',
        color: 'bg-indigo-100 text-indigo-800'
      },
      images: {
        label: 'Images Sitemap',
        description: 'Image gallery and media files',
        icon: '🖼️',
        color: 'bg-pink-100 text-pink-800'
      },
      videos: {
        label: 'Videos Sitemap',
        description: 'Video content and media',
        icon: '🎥',
        color: 'bg-red-100 text-red-800'
      },
      news: {
        label: 'News Sitemap',
        description: 'Latest news articles',
        icon: '📰',
        color: 'bg-yellow-100 text-yellow-800'
      }
    };

    return typeInfo[type] || {
      label: 'Custom Sitemap',
      description: 'Custom sitemap configuration',
      icon: '📄',
      color: 'bg-gray-100 text-gray-800'
    };
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loading && sitemaps.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`sitemap-generator bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sitemap Generator
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage XML sitemaps for search engine optimization
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Sitemap
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

      {/* Sitemaps List */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sitemaps.map((sitemap) => {
            const typeInfo = getSitemapTypeInfo(sitemap.sitemapType);

            return (
              <div key={sitemap.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{typeInfo.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {typeInfo.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {typeInfo.description}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-1 text-xs rounded-full ${
                    sitemap.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : sitemap.status === 'generating'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {sitemap.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">URLs:</span>
                    <span className="text-gray-900 dark:text-white">{sitemap.totalUrls || 0}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Size:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatFileSize(sitemap.fileSize)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Generated:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(sitemap.lastGenerated)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleGenerate(sitemap.sitemapType)}
                    disabled={generating[sitemap.sitemapType]}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {generating[sitemap.sitemapType] ? 'Generating...' : 'Regenerate'}
                  </button>

                  <a
                    href={sitemap.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                  >
                    View
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {sitemaps.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No sitemaps found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create your first sitemap to get started.
            </p>
          </div>
        )}
      </div>

      {/* Create Sitemap Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Create Sitemap
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sitemap Type
                  </label>
                  <select
                    value={formData.sitemapType}
                    onChange={(e) => setFormData(prev => ({ ...prev, sitemapType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="articles">Articles</option>
                    <option value="categories">Categories</option>
                    <option value="tags">Tags</option>
                    <option value="authors">Authors</option>
                    <option value="images">Images</option>
                    <option value="videos">Videos</option>
                    <option value="news">News</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filename (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.filename}
                    onChange={(e) => setFormData(prev => ({ ...prev, filename: e.target.value }))}
                    placeholder="sitemap-articles.xml"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maximum URLs
                  </label>
                  <input
                    type="number"
                    value={formData.maxUrls}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUrls: parseInt(e.target.value) }))}
                    min="1"
                    max="50000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Priority (0.0 - 1.0)
                  </label>
                  <input
                    type="number"
                    value={formData.defaultPriority}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultPriority: parseFloat(e.target.value) }))}
                    min="0"
                    max="1"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Change Frequency
                  </label>
                  <select
                    value={formData.defaultChangeFrequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultChangeFrequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="always">Always</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoGenerate"
                    checked={formData.autoGenerate}
                    onChange={(e) => setFormData(prev => ({ ...prev, autoGenerate: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="autoGenerate" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Auto-generate sitemap
                  </label>
                </div>

                {formData.autoGenerate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Generation Frequency
                    </label>
                    <select
                      value={formData.generationFrequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, generationFrequency: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="realtime">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Sitemap'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SitemapGenerator;