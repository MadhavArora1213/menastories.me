import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const PowerListView = () => {
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

  // Fetch power list
  const fetchPowerList = async () => {
    try {
      setLoading(true);
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
            <h1 className={`text-3xl font-bold ${textMain}`}>{powerList.title}</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Created by {powerList.creator?.username || 'Unknown'} • {new Date(powerList.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              to={`/admin/power-lists/${id}/edit`}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Power List
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

        {/* Power List Details */}
        <div className={`${cardBg} p-6 rounded-lg border mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className={`text-lg font-semibold ${textMain} mb-4`}>Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium ${textMain}`}>Title</label>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{powerList.title}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textMain}`}>Slug</label>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{powerList.slug}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textMain}`}>Category</label>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{powerList.category || 'N/A'}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textMain}`}>Year</label>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{powerList.year || 'N/A'}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textMain}`}>Status</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    powerList.status === 'published' ? 'bg-green-100 text-green-800' :
                    powerList.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {powerList.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className={`text-lg font-semibold ${textMain} mb-4`}>Content & Features</h3>
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium ${textMain}`}>Description</label>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{powerList.description || 'No description'}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textMain}`}>Methodology</label>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{powerList.methodology || 'N/A'}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textMain}`}>Entries Count</label>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{powerList.powerListEntries?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {powerList.featuredImage && (
            <div className="mt-6">
              <label className={`block text-sm font-medium ${textMain} mb-2`}>Featured Image</label>
              <img
                src={powerList.featuredImage.startsWith('http') ? powerList.featuredImage : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${powerList.featuredImage.replace('/api', '')}`}
                alt={powerList.title}
                className="max-w-md h-auto rounded-lg"
                onError={(e) => {
                  e.target.src = '/placeholder-image.png';
                }}
              />
              {powerList.imageCaption && (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                  {powerList.imageCaption}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {powerList.content && (
          <div className={`${cardBg} p-6 rounded-lg border mb-6`}>
            <h3 className={`text-lg font-semibold ${textMain} mb-4`}>Content</h3>
            <div
              className={`${isDark ? 'text-gray-300' : 'text-gray-600'} prose max-w-none`}
              dangerouslySetInnerHTML={{ __html: powerList.content }}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className={`${cardBg} p-6 rounded-lg border`}>
          <h3 className={`text-lg font-semibold ${textMain} mb-4`}>Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Link
              to={`/admin/power-lists/${id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Edit Power List
            </Link>
            <Link
              to={`/admin/power-lists/${id}/entries`}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Manage Entries ({powerList.powerListEntries?.length || 0})
            </Link>
            <Link
              to="/admin/power-lists/create"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              Create New Power List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerListView;