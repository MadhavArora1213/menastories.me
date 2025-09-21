import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import downloadService from '../../services/downloadService';
import categoryService from '../services/categoryService';
import { toast } from 'react-toastify';

const CreateDownload = () => {
  const { theme } = useTheme();
  const { admin, isMasterAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';
  const inputBg = isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    tags: [],
    custom_tags: '',
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    version: '',
    language: 'en',
    license: 'all_rights_reserved',
    copyright: '',
    isPublic: true,
    status: 'draft',
    file: null
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response && response.data && response.data.success && response.data.data) {
        setCategories(response.data.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('File size should be less than 100MB');
        return;
      }
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleCustomTags = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = e.target.value.trim().toLowerCase();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag],
          custom_tags: ''
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, custom_tags: e.target.value }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const errors = {};

    // Required fields validation
    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Title is required';
    }

    if (!formData.file) {
      errors.file = 'File is required';
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Category is required';
    }

    // Title length validation
    if (formData.title && formData.title.length > 100) {
      errors.title = 'Title should be under 100 characters';
    }

    // Meta title validation
    if (formData.metaTitle && formData.metaTitle.length > 60) {
      errors.metaTitle = 'Meta title should be under 60 characters';
    }

    // Meta description validation
    if (formData.metaDescription && formData.metaDescription.length > 160) {
      errors.metaDescription = 'Meta description should be under 160 characters';
    }

    return errors;
  };

  const handleSubmit = async (e, status = 'draft') => {
    e.preventDefault();

    // Mark all fields as touched for validation display
    const allFields = Object.keys(formData);
    const touchedFields = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(touchedFields);

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      // Prepare form data for upload
      const submitData = new FormData();

      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'file' && formData[key]) {
          submitData.append('file', formData[key]);
        } else if (key === 'tags' || key === 'keywords') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });

      // Set status
      submitData.set('status', status);

      const response = await downloadService.createDownload(submitData);

      if (response.success) {
        toast.success(`Download ${status === 'draft' ? 'saved as draft' : 'created'} successfully`);
        navigate('/admin/downloads');
      } else {
        throw new Error(response.message || 'Failed to create download');
      }
    } catch (error) {
      console.error('Create download error:', error);
      toast.error(error.message || 'Failed to create download');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen ${bgMain} p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${textMain}`}>Upload New Download</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Add downloadable files and resources to your library
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/downloads')}
              className={`px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              Cancel
            </button>
          </div>
        </div>

        <form className="space-y-6">
          {/* General Error Display */}
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <strong>Error:</strong> {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Basic Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg} ${errors.title ? 'border-red-500' : ''}`}
                      placeholder="Enter download title..."
                      required
                    />
                    <div className={`text-sm mt-1 ${errors.title ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {errors.title || 'Keep it under 100 characters for better display'}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                      placeholder="Describe what this download contains..."
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      File <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp4,.avi,.mov,.mp3,.wav,.zip,.rar"
                      className={`w-full p-3 border rounded-lg ${inputBg} ${errors.file ? 'border-red-500' : ''}`}
                      required
                    />
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, Images, Videos, Audio, Archives. Max size: 100MB
                    </div>
                    {formData.file && (
                      <div className={`text-sm mt-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        Selected: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                    {errors.file && (
                      <div className="text-red-500 text-sm mt-1">{errors.file}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Metadata</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Version
                    </label>
                    <input
                      type="text"
                      name="version"
                      value={formData.version}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                      placeholder="e.g., 1.0, v2.1"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Language
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                      <option value="ru">Russian</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      License
                    </label>
                    <select
                      name="license"
                      value={formData.license}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                    >
                      <option value="all_rights_reserved">All Rights Reserved</option>
                      <option value="creative_commons">Creative Commons</option>
                      <option value="public_domain">Public Domain</option>
                      <option value="fair_use">Fair Use</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Copyright
                    </label>
                    <input
                      type="text"
                      name="copyright"
                      value={formData.copyright}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                      placeholder="Copyright holder..."
                    />
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>SEO Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg} ${errors.metaTitle ? 'border-red-500' : ''}`}
                      placeholder="SEO title (leave blank to use download title)"
                      maxLength={60}
                    />
                    <div className={`text-sm mt-1 ${errors.metaTitle ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formData.metaTitle.length}/60 characters
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Meta Description
                    </label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full p-3 border rounded-lg ${inputBg} ${errors.metaDescription ? 'border-red-500' : ''}`}
                      placeholder="SEO description (leave blank to use description)"
                      maxLength={160}
                    />
                    <div className={`text-sm mt-1 ${errors.metaDescription ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formData.metaDescription.length}/160 characters
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publishing Options */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Publishing Options</h2>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg} ${errors.categoryId ? 'border-red-500' : ''}`}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <div className="text-red-500 text-sm mt-1">{errors.categoryId}</div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isPublic"
                        checked={formData.isPublic}
                        onChange={handleInputChange}
                        className="mr-3 h-4 w-4 text-blue-600"
                      />
                      <span className={textMain}>Public Download</span>
                    </label>
                  </div>


                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, 'draft')}
                      disabled={saving}
                      className={`w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {saving ? 'Saving...' : 'Save Draft'}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, 'published')}
                      disabled={saving}
                      className={`w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {saving ? 'Publishing...' : 'Publish Now'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Tags</h2>

                {/* Custom Tags Input */}
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Add Tags
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.custom_tags}
                      onChange={handleCustomTags}
                      onKeyDown={handleCustomTags}
                      className={`flex-1 p-3 border rounded-lg ${inputBg}`}
                      placeholder="Type tag and press Enter or comma..."
                    />
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    Press Enter or comma to add multiple tags
                  </div>
                </div>

                {/* Selected Tags */}
                {formData.tags.length > 0 && (
                  <div className="mt-4">
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Selected Tags ({formData.tags.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full flex items-center gap-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:bg-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDownload;