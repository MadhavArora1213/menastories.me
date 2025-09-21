import React, { useEffect, useState } from "react";
import CategoryForm from "../Components/CategoryForm";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import categoryService from "../services/categoryService";

const UpdateCategory = () => {
  const params = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [category, setCategory] = useState(state?.category || null);
  const [parentOptions, setParentOptions] = useState([]);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showSuccess, showError } = useToast();

  const cardBg = isDark
    ? "bg-black border border-white/10"
    : "bg-white border border-black/10";
  const textMain = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-300" : "text-gray-600";
  const btnBg =
    isDark
      ? "bg-white text-black"
      : "bg-black text-white";


  useEffect(() => {
    const load = async () => {
      try {
        if (!category && params.id) {
          const res = await categoryService.getCategory(params.id);
          setCategory(res.data || res.category || res);
        }
        const all = await categoryService.getCategories();

        // Ensure categories is always an array
        let categoriesArray = [];
        if (all && typeof all === 'object') {
          if (Array.isArray(all)) {
            categoriesArray = all;
          } else if (all.data && Array.isArray(all.data)) {
            categoriesArray = all.data;
          } else if (all.categories && Array.isArray(all.categories)) {
            categoriesArray = all.categories;
          } else if (all.data && all.data.categories && Array.isArray(all.data.categories)) {
            categoriesArray = all.data.categories;
          }
        }

        setParentOptions(Array.isArray(categoriesArray) ? categoriesArray.filter(c => !c.parentId) : []);
      } catch (e) {
        console.error('Failed to load category', e);
      }
    };
    load();
  }, [params.id]);

  const handleUpdate = async (data) => {
    try {
      await categoryService.updateCategory(params.id || category.id, data);
      showSuccess('Category updated successfully!');
      navigate('/admin/category/all');
    } catch (e) {
      showError(e.message);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2 flex items-center justify-center transition-colors duration-300`}>
      <div className={`w-full max-w-6xl ${cardBg} rounded-2xl p-8 md:p-12`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className={`text-3xl md:text-4xl font-extrabold mb-2 ${textMain}`}>
              Update Category
            </h2>
            <p className={`text-base ${subText}`}>
              Edit the details and design of your category.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className={`inline-block ${btnBg} px-4 py-2 rounded-lg font-semibold`}>
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
                  d="M12 20h9"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5l-4 1 1-4L16.5 3.5z"
                />
              </svg>
              Edit Category
            </span>
          </div>
        </div>


        {/* Category Form */}
        <div className="border-t pt-8">
          <h3 className={`text-xl font-bold mb-4 ${textMain}`}>
            Category Details
          </h3>
          {category && (
            <CategoryForm initialData={category} onSubmit={handleUpdate} isEdit parentOptions={parentOptions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateCategory;