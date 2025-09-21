import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import listService from '../../services/listService';
import { toast } from 'react-toastify';
import slugify from 'slugify';

const CreateList = () => {
  const { theme } = useTheme();
  const { admin } = useAdminAuth();
  const navigate = useNavigate();

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';

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
    meta_title: '',
    meta_description: '',
    featured_image_caption: ''
  });

  const [loading, setLoading] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [docxFile, setDocxFile] = useState(null);

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
    const { name, files } = e.target;
    if (name === 'featured_image') {
      setFeaturedImage(files[0]);
    } else if (name === 'docx_file') {
      setDocxFile(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    // DOCX file is now optional - if not provided, sample entries will be created
    if (!docxFile) {
      console.log('No DOCX file provided - sample entries will be created');
    }

    setLoading(true);

    try {
      const submitData = new FormData();

      // Add form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (typeof formData[key] === 'boolean') {
            submitData.append(key, formData[key].toString());
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      // Add files
      if (featuredImage) {
        submitData.append('featured_image', featuredImage);
      }
      if (docxFile) {
        submitData.append('docx_file', docxFile);
      }

      const response = await listService.createList(submitData);

      if (response.success) {
        toast.success('List created successfully!');
        navigate('/admin/lists');
      } else {
        toast.error(response.message || 'Failed to create list');
      }
    } catch (error) {
      console.error('Create list error:', error);
      toast.error('Failed to create list');
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

  return (
    <div className={`min-h-screen ${bgMain} p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${textMain}`}>Create New List</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Create a new list with entries and metadata
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
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Basic Information</h2>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Slug (Auto-generated)
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="auto-generated-from-title"
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                URL-friendly version of the title (auto-generated)
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="e.g., Business, Technology, Entertainment"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Year
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="">Select Year</option>
                {getYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Featured Image
              </label>
              <input
                type="file"
                name="featured_image"
                accept="image/*"
                onChange={handleFileChange}
                className={`w-full p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                DOCX File (Optional)
              </label>
              <input
                type="file"
                name="docx_file"
                accept=".docx,.txt"
                onChange={handleFileChange}
                className={`w-full p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Optional: Upload a .docx or .txt file to automatically parse and create list entries. If not provided, sample entries will be created.
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
                className={`w-full p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Brief description of the list"
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
                className={`w-full p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Detailed content or methodology"
              />
            </div>

            {/* List Types */}
            <div className="md:col-span-2">
              <h2 className={`text-xl font-semibold ${textMain} mb-4`}>List Types</h2>
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
                ].map(type => (
                  <label key={type.name} className="flex items-center">
                    <input
                      type="checkbox"
                      name={type.name}
                      checked={formData[type.name]}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className={`text-sm ${textMain}`}>{type.label}</span>
                  </label>
                ))}
              </div>
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
                className={`w-full p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="How was this list compiled?"
              />
            </div>

            {/* SEO Fields */}
            <div className="md:col-span-2">
              <h2 className={`text-xl font-semibold ${textMain} mb-4`}>SEO Settings</h2>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Meta Title
              </label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Meta Description
              </label>
              <textarea
                name="meta_description"
                value={formData.meta_description}
                onChange={handleInputChange}
                rows={2}
                className={`w-full p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Featured Image Caption
              </label>
              <input
                type="text"
                name="featured_image_caption"
                value={formData.featured_image_caption}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/lists')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateList;