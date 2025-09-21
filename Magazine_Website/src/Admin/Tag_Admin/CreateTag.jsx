import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { tagService } from "../services/tagService";
import TagForm from "../Components/TagForm";

const CreateTag = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [creating, setCreating] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setCreating(true);
      await tagService.createTag(formData);
      showSuccess("Tag created successfully!");
      navigate("/admin/tags");
    } catch (error) {
      console.error('Failed to create tag:', error);
      console.error('Error response:', JSON.stringify(error.response, null, 2));
      console.error('Error details:', JSON.stringify(error.response?.data, null, 2));
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Failed to create tag';
      showError(`Error: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  const cardBg = isDark ? "bg-black border border-white/10" : "bg-white border border-black/10";
  const textMain = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-300" : "text-gray-600";

  return (
    <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2 flex items-center justify-center transition-colors duration-300`}>
      <div className={`w-full max-w-4xl ${cardBg} rounded-2xl p-8 md:p-12`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className={`text-3xl md:text-4xl font-extrabold mb-2 ${textMain}`}>
              Create New Tag
            </h2>
            <p className={`text-base ${subText}`}>
              Add a new tag for content categorization and organization.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className={`inline-block ${isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-800"} px-4 py-2 rounded-lg font-semibold`}>
              <svg className="inline w-6 h-6 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" />
              </svg>
              Create Mode
            </span>
          </div>
        </div>

        {/* Form */}
        <div className={`rounded-xl p-6 md:p-8 ${isDark ? "bg-gray-800/50" : "bg-gray-50"} border ${isDark ? "border-white/10" : "border-gray-200"}`}>
          <TagForm
            initialData={{}}
            onSubmit={handleSubmit}
            isEdit={false}
            loading={creating}
          />
        </div>

        {/* Help Text */}
        <div className="mt-8">
          <div className={`p-4 rounded-lg ${isDark ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-50 border border-blue-200"}`}>
            <div className="flex items-start gap-3">
              <svg className={`w-5 h-5 mt-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className={`font-semibold mb-1 ${textMain}`}>Tag Creation Guidelines</h4>
                <ul className={`text-sm ${subText} space-y-1`}>
                  <li>• Tag names should be descriptive and relevant to content</li>
                  <li>• Choose appropriate tag types for better organization</li>
                  <li>• Associate tags with categories when applicable</li>
                  <li>• Use parent tags to create hierarchical relationships</li>
                  <li>• Keep tag names concise but meaningful</li>
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
          <button
            onClick={() => navigate("/admin/categories")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              isDark
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Manage Categories →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTag;