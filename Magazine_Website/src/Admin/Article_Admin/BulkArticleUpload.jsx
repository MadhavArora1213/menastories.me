import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useTheme } from '../context/ThemeContext';
import articleService from '../services/articleService';

const BulkArticleUpload = () => {
  const { theme } = useTheme();
  const { admin } = useAdminAuth();
  const [formData, setFormData] = useState({
    driveLink: '',
    categoryId: '',
    authorId: ''
  });
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  // Load categories and authors on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    try {
      await Promise.all([loadCategories(), loadAuthors()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Use the same base URL as articleService
      const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        credentials: 'include',
        headers: {
          'Authorization': localStorage.getItem('adminToken') || localStorage.getItem('token') ? `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}` : '',
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCategories(data.data);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      throw error;
    }
  };

  const loadAuthors = async () => {
    try {
      const response = await articleService.getAllAuthors();
      if (response.success && response.data) {
        setAuthors(response.data);
      }
    } catch (error) {
      console.error('Error loading authors:', error);
      throw error;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUploadResults(null);

    try {
      const response = await articleService.bulkUpload(formData);

      if (response.success) {
        setUploadResults(response.data);
        // Reset form
        setFormData({
          driveLink: '',
          categoryId: '',
          authorId: ''
        });
      } else {
        setError(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      setError(error.message || 'An error occurred during upload');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.driveLink.trim() !== '' && !loadingData;

  return (
    <div className={`p-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bulk Article Upload</h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Upload multiple articles from a Google Drive folder. The folder should contain subfolders named ARTICLE_1, ARTICLE_2, etc., each with a .docx file and optional PNG images.
          </p>
        </div>

        {/* Instructions */}
        <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h3 className="font-semibold mb-2">Folder Structure Requirements:</h3>
          <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>• Root folder: ARTICLES</li>
            <li>• Subfolders: ARTICLE_1, ARTICLE_2, ARTICLE_3, etc.</li>
            <li>• Each article folder must contain: article_1.docx (or similar)</li>
            <li>• Optional: PNG subfolder with images (featured_image.png, image_gallery1.png, etc.)</li>
          </ul>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {loadingData && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-800 text-sm">Loading categories and authors...</span>
              </div>
            </div>
          )}

          {!loadingData && (categories.length === 0 || authors.length === 0) && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-yellow-800 text-sm">
                    {categories.length === 0 && authors.length === 0
                      ? 'Failed to load categories and authors'
                      : categories.length === 0
                        ? 'Failed to load categories'
                        : 'Failed to load authors'
                    }
                  </span>
                </div>
                <button
                  onClick={loadData}
                  className="text-yellow-800 hover:text-yellow-900 text-sm font-medium underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Google Drive Link */}
            <div>
              <label htmlFor="driveLink" className="block text-sm font-medium mb-2">
                Google Drive Folder Link *
              </label>
              <input
                type="url"
                id="driveLink"
                name="driveLink"
                value={formData.driveLink}
                onChange={handleInputChange}
                placeholder="https://drive.google.com/drive/folders/..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-black placeholder-gray-500'
                }`}
                required
              />
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Paste the sharing link of your Google Drive folder containing the articles
              </p>
            </div>

            {/* Category Selection */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium mb-2">
                Default Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                disabled={loadingData}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-black'
                }`}
              >
                <option value="">
                  {loadingData ? 'Loading categories...' : categories.length > 0 ? 'Select a category (optional)' : 'No categories available'}
                </option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                If not selected, articles will use the default category
              </p>
            </div>

            {/* Author Selection */}
            <div>
              <label htmlFor="authorId" className="block text-sm font-medium mb-2">
                Default Author
              </label>
              <select
                id="authorId"
                name="authorId"
                value={formData.authorId}
                onChange={handleInputChange}
                disabled={loadingData}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-black'
                }`}
              >
                <option value="">
                  {loadingData ? 'Loading authors...' : authors.length > 0 ? 'Select an author (optional)' : 'No authors available'}
                </option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>
                    {author.name} {author.title ? `(${author.title})` : ''}
                  </option>
                ))}
              </select>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                If not selected, articles will use the system default author
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  isFormValid && !loading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Start Bulk Upload'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Results */}
        {uploadResults && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Upload Results</h3>

            {/* Summary */}
            <div className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{uploadResults.total}</div>
                  <div className="text-sm text-gray-600">Total Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{uploadResults.success.length}</div>
                  <div className="text-sm text-gray-600">Successfully Uploaded</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{uploadResults.errors.length}</div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
              </div>
            </div>

            {/* Successful Uploads */}
            {uploadResults.success.length > 0 && (
              <div className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className="font-semibold mb-2 text-green-600">Successfully Uploaded Articles:</h4>
                <div className="space-y-2">
                  {uploadResults.success.map((article, index) => (
                    <div key={index} className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                      <div className="font-medium">{article.title}</div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Slug: {article.slug} | Status: {article.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {uploadResults.errors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold mb-2 text-red-600">Errors:</h4>
                <div className="space-y-2">
                  {uploadResults.errors.map((error, index) => (
                    <div key={index} className="p-2 bg-red-100 rounded">
                      <div className="font-medium text-red-800">{error.article}</div>
                      <div className="text-sm text-red-600">{error.error}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkArticleUpload;