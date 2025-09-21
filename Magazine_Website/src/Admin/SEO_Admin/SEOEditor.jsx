import React, { useState, useEffect } from 'react';
import seoService from '../../services/seoService';

const SEOEditor = ({ contentType, seoData, onUpdate, loading }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [seoPreview, setSeoPreview] = useState(null);

  const seoFields = seoService.getSEOFieldsForContentType(contentType);

  useEffect(() => {
    if (seoData) {
      setFormData(seoData);
      updatePreview(seoData);
    }
  }, [seoData]);

  const updatePreview = (data) => {
    const preview = seoService.generateSEOPreview(data);
    setSeoPreview(preview);
  };

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    updatePreview(newData);

    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleArrayFieldChange = (field, value) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    handleInputChange(field, arrayValue);
  };

  const validateForm = () => {
    const newErrors = {};
    seoFields.forEach(field => {
      const validation = seoService.validateSEOField(field, formData[field.key]);
      if (!validation.isValid) {
        newErrors[field.key] = validation.error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onUpdate(formData);
    } catch (error) {
      console.error('Failed to update SEO data:', error);
    }
  };

  const renderField = (field) => {
    const value = formData[field.key] || '';
    const error = errors[field.key];

    switch (field.type) {
      case 'array':
        return (
          <div key={field.key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
              {field.maxLength && (
                <span className="text-xs text-gray-500 ml-2">
                  (Max {field.maxLength} characters)
                </span>
              )}
            </label>
            <textarea
              value={Array.isArray(value) ? value.join(', ') : value}
              onChange={(e) => handleArrayFieldChange(field.key, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              rows={3}
              placeholder={`Enter ${field.label.toLowerCase()} separated by commas`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );

      case 'url':
        return (
          <div key={field.key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
            </label>
            <input
              type="url"
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              placeholder="https://example.com"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );

      default:
        return (
          <div key={field.key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
              {field.maxLength && (
                <span className="text-xs text-gray-500 ml-2">
                  ({value.length}/{field.maxLength} characters)
                </span>
              )}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              rows={field.key.includes('Title') ? 2 : 3}
              maxLength={field.maxLength}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );
    }
  };

  return (
    <div className="seo-editor">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SEO Fields */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              SEO Fields
            </h4>
            {seoFields.map(renderField)}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save SEO Data'}
              </button>
              <button
                type="button"
                onClick={() => setFormData(seoData || {})}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Reset
              </button>
            </div>
          </div>

          {/* SEO Preview */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Search Result Preview
            </h4>
            {seoPreview && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Google Search Result</span>
                  </div>

                  <h3 className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {seoPreview.title}
                  </h3>

                  <p className="text-green-700 text-sm">
                    {seoPreview.url}
                  </p>

                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {seoPreview.description}
                  </p>
                </div>
              </div>
            )}

            {/* SEO Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                SEO Tips
              </h5>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Title should be 50-60 characters</li>
                <li>• Description should be 120-160 characters</li>
                <li>• Include target keywords naturally</li>
                <li>• Make descriptions compelling and unique</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SEOEditor;