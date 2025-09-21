import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { subcategoryService } from "../services/subcategoryService";
import categoryService from "../services/categoryService";
import SubCategoryForm from "../Components/SubCategoryForm";
import { useEffect } from "react";

const CreateSubCategory = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [parentOptions, setParentOptions] = useState([]);

  const handleSuccess = (response) => {
    // Navigate after successful creation and image URL update
    setTimeout(() => {
      navigate("/admin/subcategories");
    }, 1000); // Small delay to show the success message
  };

  useEffect(() => {
    const loadParents = async () => {
      try {
        const res = await categoryService.getCategories();

        // Ensure categories is always an array
        let categoriesArray = [];
        if (res && typeof res === 'object') {
          if (Array.isArray(res)) {
            categoriesArray = res;
          } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
            categoriesArray = res.data.data; // Backend returns { data: { data: [...] } }
          } else if (res.data && Array.isArray(res.data)) {
            categoriesArray = res.data;
          } else if (res.categories && Array.isArray(res.categories)) {
            categoriesArray = res.categories;
          } else if (res.data && res.data.categories && Array.isArray(res.data.categories)) {
            categoriesArray = res.data.categories;
          }
        }

        setParentOptions(Array.isArray(categoriesArray) ? categoriesArray : []);
      } catch (e) {
        console.error('Failed to load parent categories');
        setParentOptions([]);
      }
    };
    loadParents();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      console.log('Submitting subcategory data:', formData);

      const response = await subcategoryService.createSubcategory(formData);
      console.log('Subcategory creation response:', response);

      // Return the response so SubCategoryForm can handle image URL updates
      return response;
    } catch (error) {
      console.error('Failed to create subcategory:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // Show more detailed error message
      const errorMessage = error.response?.data?.message ||
                           error.response?.data?.error ||
                           error.message ||
                           'Failed to create subcategory';

      showError(`Error: ${errorMessage}`);
      throw error; // Re-throw so SubCategoryForm can handle it
    } finally {
      setLoading(false);
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
              Create Subcategory
            </h2>
            <p className={`text-base ${subText}`}>
              Create a new subcategory under an existing parent category.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className={`inline-block ${isDark ? "bg-white text-black" : "bg-black text-white"} px-4 py-2 rounded-lg font-semibold`}>
              <svg className="inline w-6 h-6 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Subcategory
            </span>
          </div>
        </div>

        {/* Form */}
        <div className={`rounded-xl p-6 md:p-8 ${isDark ? "bg-gray-800/50" : "bg-gray-50"} border ${isDark ? "border-white/10" : "border-gray-200"}`}>
          <SubCategoryForm
            onSubmit={handleSubmit}
            onSuccess={handleSuccess}
            loading={loading}
            parentOptions={parentOptions}
          />
        </div>


        {/* Navigation */}
        <div className="mt-8 flex justify-between">
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

export default CreateSubCategory;