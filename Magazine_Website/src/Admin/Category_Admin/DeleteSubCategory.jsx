import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useNavigate, useParams } from "react-router-dom";
import { subcategoryService } from "../services/subcategoryService";

const DeleteSubCategory = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  const [subcategory, setSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (id) {
      loadSubcategory();
    }
  }, [id]);

  const loadSubcategory = async () => {
    try {
      setLoading(true);
      const response = await subcategoryService.getSubcategory(id);
      setSubcategory(response.data || response);
    } catch (error) {
      console.error('Failed to load subcategory:', error);
      showError('Failed to load subcategory');
      navigate("/admin/subcategories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirmText !== subcategory?.name) {
      showError("Please type the subcategory name to confirm deletion");
      return;
    }

    try {
      setDeleting(true);
      await subcategoryService.deleteSubcategory(id);
      showSuccess("Subcategory deleted successfully!");
      navigate("/admin/subcategories");
    } catch (error) {
      console.error('Failed to delete subcategory:', error);
      showError(error.response?.data?.message || error.message || 'Failed to delete subcategory');
    } finally {
      setDeleting(false);
    }
  };

  const getDesignInfo = (design) => {
    const designMap = {
      design1: { name: "Design 1", icon: "⊞", color: "bg-blue-500" },
      design2: { name: "Design 2", icon: "☰", color: "bg-green-500" },
      design3: { name: "Design 3", icon: "▤", color: "bg-purple-500" }
    };
    return designMap[design] || { name: "Unknown", icon: "?", color: "bg-gray-500" };
  };

  const cardBg = isDark ? "bg-black border border-white/10" : "bg-white border border-black/10";
  const textMain = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-300" : "text-gray-600";
  const dangerBg = isDark ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200";
  const dangerText = isDark ? "text-red-400" : "text-red-600";

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className={`text-xl ${textMain}`}>Loading subcategory...</p>
        </div>
      </div>
    );
  }

  if (!subcategory) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2 flex items-center justify-center`}>
        <div className="text-center">
          <svg className={`w-16 h-16 mx-auto mb-4 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.966-5.5-2.5M12 4.5C7.305 4.5 3.5 7.305 3.5 11c0 1.155.322 2.25.88 3.245L4.5 16.5h15l-.38-2.255c.558-.995.88-2.09.88-3.245 0-3.695-3.805-6.5-8.5-6.5z" />
          </svg>
          <h3 className={`text-xl font-semibold mb-2 ${textMain}`}>Subcategory not found</h3>
          <p className={`text-sm ${subText} mb-4`}>The subcategory you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate("/admin/subcategories")}
            className={`px-6 py-3 rounded-lg font-medium transition ${isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-900"}`}
          >
            Back to Subcategories
          </button>
        </div>
      </div>
    );
  }

  const designInfo = getDesignInfo(subcategory.design);

  return (
    <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2 flex items-center justify-center transition-colors duration-300`}>
      <div className={`w-full max-w-4xl ${cardBg} rounded-2xl p-8 md:p-12`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className={`text-3xl md:text-4xl font-extrabold mb-2 ${textMain}`}>
              Delete Subcategory
            </h2>
            <p className={`text-base ${subText}`}>
              Permanently remove "{subcategory.name}" from your magazine.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className={`inline-block ${isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-800"} px-4 py-2 rounded-lg font-semibold`}>
              <svg className="inline w-6 h-6 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M4 7h16" />
              </svg>
              Danger Zone
            </span>
          </div>
        </div>

        {/* Warning Alert */}
        <div className={`p-6 rounded-xl mb-8 ${dangerBg} border`}>
          <div className="flex items-start gap-4">
            <svg className={`w-8 h-8 mt-1 ${dangerText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${dangerText}`}>Warning: This action cannot be undone</h3>
              <ul className={`text-sm ${subText} space-y-1`}>
                <li>• All articles in this subcategory will be orphaned</li>
                <li>• Existing URLs pointing to this subcategory will break</li>
                <li>• This may affect your site's SEO and user navigation</li>
                <li>• Consider reassigning articles to another subcategory first</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Subcategory Details */}
        <div className={`p-6 rounded-xl mb-8 ${isDark ? "bg-gray-800/50" : "bg-gray-50"} border ${isDark ? "border-white/10" : "border-gray-200"}`}>
          <h3 className={`text-lg font-semibold mb-4 ${textMain}`}>Subcategory Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${subText}`}>Name</label>
                <p className={`text-lg font-semibold ${textMain}`}>{subcategory.name}</p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${subText}`}>Slug</label>
                <p className={`font-mono text-sm ${textMain}`}>{subcategory.slug}</p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${subText}`}>Status</label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  subcategory.status === 'active'
                    ? (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800')
                    : (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-800')
                }`}>
                  {subcategory.status}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${subText}`}>Design</label>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${designInfo.color}`}>
                    {designInfo.icon} {designInfo.name}
                  </span>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${subText}`}>Display Order</label>
                <p className={`text-sm ${textMain}`}>{subcategory.order}</p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${subText}`}>Description</label>
                <p className={`text-sm ${textMain}`}>{subcategory.description || 'No description'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Form */}
        <div className={`p-6 rounded-xl mb-8 ${isDark ? "bg-gray-800/50" : "bg-gray-50"} border ${isDark ? "border-white/10" : "border-gray-200"}`}>
          <h3 className={`text-lg font-semibold mb-4 ${textMain}`}>Confirm Deletion</h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textMain}`}>
                Type <span className={`font-mono ${dangerText}`}>"{subcategory.name}"</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`Type "${subcategory.name}" here`}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
                  isDark ? "bg-black text-white border-white/20" : "bg-white text-black border-black/20"
                }`}
              />
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting || confirmText !== subcategory.name}
              className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${
                deleting || confirmText !== subcategory.name
                  ? "opacity-50 cursor-not-allowed bg-gray-500"
                  : "hover:scale-105 active:scale-95 bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {deleting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Deleting Subcategory...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M4 7h16" />
                  </svg>
                  Delete Subcategory Permanently
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate("/admin/subcategories")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              isDark
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
          >
            ← Back to Subcategories
          </button>
          <button
            onClick={() => navigate(`/admin/subcategory/update/${id}`)}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              isDark
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Edit Instead →
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSubCategory;