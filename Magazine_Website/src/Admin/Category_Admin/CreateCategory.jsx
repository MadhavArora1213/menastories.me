import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryForm from "../Components/CategoryForm";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import categoryService from "../services/categoryService";
import { useEffect } from "react";

const CreateCategory = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [parentOptions, setParentOptions] = useState([]);
  const { showSuccess, showError } = useToast();

  // Tailwind classes for input fields in both themes
  const inputClass = isDark
    ? "bg-black text-white border-white/20 placeholder-gray-400"
    : "bg-white text-black border-black/20 placeholder-gray-400";

  const handleCreate = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoryService.createCategory(data);

      showSuccess("Category created successfully!");
      console.log('Created category:', response.data);

      // Redirect to categories list
      navigate('/admin/category/all');
    } catch (err) {
      setError(err.message);
      showError(`Error creating category: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
          } else if (res.data && Array.isArray(res.data)) {
            categoriesArray = res.data;
          } else if (res.categories && Array.isArray(res.categories)) {
            categoriesArray = res.categories;
          } else if (res.data && res.data.categories && Array.isArray(res.data.categories)) {
            categoriesArray = res.data.categories;
          }
        }

        setParentOptions(Array.isArray(categoriesArray) ? categoriesArray.filter(c => !c.parentId) : []);
      } catch (e) {
        console.error('Failed to load parent categories');
        setParentOptions([]);
      }
    };
    loadParents();
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2 flex items-center justify-center transition-colors duration-300`}>
      <div className={`w-full max-w-6xl ${isDark ? "bg-black border border-white/10" : "bg-white border border-black/10"} rounded-2xl p-8 md:p-12`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className={`text-3xl md:text-4xl font-extrabold mb-2 ${isDark ? "text-white" : "text-black"}`}>
              Create New Category
            </h2>
            <p className={`text-base ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Add a new category to your magazine and choose a design for it.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className={`inline-block ${isDark ? "bg-white text-black" : "bg-black text-white"} px-4 py-2 rounded-lg font-semibold`}>
              <svg
                className="inline w-6 h-6 mr-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Category
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}


        {/* Category Form */}
        <div className="border-t pt-8">
          <h3 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}>
            Category Details
          </h3>
          <CategoryForm
            onSubmit={handleCreate}
            inputClass={inputClass}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;