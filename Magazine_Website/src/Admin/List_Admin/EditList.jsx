import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import listService from '../../services/listService';
import { toast } from 'react-toastify';
import slugify from 'slugify';

const EditList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isMasterAdmin } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    category: '',
    year: '',
    recommended: false,
    richLists: false,
    entrepreneurs: false,
    companies: false,
    leaders: false,
    entertainment: false,
    sports: false,
    lifestyle: false,
    methodology: '',
    status: 'draft',
    featuredImage: null
  });

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';

  useEffect(() => {
    fetchList();
  }, [id]);

  const fetchList = async () => {
    try {
      setFetchLoading(true);
      const response = await listService.getList(id);
      if (response.success) {
        const list = response.data;
        setFormData({
          title: list.title || '',
          slug: list.slug || '',
          description: list.description || '',
          content: list.content || '',
          category: list.category || '',
          year: list.year || '',
          recommended: list.recommended || false,
          richLists: list.richLists || false,
          entrepreneurs: list.entrepreneurs || false,
          companies: list.companies || false,
          leaders: list.leaders || false,
          entertainment: list.entertainment || false,
          sports: list.sports || false,
          lifestyle: list.lifestyle || false,
          methodology: list.methodology || '',
          status: list.status || 'draft',
          featuredImage: null
        });
      } else {
        toast.error('Failed to fetch list');
        navigate('/admin/lists');
      }
    } catch (error) {
      console.error('Error fetching list:', error);
      toast.error('Failed to fetch list');
      navigate('/admin/lists');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: newValue
      };

      // Auto-generate slug from title
      if (name === 'title' && newValue.trim()) {
        updated.slug = slugify(newValue, { lower: true, strict: true });
      }

      return updated;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      featuredImage: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const submitData = new FormData();

      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (typeof formData[key] === 'boolean') {
            submitData.append(key, formData[key].toString());
          } else if (key === 'featuredImage' && formData[key]) {
            submitData.append('featured_image', formData[key]);
          } else if (key !== 'featuredImage') {
            submitData.append(key, formData[key]);
          }
        }
      });

      const response = await listService.updateList(id, submitData);

      if (response.success) {
        toast.success('List updated successfully');
        navigate('/admin/lists');
      } else {
        toast.error(response.message || 'Failed to update list');
      }
    } catch (error) {
      console.error('Error updating list:', error);
      toast.error('Failed to update list');
    } finally {
      setLoading(false);
    }
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 6; i++) {
      years.push((currentYear + 1 - i).toString());
    }
    return years;
  };

  if (fetchLoading) {
    return (
      <div className={`min-h-screen ${bgMain} p-6`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            <h1 className={`text-3xl font-bold ${textMain}`}>Edit List</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Update list information and settings
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/lists')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Lists
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={`${cardBg} p-6 rounded-lg border`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Enter list title"
              />
            </div>

            {/* Slug */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Slug (Auto-generated)
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="auto-generated-from-title"
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                URL-friendly version of the title (auto-generated)
              </p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Enter list description"
              />
            </div>

            {/* Content */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={5}
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Enter detailed content"
              />
            </div>

            {/* Category */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="e.g., Business & Leadership"
              />
            </div>

            {/* Year */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Year
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="">Select Year</option>
                {getYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Featured Image */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Featured Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            {/* Methodology */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Methodology
              </label>
              <textarea
                name="methodology"
                value={formData.methodology}
                onChange={handleInputChange}
                rows={3}
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Describe how this list was compiled"
              />
            </div>

            {/* Categories Checkboxes */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${textMain} mb-3`}>
                Categories
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'recommended', label: 'Recommended' },
                  { name: 'richLists', label: 'Rich Lists' },
                  { name: 'entrepreneurs', label: 'Entrepreneurs' },
                  { name: 'companies', label: 'Companies' },
                  { name: 'leaders', label: 'Leaders' },
                  { name: 'entertainment', label: 'Entertainment' },
                  { name: 'sports', label: 'Sports' },
                  { name: 'lifestyle', label: 'Lifestyle' }
                ].map(category => (
                  <label key={category.name} className="flex items-center">
                    <input
                      type="checkbox"
                      name={category.name}
                      checked={formData[category.name]}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className={`text-sm ${textMain}`}>{category.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/lists')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditList;