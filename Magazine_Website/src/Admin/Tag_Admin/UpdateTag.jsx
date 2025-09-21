import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { tagService } from "../services/tagService";
import TagForm from "../Components/TagForm";

const UpdateTag = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();

  const [tag, setTag] = useState(state?.tag || null);
  const [loading, setLoading] = useState(!state?.tag);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (!tag && id) {
          const res = await tagService.getTag(id);
          setTag(res.data || res.tag || res);
        }
      } catch (e) {
        console.error('Failed to load tag', e);
        showError('Failed to load tag');
        navigate("/admin/tags");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      load();
    }
  }, [id, tag, navigate, showError]);

  const handleSubmit = async (formData) => {
    try {
      setUpdating(true);
      const response = await tagService.updateTag(id, formData);
      console.log('Update response:', response);

      showSuccess("Tag updated successfully!");
      navigate("/admin/tags");
    } catch (error) {
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors.map((err, index) =>
          `${err.field}: ${err.message}`
        ).join(', ');
        showError(`Validation failed: ${validationErrors}`);
      }

      if (error.response?.status === 401) {
        showError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        showError('You do not have permission to update tags.');
      } else if (error.response?.status === 400) {
        const validationErrors = error.response?.data?.errors;
        if (validationErrors && Array.isArray(validationErrors)) {
          const errorMessages = validationErrors.map(err => `${err.field}: ${err.message}`).join(', ');
          showError(`Validation failed: ${errorMessages}`);
        } else {
          showError(error.response?.data?.message || 'Validation failed. Please check your input.');
        }
      } else {
        showError(error.response?.data?.message || error.message || 'Failed to update tag');
      }
    } finally {
      setUpdating(false);
    }
  };

  const cardBg = isDark ? "bg-black border border-white/10" : "bg-white border border-black/10";
  const textMain = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-300" : "text-gray-600";

  const getTypeInfo = (type) => {
    const typeMap = {
      regular: { name: "Regular", color: "bg-blue-500", description: "Standard tag for content categorization" },
      special_feature: { name: "Special Feature", color: "bg-purple-500", description: "Tags for special content features" },
      trending: { name: "Trending", color: "bg-orange-500", description: "Currently trending topics" },
      multimedia: { name: "Multimedia", color: "bg-green-500", description: "Tags for multimedia content" },
      interactive: { name: "Interactive", color: "bg-pink-500", description: "Tags for interactive content" },
      event: { name: "Event", color: "bg-red-500", description: "Tags for events and announcements" }
    };
    return typeMap[type] || typeMap.regular;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className={`text-xl ${textMain}`}>Loading tag...</p>
        </div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2 flex items-center justify-center`}>
        <div className="text-center">
          <svg className={`w-16 h-16 mx-auto mb-4 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.966-5.5-2.5M12 4.5C7.305 4.5 3.5 7.305 3.5 11c0 1.155.322 2.25.88 3.245L4.5 16.5h15l-.38-2.255c.558-.995.88-2.09.88-3.245 0-3.695-3.805-6.5-8.5-6.5z" />
          </svg>
          <h3 className={`text-xl font-semibold mb-2 ${textMain}`}>Tag not found</h3>
          <p className={`text-sm ${subText} mb-4`}>The tag you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate("/admin/tags")}
            className={`px-6 py-3 rounded-lg font-medium transition ${isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-900"}`}
          >
            Back to Tags
          </button>
        </div>
      </div>
    );
  }

  const typeInfo = getTypeInfo(tag.type);

  return (
    <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2 flex items-center justify-center transition-colors duration-300`}>
      <div className={`w-full max-w-4xl ${cardBg} rounded-2xl p-8 md:p-12`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className={`text-3xl md:text-4xl font-extrabold mb-2 ${textMain}`}>
              Update Tag
            </h2>
            <p className={`text-base ${subText}`}>
              Modify the details of "{tag?.name || 'Loading...'}".
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className={`inline-block ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-800"} px-4 py-2 rounded-lg font-semibold`}>
              <svg className="inline w-6 h-6 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Mode
            </span>
          </div>
        </div>

        {/* Current Info */}
        <div className={`p-4 rounded-lg mb-6 ${isDark ? "bg-gray-800/50" : "bg-gray-50"} border ${isDark ? "border-white/10" : "border-gray-200"}`}>
          <h3 className={`font-semibold mb-2 ${textMain}`}>Current Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className={`font-medium ${subText}`}>Name:</span>
              <span className={`ml-2 ${textMain}`}>{tag.name}</span>
            </div>
            <div>
              <span className={`font-medium ${subText}`}>Slug:</span>
              <span className={`ml-2 ${textMain}`}>{tag.slug}</span>
            </div>
            <div>
              <span className={`font-medium ${subText}`}>Type:</span>
              <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${typeInfo.color}`}>
                {typeInfo.name}
              </span>
            </div>
            <div>
              <span className={`font-medium ${subText}`}>Category:</span>
              <span className={`ml-2 ${textMain}`}>{tag.category || 'No Category'}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className={`rounded-xl p-6 md:p-8 ${isDark ? "bg-gray-800/50" : "bg-gray-50"} border ${isDark ? "border-white/10" : "border-gray-200"}`}>
          {tag && (
            <TagForm
              initialData={tag}
              onSubmit={handleSubmit}
              isEdit={true}
              loading={updating}
            />
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8">
          <div className={`p-4 rounded-lg ${isDark ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"}`}>
            <div className="flex items-start gap-3">
              <svg className={`w-5 h-5 mt-0.5 ${isDark ? "text-amber-400" : "text-amber-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className={`font-semibold mb-1 ${textMain}`}>Update Considerations</h4>
                <ul className={`text-sm ${subText} space-y-1`}>
                  <li>• Changing the tag name will automatically update the slug</li>
                  <li>• Type changes may affect how the tag is displayed and used</li>
                  <li>• Category association helps organize tags hierarchically</li>
                  <li>• Parent tag relationships create tag hierarchies</li>
                  <li>• Description changes are reflected immediately</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => navigate("/admin/tags")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              isDark
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
          >
            ← Back to Tags
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/admin/tag/delete/${id}`)}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                isDark
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              Delete Tag
            </button>
            <button
              onClick={() => navigate("/admin/tag/create")}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                isDark
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Create New Tag →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateTag;