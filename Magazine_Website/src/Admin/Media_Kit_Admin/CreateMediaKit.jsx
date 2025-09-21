import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mediaKitService } from '../../services/mediaKitService';

const CreateMediaKit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    status: 'draft',
    featuredImage: null,
    pdfFile: null,
    imageCaption: '',
    imageAlt: '',
    metaTitle: '',
    metaDescription: '',
    keywords: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, featuredImage: file }));
    }
  };

  const handlePDFFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 50MB for PDFs)
      if (file.size > 50 * 1024 * 1024) {
        setError('PDF size should be less than 50MB');
        return;
      }
      // Validate file type
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are allowed');
        return;
      }
      setFormData(prev => ({ ...prev, pdfFile: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }

      // Handle file upload for featured image
      let submitData = { ...formData };

      if (formData.featuredImage) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', formData.featuredImage);

        try {
          const uploadResponse = await fetch('/api/upload/image', {
            method: 'POST',
            body: formDataUpload
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            submitData.featuredImage = uploadResult.filename;
          } else {
            throw new Error('Failed to upload image');
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          setError('Failed to upload featured image. Please try again.');
          return;
        }
      }

      // Handle PDF upload
      if (formData.pdfFile) {
        const formDataPDF = new FormData();
        formDataPDF.append('pdf', formData.pdfFile);

        try {
          const pdfUploadResponse = await fetch('/api/upload/pdf', {
            method: 'POST',
            body: formDataPDF
          });

          if (pdfUploadResponse.ok) {
            const pdfUploadResult = await pdfUploadResponse.json();
            submitData.pdfFile = pdfUploadResult.data.filename;
            submitData.pdfOriginalName = pdfUploadResult.data.originalName;
            submitData.pdfSize = pdfUploadResult.data.size;
          } else {
            throw new Error('Failed to upload PDF');
          }
        } catch (pdfUploadError) {
          console.error('PDF upload error:', pdfUploadError);
          setError('Failed to upload PDF. Please try again.');
          return;
        }
      }

      // Process keywords (comma-separated string to array)
      if (formData.keywords && typeof formData.keywords === 'string') {
        submitData.keywords = formData.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
      } else {
        submitData.keywords = formData.keywords || [];
      }

      await mediaKitService.createMediaKit(submitData);
      navigate('/admin/media-kits');
    } catch (err) {
      console.error('Failed to create media kit:', err);
      setError(err.message || 'Failed to create media kit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-media-kit">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Media Kit</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create a new media kit for press and advertising opportunities
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/media-kits')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Media Kit'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 m-6 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="ml-2 text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter media kit title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Brief description of the media kit"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Detailed content for the media kit"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Featured Image</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Upload Image
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Recommended: 1200x630px, Max size: 5MB
                </div>
                {formData.featuredImage && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image Preview
                    </label>
                    <img
                      src={URL.createObjectURL(formData.featuredImage)}
                      alt="Preview"
                      className="max-w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image Caption
                </label>
                <input
                  type="text"
                  name="imageCaption"
                  value={formData.imageCaption}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Caption for the featured image"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                name="imageAlt"
                value={formData.imageAlt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Alternative text for accessibility"
              />
            </div>
          </div>






          {/* PDF Document */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">PDF Document</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload PDF Document
              </label>
              <input
                type="file"
                onChange={handlePDFFileChange}
                accept="application/pdf"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Upload a PDF document (max 50MB). The file will be automatically optimized.
              </div>
              {formData.pdfFile && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        {formData.pdfFile.name}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">SEO Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="SEO title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meta Description
                </label>
                <input
                  type="text"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="SEO description"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Keywords
              </label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="media kit, advertising, brand guidelines"
              />
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Separate keywords with commas
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMediaKit;