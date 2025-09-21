import React, { useState, useRef, useEffect } from 'react';
import { newsletterService } from '../../services/newsletterService';

const EmailTemplateEditor = ({
  template,
  onSave,
  onCancel,
  onPreview,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('design');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Template data
  const [templateData, setTemplateData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    type: template?.type || 'email',
    category: template?.category || 'newsletter',
    subject: template?.subject || '',
    htmlContent: template?.htmlContent || getDefaultTemplate(),
    textContent: template?.textContent || '',
    variables: template?.variables || newsletterService.getDefaultVariables(),
    styles: template?.styles || getDefaultStyles(),
    thumbnail: template?.thumbnail || '',
    isDefault: template?.isDefault || false,
    tags: template?.tags || []
  });

  // Editor state
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' or 'html'
  const [selectedElement, setSelectedElement] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const editorRef = useRef(null);

  // Preview state
  const [previewData, setPreviewData] = useState({
    subscriber: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    },
    content: {
      title: 'Sample Article Title',
      excerpt: 'This is a sample article excerpt that demonstrates how the template will look with real content.',
      url: '#',
      image: '/api/placeholder/400/200',
      author: 'Jane Smith',
      publishDate: new Date().toLocaleDateString()
    }
  });

  const handleInputChange = (field, value) => {
    setTemplateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate required fields
      if (!templateData.name.trim()) {
        setError('Template name is required');
        return;
      }

      if (!templateData.htmlContent.trim()) {
        setError('HTML content is required');
        return;
      }

      const saveData = {
        ...templateData,
        htmlContent: templateData.htmlContent
      };

      let result;
      if (template?.id) {
        // Update existing template
        result = await newsletterService.updateTemplate(template.id, saveData);
      } else {
        // Create new template
        result = await newsletterService.createTemplate(saveData);
      }

      if (onSave) {
        onSave(result);
      }
    } catch (err) {
      console.error('Failed to save template:', err);
      setError('Failed to save email template');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(templateData, previewData);
    }
  };

  const insertVariable = (variable) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const variableText = `{{${variable}}}`;

    const newContent = templateData.htmlContent.substring(0, start) +
                      variableText +
                      templateData.htmlContent.substring(end);

    setTemplateData(prev => ({
      ...prev,
      htmlContent: newContent
    }));

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variableText.length, start + variableText.length);
    }, 0);
  };

  const insertElement = (elementType) => {
    const elements = {
      heading: '<h1 style="color: #333; font-size: 24px; margin: 0 0 20px 0;">Heading Text</h1>',
      paragraph: '<p style="color: #666; font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">Paragraph text goes here.</p>',
      image: '<img src="{{content.image}}" alt="{{content.title}}" style="max-width: 100%; height: auto; margin: 20px 0;" />',
      button: '<a href="{{content.url}}" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Read More</a>',
      divider: '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />',
      spacer: '<div style="height: 30px;"></div>'
    };

    const element = elements[elementType];
    if (element) {
      insertContentAtCursor(element);
    }
  };

  const insertContentAtCursor = (content) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newContent = templateData.htmlContent.substring(0, start) +
                      content +
                      templateData.htmlContent.substring(end);

    setTemplateData(prev => ({
      ...prev,
      htmlContent: newContent
    }));

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + content.length, start + content.length);
    }, 0);
  };

  const formatText = (format) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = templateData.htmlContent.substring(start, end);

    let formattedText = selectedText;
    switch (format) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          formattedText = `<a href="${url}" style="color: #3B82F6; text-decoration: none;">${selectedText}</a>`;
        }
        break;
      default:
        return;
    }

    const newContent = templateData.htmlContent.substring(0, start) +
                      formattedText +
                      templateData.htmlContent.substring(end);

    setTemplateData(prev => ({
      ...prev,
      htmlContent: newContent
    }));
  };

  const tabs = [
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'styles', label: 'Styles', icon: '💅' },
    { id: 'preview', label: 'Preview', icon: '👁️' }
  ];

  const elementTypes = [
    { id: 'heading', label: 'Heading', icon: 'H' },
    { id: 'paragraph', label: 'Paragraph', icon: '¶' },
    { id: 'image', label: 'Image', icon: '🖼️' },
    { id: 'button', label: 'Button', icon: '🔘' },
    { id: 'divider', label: 'Divider', icon: '━' },
    { id: 'spacer', label: 'Spacer', icon: '⬜' }
  ];

  const variableCategories = [
    {
      name: 'Subscriber',
      variables: ['firstName', 'lastName', 'email', 'preferences']
    },
    {
      name: 'Content',
      variables: ['title', 'excerpt', 'url', 'image', 'author', 'publishDate']
    },
    {
      name: 'System',
      variables: ['unsubscribeUrl', 'preferencesUrl', 'websiteUrl']
    }
  ];

  return (
    <div className={`email-template-editor bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {template?.id ? 'Edit Email Template' : 'Create Email Template'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Design and customize your email template
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
            {saving ? 'Saving...' : 'Save Template'}
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
      <div className="flex h-[600px]">
        {/* Main Editor */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'design' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={templateData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter template name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={templateData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="welcome">Welcome</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="digest">Digest</option>
                    <option value="breaking_news">Breaking News</option>
                    <option value="event">Event</option>
                    <option value="promotion">Promotion</option>
                    <option value="announcement">Announcement</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={templateData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Brief description of this template"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={templateData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter email subject line"
                />
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Editor Mode Toggle */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  HTML Content
                </h3>
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
              <div className="flex items-center space-x-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-t-lg border border-gray-200 dark:border-gray-600">
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
                  onClick={() => formatText('underline')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <button
                  onClick={() => formatText('link')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Insert Link"
                >
                  🔗
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Elements:</span>
                {elementTypes.map(element => (
                  <button
                    key={element.id}
                    onClick={() => insertElement(element.id)}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    title={element.label}
                  >
                    {element.icon}
                  </button>
                ))}
              </div>

              {/* HTML Editor */}
              <textarea
                ref={editorRef}
                value={templateData.htmlContent}
                onChange={(e) => handleInputChange('htmlContent', e.target.value)}
                rows={25}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                placeholder="Enter your HTML template here..."
              />
            </div>
          )}

          {activeTab === 'styles' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Template Styles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={templateData.styles.primaryColor}
                      onChange={(e) => handleInputChange('styles', {
                        ...templateData.styles,
                        primaryColor: e.target.value
                      })}
                      className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      value={templateData.styles.primaryColor}
                      onChange={(e) => handleInputChange('styles', {
                        ...templateData.styles,
                        primaryColor: e.target.value
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Family
                  </label>
                  <select
                    value={templateData.styles.fontFamily}
                    onChange={(e) => handleInputChange('styles', {
                      ...templateData.styles,
                      fontFamily: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Helvetica, sans-serif">Helvetica</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Times New Roman, serif">Times New Roman</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Size
                  </label>
                  <input
                    type="text"
                    value={templateData.styles.fontSize}
                    onChange={(e) => handleInputChange('styles', {
                      ...templateData.styles,
                      fontSize: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="14px"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Line Height
                  </label>
                  <input
                    type="text"
                    value={templateData.styles.lineHeight}
                    onChange={(e) => handleInputChange('styles', {
                      ...templateData.styles,
                      lineHeight: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="1.5"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Template Preview
              </h3>

              {/* Preview Data */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview Data
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 mb-1">Subscriber Name</label>
                    <input
                      type="text"
                      value={previewData.subscriber.firstName}
                      onChange={(e) => setPreviewData(prev => ({
                        ...prev,
                        subscriber: { ...prev.subscriber, firstName: e.target.value }
                      }))}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 mb-1">Article Title</label>
                    <input
                      type="text"
                      value={previewData.content.title}
                      onChange={(e) => setPreviewData(prev => ({
                        ...prev,
                        content: { ...prev.content, title: e.target.value }
                      }))}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Preview
                  </h4>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  <div
                    className="bg-white dark:bg-gray-800 p-4 rounded border"
                    dangerouslySetInnerHTML={{
                      __html: templateData.htmlContent
                        .replace(/\{\{subscriber\.firstName\}\}/g, previewData.subscriber.firstName)
                        .replace(/\{\{content\.title\}\}/g, previewData.content.title)
                        .replace(/\{\{content\.excerpt\}\}/g, previewData.content.excerpt)
                        .replace(/\{\{content\.url\}\}/g, previewData.content.url)
                        .replace(/\{\{content\.image\}\}/g, previewData.content.image)
                        .replace(/\{\{content\.author\}\}/g, previewData.content.author)
                        .replace(/\{\{content\.publishDate\}\}/g, previewData.content.publishDate)
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Variables */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Available Variables
                </h4>
                <div className="space-y-4">
                  {variableCategories.map(category => (
                    <div key={category.name}>
                      <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                        {category.name}
                      </h5>
                      <div className="space-y-1">
                        {category.variables.map(variable => (
                          <button
                            key={variable}
                            onClick={() => insertVariable(`${category.name.toLowerCase()}.${variable}`)}
                            className="w-full text-left px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            {`{{${category.name.toLowerCase()}.${variable}}}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Elements */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Template Elements
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {elementTypes.map(element => (
                    <button
                      key={element.id}
                      onClick={() => insertElement(element.id)}
                      className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{element.icon}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {element.label}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'content' && (
            <div className="space-y-6">
              {/* Template Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Template Settings
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={templateData.isDefault}
                      onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Set as default template
                    </span>
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Tags
                </h4>
                <input
                  type="text"
                  value={templateData.tags.join(', ')}
                  onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="responsive, modern, clean"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Separate tags with commas
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Default template HTML
function getDefaultTemplate() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{content.title}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #3B82F6; padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                Newsletter
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">
                Hello {{subscriber.firstName}}!
              </h2>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                Here's your latest update from our magazine.
              </p>
              
              <!-- Featured Article -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 20px;">
                      {{content.title}}
                    </h3>
                    <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0 0 15px 0;">
                      {{content.excerpt}}
                    </p>
                    <a href="{{content.url}}" style="display: inline-block; background-color: #3B82F6; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: 500;">
                      Read More
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 30px 0 0 0;">
                Best regards,<br>
                The Magazine Team
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                      You're receiving this because you subscribed to our newsletter.
                    </p>
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                      <a href="{{system.preferencesUrl}}" style="color: #3B82F6; text-decoration: none;">Update preferences</a> | 
                      <a href="{{system.unsubscribeUrl}}" style="color: #3B82F6; text-decoration: none;">Unsubscribe</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Default styles
function getDefaultStyles() {
  return {
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    lineHeight: '1.5'
  };
}

export default EmailTemplateEditor;