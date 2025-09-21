import React, { useState, useEffect, useRef } from 'react';
import { newsletterService } from '../../services/newsletterService';
import { articleService } from '../../services/cmsService';

const NewsletterBuilder = ({
  campaign,
  onSave,
  onCancel,
  onPreview,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('content');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Campaign data
  const [campaignData, setCampaignData] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    type: campaign?.type || 'email',
    category: campaign?.category || 'newsletter',
    subject: campaign?.subject || '',
    content: campaign?.content || '',
    templateId: campaign?.templateId || null,
    scheduledAt: campaign?.scheduledAt || '',
    featuredArticles: campaign?.featuredArticles || [],
    tags: campaign?.tags || []
  });

  // Available data
  const [templates, setTemplates] = useState([]);
  const [availableArticles, setAvailableArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);

  // Content editor
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' or 'html'
  const contentRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load templates
      const templatesResponse = await newsletterService.getTemplates({
        type: campaignData.type,
        status: 'active'
      });
      setTemplates(templatesResponse.templates || []);

      // Load recent articles
      const articlesResponse = await articleService.getArticles({
        limit: 20,
        status: 'published',
        sortBy: 'publishDate',
        sortOrder: 'DESC'
      });
      setAvailableArticles(articlesResponse.articles || []);

      // Set selected articles from campaign data
      if (campaignData.featuredArticles.length > 0) {
        const selected = availableArticles.filter(article =>
          campaignData.featuredArticles.includes(article.id)
        );
        setSelectedArticles(selected);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load newsletter builder data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArticleToggle = (article) => {
    setSelectedArticles(prev => {
      const isSelected = prev.find(a => a.id === article.id);
      if (isSelected) {
        return prev.filter(a => a.id !== article.id);
      } else {
        return [...prev, article];
      }
    });

    // Update campaign data
    setCampaignData(prev => ({
      ...prev,
      featuredArticles: selectedArticles.find(a => a.id === article.id)
        ? prev.featuredArticles.filter(id => id !== article.id)
        : [...prev.featuredArticles, article.id]
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate required fields
      if (!campaignData.name.trim()) {
        setError('Campaign name is required');
        return;
      }

      if (!campaignData.subject.trim()) {
        setError('Email subject is required');
        return;
      }

      if (!campaignData.content.trim()) {
        setError('Content is required');
        return;
      }

      const saveData = {
        ...campaignData,
        featuredArticles: selectedArticles.map(a => a.id)
      };

      let result;
      if (campaign?.id) {
        result = await newsletterService.updateCampaign(campaign.id, saveData);
      } else {
        result = await newsletterService.createCampaign(saveData);
      }

      if (onSave) {
        onSave(result);
      }
    } catch (err) {
      console.error('Failed to save campaign:', err);
      setError('Failed to save newsletter campaign');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(campaignData);
    }
  };

  const insertArticleLink = (article) => {
    const linkHtml = `<a href="/articles/${article.slug}" style="color: #3B82F6; text-decoration: none;">${article.title}</a>`;
    insertContentAtCursor(linkHtml);
  };

  const insertContentAtCursor = (content) => {
    if (contentRef.current) {
      const textarea = contentRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = campaignData.content.substring(0, start) + content + campaignData.content.substring(end);
      setCampaignData(prev => ({ ...prev, content: newContent }));

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + content.length, start + content.length);
      }, 0);
    }
  };

  const formatText = (format) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = campaignData.content.substring(start, end);

    let formattedText = selectedText;
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          formattedText = `[${selectedText}](${url})`;
        }
        break;
      default:
        return;
    }

    const newContent = campaignData.content.substring(0, start) + formattedText + campaignData.content.substring(end);
    setCampaignData(prev => ({ ...prev, content: newContent }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'articles', label: 'Articles', icon: '📰' },
    { id: 'template', label: 'Template', icon: '🎨' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const categoryOptions = [
    { value: 'daily_digest', label: 'Daily Digest' },
    { value: 'weekly_roundup', label: 'Weekly Roundup' },
    { value: 'breaking_news', label: 'Breaking News' },
    { value: 'category_news', label: 'Category News' },
    { value: 'author_news', label: 'Author News' },
    { value: 'event_notification', label: 'Event Notification' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'custom', label: 'Custom' }
  ];

  return (
    <div className={`newsletter-builder bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {campaign?.id ? 'Edit Newsletter' : 'Create Newsletter'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Build and customize your newsletter campaign
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePreview}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Preview
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Campaign'}
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
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={campaignData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter campaign name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={campaignData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={campaignData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Brief description of this newsletter campaign"
              />
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                value={campaignData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter email subject line"
              />
            </div>

            {/* Content Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content *
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditorMode('visual')}
                    className={`px-3 py-1 text-xs rounded ${
                      editorMode === 'visual'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Visual
                  </button>
                  <button
                    onClick={() => setEditorMode('html')}
                    className={`px-3 py-1 text-xs rounded ${
                      editorMode === 'html'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    HTML
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex items-center space-x-1 mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
                <button
                  onClick={() => formatText('bold')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  onClick={() => formatText('italic')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  onClick={() => formatText('link')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Insert Link"
                >
                  🔗
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Insert:</span>
                {selectedArticles.slice(0, 3).map(article => (
                  <button
                    key={article.id}
                    onClick={() => insertArticleLink(article)}
                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    {article.title.substring(0, 20)}...
                  </button>
                ))}
              </div>

              <textarea
                ref={contentRef}
                value={campaignData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                placeholder="Write your newsletter content here..."
              />
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Featured Articles
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select articles to feature in this newsletter. These will be highlighted prominently.
              </p>
            </div>

            {/* Selected Articles */}
            {selectedArticles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected Articles ({selectedArticles.length})
                </h4>
                <div className="space-y-2 mb-4">
                  {selectedArticles.map(article => (
                    <div key={article.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{article.title}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{article.excerpt}</p>
                      </div>
                      <button
                        onClick={() => handleArticleToggle(article)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Articles */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Available Articles
              </h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableArticles.map(article => {
                  const isSelected = selectedArticles.find(a => a.id === article.id);
                  return (
                    <div key={article.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 dark:text-white">{article.title}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{article.excerpt}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(article.publishDate).toLocaleDateString()}
                          </span>
                          {article.author && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              By {article.author.firstName} {article.author.lastName}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleArticleToggle(article)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          isSelected
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isSelected ? 'Remove' : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'template' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Email Template
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Choose a template for your newsletter or use the default template.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Template
              </label>
              <select
                value={campaignData.templateId || ''}
                onChange={(e) => handleInputChange('templateId', e.target.value || null)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Default Template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Template Preview */}
            {campaignData.templateId && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Template Preview
                </h4>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Template preview will be shown here when implemented.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Campaign Settings
              </h3>
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Schedule Send
              </label>
              <input
                type="datetime-local"
                value={campaignData.scheduledAt}
                onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to send immediately when published
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={campaignData.tags.join(', ')}
                onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="marketing, weekly, featured"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Separate tags with commas
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterBuilder;