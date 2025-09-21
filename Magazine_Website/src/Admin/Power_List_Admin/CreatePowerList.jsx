import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import slugify from 'slugify';

const CreatePowerList = () => {
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
    methodology: '',
    meta_title: '',
    meta_description: '',
    featured_image_caption: ''
  });

  const [loading, setLoading] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [docxFile, setDocxFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };

      // Auto-generate slug from title
      if (name === 'title' && value.trim()) {
        updated.slug = slugify(value, { lower: true, strict: true });
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

    if (!docxFile) {
      toast.error('DOCX file is required for parsing power list entries');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();

      // Add form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });

      // Add files
      if (featuredImage) {
        submitData.append('featured_image', featuredImage);
      }
      if (docxFile) {
        submitData.append('docx_file', docxFile);
      }

      const response = await api.post('/lists/power-lists', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Power list created successfully!');
        navigate('/admin/power-lists');
      } else {
        toast.error(response.data.message || 'Failed to create power list');
      }
    } catch (error) {
      console.error('Create power list error:', error);
      toast.error(error.response?.data?.message || 'Failed to create power list');
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
            <h1 className={`text-3xl font-bold ${textMain}`}>Create New Power List</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Create a new power list with entries and metadata
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/power-lists')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Power Lists
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
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="">Select Category</option>
                <option value="Business">Business</option>
                <option value="Technology">Technology</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Sports">Sports</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Finance">Finance</option>
              </select>
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
                DOCX File *
              </label>
              <input
                type="file"
                name="docx_file"
                accept=".docx"
                onChange={handleFileChange}
                required
                className={`w-full p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Required: Upload a .docx file to automatically parse and create power list entries from the document
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
                placeholder="Brief description of the power list"
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
                placeholder="How was this power list compiled?"
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
              onClick={() => navigate('/admin/power-lists')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Power List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePowerList;