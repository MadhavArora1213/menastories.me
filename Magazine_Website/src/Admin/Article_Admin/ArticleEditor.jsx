import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import articleService from '../services/articleService';
import categoryService from '../services/categoryService';
import { tagService } from '../services/tagService';
import subcategoryService from '../services/subcategoryService';

const ArticleEditor = ({ article = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    slug: '',
    excerpt: '',
    content: '',
    description: '',
    categoryId: '',
    subcategoryId: '',
    tagIds: [],
    status: 'draft',
    featured: false,
    heroSlider: false,
    pinned: false,
    allowComments: true,
    publishedAt: '',
    seoTitle: '',
    seoDescription: '',
    featuredImage: null,
    gallery: []
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const bgMain = isDark ? "bg-black" : "bg-white";
  const textMain = isDark ? "text-white" : "text-black";
  const cardBg = isDark ? "bg-gray-900" : "bg-white";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const inputBg = isDark ? "bg-gray-800 text-white" : "bg-white text-black";

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [catRes, subcatRes, tagRes] = await Promise.all([
          categoryService.getAllCategories(),
          subcategoryService.getSubcategories(),
          tagService.getAllTags()
        ]);

        // Handle different response formats from backend
        setCategories((catRes.data || catRes.categories || catRes || []).map(c => ({ id: c.id, name: c.name })));
        setSubcategories((subcatRes.data || subcatRes.subcategories || subcatRes || []).map(s => ({ id: s.id, name: s.name, categoryId: s.categoryId })));
        setTags((tagRes.data || tagRes.tags || tagRes || []).map(t => ({ id: t.id, name: t.name })));
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        subtitle: article.subtitle || '',
        slug: article.slug || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        description: article.description || '',
        categoryId: article.categoryId || '',
        subcategoryId: article.subcategoryId || '',
        tagIds: article.tagIds || [],
        status: article.status || 'draft',
        featured: article.featured || false,
        heroSlider: article.heroSlider || false,
        pinned: article.pinned || false,
        allowComments: article.allowComments !== undefined ? article.allowComments : true,
        publishedAt: article.publishedAt || '',
        seoTitle: article.seoTitle || '',
        seoDescription: article.seoDescription || '',
        featuredImage: article.featuredImage || null,
        gallery: article.gallery || []
      });
    }
  }, [article]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categoryId,
      subcategoryId: '' // Reset subcategory when category changes
    }));
  };

  const getSubcategories = () => {
    return subcategories.filter(s => s.categoryId === formData.categoryId);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const articleData = {
        title: formData.title,
        subtitle: formData.subtitle,
        content: formData.content,
        description: formData.description,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId,
        tagIds: formData.tagIds,
        status: formData.status,
        featuredImage: formData.featuredImage,
        heroSlider: formData.heroSlider,
        featured: formData.featured,
        pinned: formData.pinned,
        allowComments: formData.allowComments
      };

      if (article) {
        // Update existing article
        await articleService.update(article.id, articleData);
      } else {
        // Create new article
        await articleService.create(articleData);
      }

      onSave(articleData);
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('Failed to save article: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${bgMain} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${textMain} mb-2`}>
              {article ? 'Edit Article' : 'Create New Article'}
            </h1>
            <p className={`text-gray-600 dark:text-gray-400`}>
              {article ? 'Update your article content and settings' : 'Create engaging content for your audience'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave()}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (article ? 'Update' : 'Create') + ' Article'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-6`}>
              <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Basic Information</h2>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter article title..."
                    className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    placeholder="Enter article subtitle..."
                    className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="article-url-slug"
                    className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL: /article/{formData.slug}
                  </p>
                </div>

                {/* Excerpt */}
                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Excerpt
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Brief description of the article..."
                    rows={3}
                    className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Detailed description of the article..."
                    rows={4}
                    className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                  />
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-6`}>
              <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Article Content</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-[400px]">
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Write your article content here... (Rich text editor will be integrated)"
                    className={`w-full h-96 border-none outline-none resize-none ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Rich text editor with formatting options will be integrated here
                </p>
              </div>
            </div>

            {/* SEO Settings */}
            <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-6`}>
              <h2 className={`text-xl font-semibold ${textMain} mb-4`}>SEO Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                    placeholder="SEO optimized title..."
                    className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.seoTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    SEO Description
                  </label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                    placeholder="SEO meta description..."
                    rows={3}
                    className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.seoDescription.length}/160 characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-6`}>
              <h3 className={`text-lg font-semibold ${textMain} mb-4`}>Publish Settings</h3>
              
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="in_review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Featured */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className={`ml-2 text-sm ${textMain}`}>
                    Featured Article
                  </label>
                </div>

                {/* Hero Slider */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="heroSlider"
                    checked={formData.heroSlider}
                    onChange={(e) => handleInputChange('heroSlider', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="heroSlider" className={`ml-2 text-sm ${textMain}`}>
                    Show in Hero Slider
                  </label>
                </div>

                {/* Pinned */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pinned"
                    checked={formData.pinned}
                    onChange={(e) => handleInputChange('pinned', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="pinned" className={`ml-2 text-sm ${textMain}`}>
                    Pin to Top
                  </label>
                </div>

                {/* Allow Comments */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowComments"
                    checked={formData.allowComments}
                    onChange={(e) => handleInputChange('allowComments', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowComments" className={`ml-2 text-sm ${textMain}`}>
                    Allow Comments
                  </label>
                </div>

                {/* Publish Date */}
                {(formData.status === 'scheduled' || formData.status === 'published' || formData.status === 'approved') && (
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      {formData.status === 'scheduled' ? 'Schedule Date' : formData.status === 'approved' ? 'Auto-publish Date' : 'Publish Date'}
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleInputChange('publishedAt', e.target.value)}
                      className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-6`}>
              <h3 className={`text-lg font-semibold ${textMain} mb-4`}>Categories</h3>
              
              <div className="space-y-4">
                {/* Category */}
                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    disabled={loading}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                {formData.categoryId && (
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Subcategory
                    </label>
                    <select
                      value={formData.subcategoryId}
                      onChange={(e) => handleInputChange('subcategoryId', e.target.value)}
                      className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      disabled={!formData.categoryId || loading}
                    >
                      <option value="">Select Subcategory</option>
                      {getSubcategories().map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Tags
                  </label>
                  <select
                    multiple
                    value={formData.tagIds}
                    onChange={(e) => handleInputChange('tagIds', Array.from(e.target.selectedOptions).map(option => option.value))}
                    className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32`}
                    disabled={loading}
                  >
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl/Cmd to select multiple tags
                  </p>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-6`}>
              <h3 className={`text-lg font-semibold ${textMain} mb-4`}>Featured Image</h3>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className={`text-sm ${textMain} mt-2`}>
                    Click to upload featured image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;