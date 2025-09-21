import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const PowerListEdit = () => {
  const { theme } = useTheme();
  const { admin } = useAdminAuth();
  const { showSuccess, showError } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';
  const inputBg = isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300';

  const [powerList, setPowerList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    category: '',
    year: '',
    methodology: '',
    metaTitle: '',
    metaDescription: '',
    status: 'draft'
  });

  // Fetch power list
  const fetchPowerList = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lists/power-lists/${id}`);
      const data = response.data.data;
      setPowerList(data);
      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        description: data.description || '',
        content: data.content || '',
        category: data.category || '',
        year: data.year || '',
        methodology: data.methodology || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        status: data.status || 'draft'
      });
    } catch (error) {
      console.error('Error fetching power list:', error);
      if (error.response?.status === 404) {
        showError('Power list not found');
        navigate('/admin/power-lists');
      } else {
        showError('Failed to fetch power list');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPowerList();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showError('Title is required');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/lists/power-lists/${id}`, formData);
      showSuccess('Power list updated successfully');
      navigate(`/admin/power-lists/${id}`);
    } catch (error) {
      console.error('Error updating power list:', error);
      if (error.response?.status === 403) {
        showError('Access denied: You do not have permission to edit this power list');
      } else {
        showError(error.response?.data?.message || 'Failed to update power list');
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bgMain} p-6`}>
        <div className="max-w-4xl mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 text-center ${textMain}`}>Loading power list...</p>
        </div>
      </div>
    );
  }

  if (!powerList) {
    return (
      <div className={`min-h-screen ${bgMain} p-6`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Power list not found</p>
            <Link to="/admin/power-lists" className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Power Lists
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgMain} p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${textMain}`}>Edit Power List</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Update the power list details
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              to={`/admin/power-lists/${id}`}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Power List
            </Link>
            <Link
              to={`/admin/power-lists/${id}/entries`}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Manage Entries
            </Link>
            <Link
              to="/admin/power-lists"
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to List
            </Link>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={`${cardBg} p-6 rounded-lg border`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${textMain}`}>Basic Information</h3>

              <div>
                <label className={`block text-sm font-medium ${textMain} mb-2`}>
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className={`w-full p-2 border rounded ${inputBg}`}
                  placeholder="Enter power list title"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textMain} mb-2`}>
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${inputBg}`}
                  placeholder="URL-friendly identifier"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textMain} mb-2`}>
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${inputBg}`}
                >
                  <option value="">Select Category</option>
                  <option value="Business">Business</option>
                  <option value="Technology">Technology</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Sports">Sports</option>
                  <option value="Lifestyle">Lifestyle</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textMain} mb-2`}>
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${inputBg}`}
                  placeholder="2024"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textMain} mb-2`}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${inputBg}`}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Content & SEO */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${textMain}`}>Content & SEO</h3>

              <div>
                <label className={`block text-sm font-medium ${textMain} mb-2`}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full p-2 border rounded ${inputBg}`}
                  placeholder="Brief description of the power list"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textMain} mb-2`}>
                  Methodology
                </label>
                <textarea
                  name="methodology"
                  value={formData.methodology}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full p-2 border rounded ${inputBg}`}
                  placeholder="How the power list was compiled"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textMain} mb-2`}>
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${inputBg}`}
                  placeholder="SEO title"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textMain} mb-2`}>
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows={2}
                  className={`w-full p-2 border rounded ${inputBg}`}
                  placeholder="SEO description"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-6">
            <label className={`block text-sm font-medium ${textMain} mb-2`}>
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={10}
              className={`w-full p-2 border rounded ${inputBg}`}
              placeholder="Detailed content about the power list"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <Link
              to={`/admin/power-lists/${id}`}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PowerListEdit;