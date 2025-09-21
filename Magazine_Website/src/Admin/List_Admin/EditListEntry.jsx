import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import listService from '../../services/listService';
import { toast } from 'react-toastify';
import slugify from 'slugify';

const EditListEntry = () => {
  const { listId, entryId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isMasterAdmin } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
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
    image: null,
    status: 'active'
  });

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';

  useEffect(() => {
    fetchEntry();
  }, [listId, entryId]);

  const fetchEntry = async () => {
    try {
      setFetchLoading(true);

      // Fetch list details
      const listResponse = await listService.getList(listId);
      if (listResponse.success) {
        setList(listResponse.data);
      }

      // Fetch entry details
      const entryResponse = await listService.getListEntry(entryId);
      if (entryResponse.success) {
        const entry = entryResponse.data;
        setFormData({
          name: entry.name || '',
          slug: entry.slug || '',
          rank: entry.rank || '',
          designation: entry.designation || '',
          company: entry.company || '',
          residence: entry.residence || '',
          description: entry.description || '',
          nationality: entry.nationality || '',
          category: entry.category || '',
          image: null,
          status: entry.status || 'active'
        });
      } else {
        toast.error('Failed to fetch entry');
        navigate(`/admin/lists/${listId}/entries`);
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
      toast.error('Failed to fetch entry');
      navigate(`/admin/lists/${listId}/entries`);
    } finally {
      setFetchLoading(false);
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
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === 'image' && formData[key]) {
            submitData.append('image', formData[key]);
          } else if (key !== 'image') {
            submitData.append(key, formData[key]);
          }
        }
      });

      const response = await listService.updateListEntry(entryId, submitData);

      if (response.success) {
        toast.success('Entry updated successfully');
        navigate(`/admin/lists/${listId}/entries`);
      } else {
        toast.error(response.message || 'Failed to update entry');
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('Failed to update entry');
    } finally {
      setLoading(false);
    }
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

  if (!list) {
    return (
      <div className={`min-h-screen ${bgMain} p-6`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>List not found</p>
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
            <h1 className={`text-3xl font-bold ${textMain}`}>Edit Entry</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Update entry in "{list.title}"
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListEntry;