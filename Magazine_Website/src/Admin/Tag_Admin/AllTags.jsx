import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useAdminAuth } from "../context/AdminAuthContext";
import tagService from "../services/tagService";
import { Link, useNavigate } from "react-router-dom";

const AllTags = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showSuccess, showError } = useToast();
  const { hasPermission } = useAdminAuth();
  const navigate = useNavigate();

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await tagService.getAllTags();

      console.log('Raw API response:', response);
      console.log('Response data:', response?.data);
      console.log('Response data.tags:', response?.data?.tags);

      // The backend returns: { tags: [...] }
      // Axios wraps this, so we access response.data.tags
      let tagsData = [];
      if (response && response.data && response.data.tags && Array.isArray(response.data.tags)) {
        tagsData = response.data.tags;
      } else if (response && response.data && Array.isArray(response.data)) {
        tagsData = response.data;
      } else if (Array.isArray(response)) {
        tagsData = response;
      }

      console.log('Loaded tags:', tagsData.length);
      console.log('First tag sample:', tagsData[0]);
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to load tags:', error);
      showError('Failed to load tags');
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (tagId, tagName) => {
    setDeleteTarget({ id: tagId, name: tagName });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await tagService.deleteTag(deleteTarget.id);
      setTags(tags.filter(tag => tag.id !== deleteTarget.id));
      showSuccess(`Tag "${deleteTarget.name}" deleted successfully!`);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete tag:', error);
      showError(error.response?.data?.message || error.message || 'Failed to delete tag');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const handleEdit = (tag) => {
    navigate(`/admin/tag/update/${tag.id}`, {
      state: { tag }
    });
  };

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = !selectedType || tag.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeInfo = (type) => {
    const typeMap = {
      regular: { name: "Regular", color: "bg-blue-500", icon: "🏷️" },
      special_feature: { name: "Special Feature", color: "bg-purple-500", icon: "⭐" },
      trending: { name: "Trending", color: "bg-orange-500", icon: "🔥" },
      multimedia: { name: "Multimedia", color: "bg-green-500", icon: "🎬" },
      interactive: { name: "Interactive", color: "bg-pink-500", icon: "🎮" },
      event: { name: "Event", color: "bg-red-500", icon: "📅" }
    };
    return typeMap[type] || typeMap.regular;
  };

  const cardBg = isDark ? "bg-black border border-white/10" : "bg-white border border-black/10";
  const textMain = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-300" : "text-gray-600";
  const innerCardBg = isDark ? "bg-gray-800/50" : "bg-gray-50";
  const innerBorderColor = isDark ? "border-white/10" : "border-gray-200";

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className={`text-xl ${textMain}`}>Loading tags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2`}>
      <div className={`w-full max-w-7xl mx-auto ${cardBg} rounded-2xl p-8 md:p-12`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className={`text-3xl md:text-4xl font-extrabold mb-2 ${textMain}`}>
              All Tags
            </h2>
            <p className={`text-base ${subText}`}>
              Manage all tags for content categorization and organization.
            </p>
          </div>
          <div className="flex gap-3">
            {/* Only show Create Tag button if user has content.create permission */}
            {hasPermission('content.create') && (
              <Link
                to="/admin/tag/create"
                className={`px-6 py-3 rounded-lg font-bold transition ${isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-900"}`}
              >
                + Create Tag
              </Link>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`${innerCardBg} rounded-xl p-6 border ${innerBorderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${subText}`}>Total Tags</p>
                <p className={`text-3xl font-bold ${textMain}`}>{tags.length}</p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? "bg-white/10" : "bg-black/10"}`}>
                <svg className={`w-6 h-6 ${textMain}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>
          <div className={`${innerCardBg} rounded-xl p-6 border ${innerBorderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${subText}`}>Regular Tags</p>
                <p className={`text-3xl font-bold ${textMain}`}>{tags.filter(tag => tag.type === 'regular').length}</p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? "bg-blue-500/20" : "bg-blue-100"}`}>
                <svg className={`w-6 h-6 ${isDark ? "text-blue-400" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>
          <div className={`${innerCardBg} rounded-xl p-6 border ${innerBorderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${subText}`}>Special Tags</p>
                <p className={`text-3xl font-bold ${textMain}`}>{tags.filter(tag => tag.type !== 'regular').length}</p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? "bg-purple-500/20" : "bg-purple-100"}`}>
                <svg className={`w-6 h-6 ${isDark ? "text-purple-400" : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>
          <div className={`${innerCardBg} rounded-xl p-6 border ${innerBorderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${subText}`}>Categories</p>
                <p className={`text-3xl font-bold ${textMain}`}>{new Set(tags.map(tag => tag.category).filter(Boolean)).size}</p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? "bg-green-500/20" : "bg-green-100"}`}>
                <svg className={`w-6 h-6 ${isDark ? "text-green-400" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className={`block text-sm font-medium mb-2 ${textMain}`}>Search Tags</label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isDark ? "bg-black text-white border-white/20" : "bg-white text-black border-black/20"}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${textMain}`}>Filter by Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isDark ? "bg-black text-white border-white/20" : "bg-white text-black border-black/20"}`}
            >
              <option value="">All Types</option>
              <option value="regular">Regular</option>
              <option value="special_feature">Special Feature</option>
              <option value="trending">Trending</option>
              <option value="multimedia">Multimedia</option>
              <option value="interactive">Interactive</option>
              <option value="event">Event</option>
            </select>
          </div>
        </div>

        {/* Tags Table */}
        <div className={`overflow-x-auto rounded-2xl shadow-2xl ${isDark ? "bg-gray-900" : "bg-white"} border ${innerBorderColor} w-full`}>
          <table className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className={isDark ? "bg-gray-800" : "bg-gray-100"}>
                <th className={`py-4 px-4 text-left font-semibold ${textMain}`}>
                  Name
                </th>
                <th className={`py-4 px-4 text-left font-semibold ${textMain}`}>
                  Slug
                </th>
                <th className={`py-4 px-4 text-left font-semibold ${textMain}`}>
                  Type
                </th>
                <th className={`py-4 px-4 text-left font-semibold ${textMain}`}>
                  Category
                </th>
                <th className={`py-4 px-4 text-left font-semibold ${textMain}`}>
                  Description
                </th>
                <th className={`py-4 px-4 text-center font-semibold ${textMain}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTags.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center"
                  >
                    <svg className={`w-16 h-16 mx-auto mb-4 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <h3 className={`text-xl font-semibold mb-2 ${textMain}`}>No tags found</h3>
                    <p className={`text-sm ${subText} mb-4`}>
                      {searchTerm || selectedType ? "Try adjusting your search or filter criteria." : "Create your first tag to get started."}
                    </p>
                    {!searchTerm && !selectedType && hasPermission('content.create') && (
                      <Link
                        to="/admin/tag/create"
                        className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition ${isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-900"}`}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create First Tag
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTags.map((tag, idx) => {
                  const typeInfo = getTypeInfo(tag.type);

                  return (
                    <tr
                      key={tag.id}
                      className={
                        idx % 2 === 0
                          ? `${isDark ? "bg-gray-900" : "bg-white"} hover:${isDark ? "bg-gray-800" : "bg-gray-100"} transition`
                          : `${isDark ? "bg-gray-800" : "bg-gray-50"} hover:${isDark ? "bg-gray-800" : "bg-gray-100"} transition`
                      }
                    >
                      <td className={`py-3 px-4 font-medium ${textMain}`}>
                        {tag.name}
                      </td>
                      <td className={`py-3 px-4 ${subText}`}>
                        {tag.slug}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${typeInfo.color}`}>
                          {typeInfo.icon} {typeInfo.name}
                        </span>
                      </td>
                      <td className={`py-3 px-4 ${subText}`}>
                        {tag.category || 'No Category'}
                      </td>
                      <td className={`py-3 px-4 ${subText}`}>
                        {tag.description || 'No description'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-row gap-2 justify-center items-center">
                          {/* Edit button - Show if user has content.edit permission */}
                          {hasPermission('content.edit') && (
                            <button
                              onClick={() => handleEdit(tag)}
                              className={`inline-flex items-center gap-1 ${isDark ? "bg-white hover:bg-gray-200 text-black" : "bg-black hover:bg-gray-800 text-white"} px-3 py-1 rounded transition shadow`}
                              title="Edit"
                            >
                              <svg
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
                              </svg>
                              Edit
                            </button>
                          )}

                          {/* Delete button - Show if user has content.delete permission */}
                          {hasPermission('content.delete') && (
                            <button
                              onClick={() => handleDeleteClick(tag.id, tag.name)}
                              className={`inline-flex items-center gap-1 ${isDark ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"} px-3 py-1 rounded transition shadow`}
                              title="Delete"
                            >
                              <svg
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <rect x="5" y="7" width="14" height="12" rx="2" />
                                <path d="M9 11v6M15 11v6" strokeLinecap="round" />
                                <path d="M10 7V5a2 2 0 0 1 4 0v2" />
                              </svg>
                              Delete
                            </button>
                          )}

                          {/* Show message if no actions available */}
                          {!hasPermission('content.edit') && !hasPermission('content.delete') && (
                            <span className={`text-xs ${subText}`}>No actions available</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && deleteTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-full ${isDark ? "bg-red-500/20" : "bg-red-100"}`}>
                    <svg className={`w-6 h-6 ${isDark ? "text-red-400" : "text-red-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${textMain}`}>Delete Tag</h3>
                    <p className={`text-sm ${subText}`}>This action cannot be undone</p>
                  </div>
                </div>

                <div className={`p-4 rounded-lg mb-6 ${isDark ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
                  <p className={`text-sm ${textMain}`}>
                    Are you sure you want to delete <span className="font-semibold">"{deleteTarget.name}"</span>?
                  </p>
                  <p className={`text-xs ${subText} mt-2`}>
                    This will permanently remove the tag and may affect existing content associations.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteCancel}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-900"}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTags;