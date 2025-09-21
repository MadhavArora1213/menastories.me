import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const CreatePowerListEntry = () => {
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
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rank: '',
    designation: '',
    organization: '',
    category: '',
    industry: '',
    location: '',
    nationality: '',
    age: '',
    gender: '',
    achievements: '',
    shortBio: '',
    meta_title: '',
    meta_description: ''
  });

  // Fetch power list details
  const fetchPowerList = async () => {
    try {
      const response = await api.get(`/lists/power-lists/${id}`);
      setPowerList(response.data.data);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showError('Name is required');
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        rank: formData.rank ? parseInt(formData.rank) : null,
        age: formData.age ? parseInt(formData.age) : null
      };

      await api.post(`/lists/power-lists/${id}/entries`, submitData);
      showSuccess('Entry created successfully');
      navigate(`/admin/power-lists/${id}/entries`);
    } catch (error) {
      console.error('Error creating entry:', error);
      if (error.response?.status === 403) {
        showError('Access denied: You do not have permission to add entries to this power list');
      } else {
        showError(error.response?.data?.message || 'Failed to create entry');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bgMain} p-6`}>
        <div className="max-w-4xl mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 text-center ${textMain}`}>Loading...</p>
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
            <h1 className={`text-3xl font-bold ${textMain}`}>Add Entry</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Add a new entry to {powerList.title}
            </p>
          </div>
          <Link
            to={`/admin/power-lists/${id}/entries`}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Entries
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={`${cardBg} p-6 rounded-lg border`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full p-2 border rounded ${inputBg}`}
                placeholder="Enter full name"
              />
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
                className={`w-full p-2 border rounded ${inputBg}`}
                placeholder="Enter rank (optional)"
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
                className={`w-full p-2 border rounded ${inputBg}`}
                placeholder="Enter designation"
              />
            </div>

            {/* Organization */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Organization
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${inputBg}`}
                placeholder="Enter organization"
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
                className={`w-full p-2 border rounded ${inputBg}`}
                placeholder="Enter category"
              />
            </div>

            {/* Industry */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Industry
              </label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${inputBg}`}
                placeholder="Enter industry"
              />
            </div>

            {/* Location */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${inputBg}`}
                placeholder="Enter location"
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
                className={`w-full p-2 border rounded ${inputBg}`}
                placeholder="Enter nationality"
              />
            </div>

            {/* Age */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${inputBg}`}
                placeholder="Enter age"
              />
            </div>

            {/* Gender */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${inputBg}`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Achievements */}
          <div className="mt-6">
            <label className={`block text-sm font-medium ${textMain} mb-2`}>
              Achievements
            </label>
            <textarea
              name="achievements"
              value={formData.achievements}
              onChange={handleInputChange}
              rows={3}
              className={`w-full p-2 border rounded ${inputBg}`}
              placeholder="Enter achievements"
            />
          </div>

          {/* Short Bio */}
          <div className="mt-6">
            <label className={`block text-sm font-medium ${textMain} mb-2`}>
              Short Bio
            </label>
            <textarea
              name="shortBio"
              value={formData.shortBio}
              onChange={handleInputChange}
              rows={4}
              className={`w-full p-2 border rounded ${inputBg}`}
              placeholder="Enter short bio"
            />
          </div>

          {/* SEO Fields */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Meta Title
              </label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${inputBg}`}
                placeholder="Enter meta title"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Meta Description
              </label>
              <input
                type="text"
                name="meta_description"
                value={formData.meta_description}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${inputBg}`}
                placeholder="Enter meta description"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <Link
              to={`/admin/power-lists/${id}/entries`}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePowerListEntry;