import React, { useState, useRef, useEffect } from 'react';
import MediaLibrary from './MediaLibrary';
import { useAuth } from '../../context/AuthContext';

// Import Trumbowyg CSS
import 'trumbowyg/dist/ui/trumbowyg.min.css';
import 'trumbowyg/dist/plugins/colors/ui/trumbowyg.colors.min.css';
import 'trumbowyg/dist/plugins/table/ui/trumbowyg.table.min.css';

const ArticleEditor = ({ article = null, onSave, onCancel, categories = [], tags = [] }) => {
  const { user } = useAuth();
  const editorRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    title: article?.title || '',
    subtitle: article?.subtitle || '',
    content: article?.content || '',
    excerpt: article?.excerpt || '',
    status: article?.status || 'draft',
    featuredImage: article?.featuredImage || '',
    imageCaption: article?.imageCaption || '',
    imageAlt: article?.imageAlt || '',
    categoryIds: article?.Categories?.map(cat => cat.id) || [],
    tagIds: article?.Tags?.map(tag => tag.id) || [],
    metaTitle: article?.metaTitle || '',
    metaDescription: article?.metaDescription || '',
    keywords: article?.keywords || [],
    template: article?.template || 'default',
    featured: article?.featured || false,
    pinned: article?.pinned || false,
    hideAuthor: article?.hideAuthor || false,
    disableComments: article?.disableComments || false,
    publishDate: article?.publishDate ? new Date(article.publishDate).toISOString().slice(0, 16) : ''
  });

  // Initialize Trumbowyg editor
  useEffect(() => {
    let cleanup = null;
    
    const initEditor = async () => {
      if (!editorRef.current) return;
      
      try {
        // Dynamic import of jQuery and make it global
        const jQuery = await import('jquery');
        const $ = jQuery.default;
        window.$ = window.jQuery = $;
        
        // Dynamic import of Trumbowyg and plugins
        await import('trumbowyg/dist/trumbowyg.min.js');
        await import('trumbowyg/dist/plugins/colors/trumbowyg.colors.min.js');
        await import('trumbowyg/dist/plugins/fontfamily/trumbowyg.fontfamily.min.js');
        await import('trumbowyg/dist/plugins/fontsize/trumbowyg.fontsize.min.js');
        await import('trumbowyg/dist/plugins/upload/trumbowyg.upload.min.js');
        await import('trumbowyg/dist/plugins/table/trumbowyg.table.min.js');
        
        const $editor = $(editorRef.current);
        
        $editor.trumbowyg({
          btns: [
            ['viewHTML'],
            ['undo', 'redo'],
            ['formatting'],
            ['strong', 'em', 'del'],
            ['superscript', 'subscript'],
            ['link'],
            ['insertImage', 'upload'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
            ['unorderedList', 'orderedList'],
            ['horizontalRule'],
            ['removeformat'],
            ['table'],
            ['foreColor', 'backColor'],
            ['fontfamily'],
            ['fontsize'],
            ['fullscreen']
          ],
          plugins: {
            upload: {
              serverPath: `${import.meta.env.VITE_API_URL}/api/media/upload`,
              fileFieldName: 'file',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              urlPropertyName: 'url'
            }
          },
          autogrow: true,
          removeformatPasted: true
        });

        // Set initial content
        if (formData.content) {
          $editor.trumbowyg('html', formData.content);
        }

        // Handle content changes
        $editor.on('tbwchange', () => {
          const content = $editor.trumbowyg('html');
          setFormData(prev => ({ ...prev, content }));
        });

        // Setup cleanup function
        cleanup = () => {
          if ($editor.length && $editor.data('trumbowyg')) {
            $editor.trumbowyg('destroy');
          }
        };
      } catch (error) {
        console.error('Error initializing Trumbowyg:', error);
      }
    };

    initEditor();

    // Cleanup function
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Update editor content when formData.content changes
  useEffect(() => {
    if (editorRef.current && window.$) {
      const $editor = window.$(editorRef.current);
      if ($editor.data('trumbowyg') && formData.content !== $editor.trumbowyg('html')) {
        $editor.trumbowyg('html', formData.content);
      }
    }
  }, [formData.content]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formData.title || formData.content) {
        handleAutoSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  const handleAutoSave = async () => {
    try {
      setAutoSaveStatus('Saving...');
      const content = editorRef.current && window.$ ?
        window.$(editorRef.current).trumbowyg('html') : formData.content;
        
      const drafData = {
        ...formData,
        content,
        status: 'draft'
      };
      
      // Store in localStorage as backup
      localStorage.setItem('article_autosave', JSON.stringify({
        ...drafData,
        timestamp: new Date().toISOString()
      }));
      
      setAutoSaveStatus('Saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (error) {
      setAutoSaveStatus('Error saving');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: Array.isArray(value) ? value : value.split(',').map(v => v.trim())
    }));
  };

  const handleEditorChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (formData.metaTitle && formData.metaTitle.length > 60) {
      newErrors.metaTitle = 'Meta title should be under 60 characters';
    }
    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description should be under 160 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const content = editorRef.current && window.$ ?
        window.$(editorRef.current).trumbowyg('html') : formData.content;
        
      const submitData = {
        ...formData,
        content
      };
      
      await onSave(submitData);
      
      // Clear autosave
      localStorage.removeItem('article_autosave');
    } catch (error) {
      console.error('Save error:', error);
    }
    setIsLoading(false);
  };

  const insertMedia = (mediaItem) => {
    if (editorRef.current && window.$) {
      const $editor = window.$(editorRef.current);
      let mediaHtml = '';
      
      if (mediaItem.type === 'image') {
        mediaHtml = `<img src="${mediaItem.url}" alt="${mediaItem.altText || ''}" style="max-width: 100%; height: auto;" />`;
        if (mediaItem.caption) {
          mediaHtml = `<figure>${mediaHtml}<figcaption>${mediaItem.caption}</figcaption></figure>`;
        }
      } else if (mediaItem.type === 'video') {
        mediaHtml = `<video controls style="max-width: 100%; height: auto;">
          <source src="${mediaItem.url}" type="${mediaItem.mimeType}">
          Your browser does not support the video tag.
        </video>`;
      }
      
      $editor.trumbowyg('execCmd', {
        cmd: 'insertHTML',
        param: mediaHtml
      });
    }
    setShowMediaLibrary(false);
  };

  // Load autosave data on mount
  useEffect(() => {
    if (!article) {
      const autosaveData = localStorage.getItem('article_autosave');
      if (autosaveData) {
        const parsed = JSON.parse(autosaveData);
        const confirmRestore = window.confirm(
          `Found autosaved content from ${new Date(parsed.timestamp).toLocaleString()}. Would you like to restore it?`
        );
        if (confirmRestore) {
          setFormData(parsed);
        }
      }
    }
  }, [article]);

  const templates = [
    { value: 'default', label: 'Default Article' },
    { value: 'feature', label: 'Feature Story' },
    { value: 'interview', label: 'Interview Format' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {article ? 'Edit Article' : 'Create New Article'}
          </h1>
          {autoSaveStatus && (
            <p className="text-sm text-gray-500 mt-1">
              {autoSaveStatus === 'Saving...' ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {autoSaveStatus}
                </span>
              ) : (
                autoSaveStatus
              )}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="article-form"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (article ? 'Update Article' : 'Save Article')}
          </button>
        </div>
      </div>

      <form id="article-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter article title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Subtitle */}
          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">
              Subtitle
            </label>
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter article subtitle"
            />
          </div>

          {/* Rich Text Editor */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Content *
              </label>
              <button
                type="button"
                onClick={() => setShowMediaLibrary(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Media
              </button>
            </div>
            <div className="border border-gray-300 rounded-md">
              <textarea
                ref={editorRef}
                className="w-full min-h-[500px] p-4 border-0 focus:outline-none resize-none"
                placeholder="Start writing your article content..."
              />
            </div>
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief summary of the article"
            />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Publish Settings</h3>
            
            {/* Status */}
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Template */}
            <div className="mb-4">
              <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
                Template
              </label>
              <select
                id="template"
                name="template"
                value={formData.template}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {templates.map(template => (
                  <option key={template.value} value={template.value}>
                    {template.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Publish Date */}
            <div className="mb-4">
              <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1">
                Publish Date
              </label>
              <input
                type="datetime-local"
                id="publishDate"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Featured Article
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="pinned"
                  checked={formData.pinned}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Pin to Top
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="hideAuthor"
                  checked={formData.hideAuthor}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Hide Author
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="disableComments"
                  checked={formData.disableComments}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Disable Comments
              </label>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Categories</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {categories.map(category => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.categoryIds.includes(category.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        categoryIds: checked
                          ? [...prev.categoryIds, category.id]
                          : prev.categoryIds.filter(id => id !== category.id)
                      }));
                    }}
                    className="mr-2"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {tags.map(tag => (
                <label key={tag.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.tagIds.includes(tag.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        tagIds: checked
                          ? [...prev.tagIds, tag.id]
                          : prev.tagIds.filter(id => id !== tag.id)
                      }));
                    }}
                    className="mr-2"
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Featured Image</h3>
            {formData.featuredImage && (
              <div className="mb-3">
                <img
                  src={formData.featuredImage}
                  alt="Featured"
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
            )}
            <input
              type="url"
              name="featuredImage"
              value={formData.featuredImage}
              onChange={handleInputChange}
              placeholder="Image URL"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <input
              type="text"
              name="imageCaption"
              value={formData.imageCaption}
              onChange={handleInputChange}
              placeholder="Image caption"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <input
              type="text"
              name="imageAlt"
              value={formData.imageAlt}
              onChange={handleInputChange}
              placeholder="Alt text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* SEO Settings */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-3">SEO Settings</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title ({formData.metaTitle.length}/60)
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.metaTitle ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="SEO title"
                />
                {errors.metaTitle && <p className="text-red-500 text-sm mt-1">{errors.metaTitle}</p>}
              </div>
              
              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description ({formData.metaDescription.length}/160)
                </label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.metaDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="SEO description"
                />
                {errors.metaDescription && <p className="text-red-500 text-sm mt-1">{errors.metaDescription}</p>}
              </div>

              <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  id="keywords"
                  value={Array.isArray(formData.keywords) ? formData.keywords.join(', ') : formData.keywords}
                  onChange={(e) => handleArrayInputChange('keywords', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <MediaLibrary
          onSelectMedia={insertMedia}
          onClose={() => setShowMediaLibrary(false)}
        />
      )}
    </div>
  );
};

export default ArticleEditor;