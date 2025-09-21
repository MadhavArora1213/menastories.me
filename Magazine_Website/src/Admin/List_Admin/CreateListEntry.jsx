import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import listService from '../../services/listService';
import { toast } from 'react-toastify';
import slugify from 'slugify';

const CreateListEntry = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isMasterAdmin } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    rank: '',
    designation: '',
    company: '',
    residence: '',
    description: '',
    nationality: '',
    category: '',
    image: null
  });

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';

  useEffect(() => {
    fetchList();
  }, [listId]);

  const fetchList = async () => {
    try {
      const response = await listService.getList(listId);
      if (response.success) {
        setList(response.data);
      } else {
        toast.error('Failed to fetch list details');
        navigate('/admin/lists');
      }
    } catch (error) {
      console.error('Error fetching list:', error);
      toast.error('Failed to fetch list details');
      navigate('/admin/lists');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };

      // Auto-generate slug from name
      if (name === 'name' && value.trim()) {
        updated.slug = slugify(value, { lower: true, strict: true });
      }

      return updated;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();

      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          if (key === 'image' && formData[key]) {
            submitData.append('image', formData[key]);
          } else if (key !== 'image') {
            submitData.append(key, formData[key]);
          }
        }
      });

      const response = await listService.createListEntry(listId, submitData);

      if (response.success) {
        toast.success('Entry created successfully');
        navigate(`/admin/lists/${listId}/entries`);
      } else {
        toast.error(response.message || 'Failed to create entry');
      }
    } catch (error) {
      console.error('Error creating entry:', error);
      toast.error('Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  if (!list) {
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
            <h1 className={`text-3xl font-bold ${textMain}`}>Add Entry to List</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Add a new entry to "{list.title}"
            </p>
          </div>
          <button
            onClick={() => navigate(`/admin/lists/${listId}/entries`)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Entries
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={`${cardBg} p-6 rounded-lg border`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Enter full name"
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
                placeholder="auto-generated-from-name"
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                URL-friendly version of the name (auto-generated)
              </p>
            </div>

            {/* Rank */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Rank
              </label>
              <input
                type="number"
                name="rank"
                value={formData.rank}
                onChange={handleInputChange}
                min="1"
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="e.g., 1"
              />
            </div>

            {/* Designation */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Designation
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="e.g., CEO, Founder"
              />
            </div>

            {/* Company */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Company name"
              />
            </div>

            {/* Residence */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Residence
              </label>
              <input
                type="text"
                name="residence"
                value={formData.residence}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="City, Country"
              />
            </div>

            {/* Nationality */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Nationality
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="e.g., American, Indian"
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
                placeholder="e.g., Technology, Business"
              />
            </div>

            {/* Image */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Profile Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
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
                rows={4}
                className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Brief description or bio"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/admin/lists/${listId}/entries`)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListEntry;