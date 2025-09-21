import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { tagService } from "../services/tagService";
import categoryService from "../services/categoryService";

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text

const TagForm = ({
  initialData = {},
  onSubmit,
  isEdit = false,
  inputClass = "",
  loading = false
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: initialData.name || "",
    slug: initialData.slug || "",
    type: initialData.type || "regular",
    category: initialData.category || "",
    categoryId: initialData.categoryId || "",
    parentId: initialData.parentId || "",
    description: initialData.description || ""
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    if (initialData && (initialData.name || initialData.id)) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        type: initialData.type || "regular",
        category: initialData.category || "",
        categoryId: initialData.categoryId || "",
        parentId: initialData.parentId || "",
        description: initialData.description || ""
      });
    }
  }, [initialData]);

  // Load categories and tags on component mount
  useEffect(() => {
    loadCategories();
    loadAvailableTags();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      console.log('Categories API response:', response);
      let categoriesData = [];
      if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Backend returns { success: true, data: [...] }, axios wraps it
        categoriesData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.categories && Array.isArray(response.categories)) {
        categoriesData = response.categories;
      }
      console.log('Loaded categories:', categoriesData.length);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
      showError('Failed to load categories');
    }
  };

  const loadAvailableTags = async () => {
    try {
      const response = await tagService.getAllTags();
      console.log('Available tags API response:', response);
      let tagsData = [];
      if (Array.isArray(response)) {
        tagsData = response;
      } else if (response.data && response.data.tags && Array.isArray(response.data.tags)) {
        // Backend returns { tags: [...] }, axios wraps it
        tagsData = response.data.tags;
      } else if (response.data && Array.isArray(response.data)) {
        tagsData = response.data;
      } else if (response.tags && Array.isArray(response.tags)) {
        tagsData = response.tags;
      }
      console.log('Loaded available tags:', tagsData.length);
      // Filter out current tag if editing
      const filteredTags = tagsData.filter(tag => tag.id !== initialData.id);
      setAvailableTags(filteredTags);
    } catch (error) {
      console.error('Failed to load tags:', error);
      showError('Failed to load available tags');
    }
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({ ...prev, name }));

    // Auto-generate slug
    if (name) {
      const slug = slugify(name);
      setFormData(prev => ({ ...prev, slug }));
    } else {
      setFormData(prev => ({ ...prev, slug: "" }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    setFormData(prev => ({
      ...prev,
      categoryId,
      category: selectedCategory ? selectedCategory.name : ""
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tag name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Tag name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Tag name must be less than 50 characters";
    } else if (!/^[a-zA-Z0-9\s\-&()]+$/.test(formData.name.trim())) {
      newErrors.name = "Tag name can only contain letters, numbers, spaces, hyphens, ampersands, and parentheses";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9\-]+$/.test(formData.slug.trim())) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Prepare form data - convert empty strings to null for UUID fields
        const submitData = {
          ...formData,
          parentId: formData.parentId === "" ? null : formData.parentId,
          categoryId: formData.categoryId === "" ? null : formData.categoryId
        };

        console.log('Submitting tag data:', JSON.stringify(submitData, null, 2));
        await onSubmit(submitData);
      } catch (error) {
        console.error('Form submission error:', error);

        // Handle specific error types
        if (error.response?.status === 409) {
          showError('A tag with this name already exists. Please choose a different name.');
        } else if (error.response?.status === 400 && error.response?.data?.errors) {
          // Handle validation errors
          const validationErrors = error.response.data.errors;
          const errorMessages = validationErrors.map(err =>
            `${err.field}: ${err.message}`
          ).join('\n');
          showError(`Validation errors:\n${errorMessages}`);
        } else {
          showError(error.response?.data?.message || error.message || 'An error occurred while saving the tag.');
        }
      }
    }
  };

  const textMain = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-300" : "text-gray-600";
  const errorText = "text-red-500";
  const labelClass = `block text-sm font-medium mb-2 ${textMain}`;
  const inputBaseClass = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${inputClass}`;
  const errorClass = `border-red-500 focus:ring-red-500`;

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

  const typeInfo = getTypeInfo(formData.type);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tag Type Display */}
      <div className={`p-4 rounded-lg ${isDark ? "bg-gray-800/50" : "bg-gray-50"} border ${isDark ? "border-white/10" : "border-gray-200"}`}>
        <label className={labelClass}>Tag Type</label>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg ${typeInfo.color} flex items-center justify-center`}>
            <span className="text-white font-bold text-lg">
              {typeInfo.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className={`font-semibold ${textMain}`}>{typeInfo.name}</p>
            <p className={`text-xs ${subText}`}>{typeInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Tag Name */}
      <div>
        <label htmlFor="name" className={labelClass}>
          Tag Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleNameChange}
          className={`${inputBaseClass} ${errors.name ? errorClass : ""}`}
          placeholder="Enter tag name"
          disabled={loading}
        />
        {errors.name && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.name}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className={labelClass}>
          Slug
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleInputChange}
          className={`${inputBaseClass} ${errors.slug ? errorClass : ""} ${isEdit ? "" : "bg-gray-100 dark:bg-gray-800"}`}
          placeholder="Auto-generated from name"
          disabled={loading || !isEdit}
          readOnly={!isEdit}
        />
        {errors.slug && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.slug}</p>
        )}
        <p className={`mt-1 text-xs ${subText}`}>
          {!isEdit ? "Auto-generated from tag name" : "URL-friendly identifier"}
        </p>
      </div>

      {/* Type Selection */}
      <div>
        <label htmlFor="type" className={labelClass}>
          Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className={`${inputBaseClass} ${errors.type ? errorClass : ""}`}
          disabled={loading}
        >
          <option value="regular">Regular</option>
          <option value="special_feature">Special Feature</option>
          <option value="trending">Trending</option>
          <option value="multimedia">Multimedia</option>
          <option value="interactive">Interactive</option>
          <option value="event">Event</option>
        </select>
        {errors.type && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.type}</p>
        )}
        <p className={`mt-1 text-xs ${subText}`}>
          Choose the type of tag
        </p>
      </div>

      {/* Category Selection */}
      <div>
        <label htmlFor="categoryId" className={labelClass}>
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleCategoryChange}
          className={`${inputBaseClass} ${errors.categoryId ? errorClass : ""}`}
          disabled={loading}
        >
          <option value="">No Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.categoryId}</p>
        )}
        <p className={`mt-1 text-xs ${subText}`}>
          Optional: Associate this tag with a category
        </p>
      </div>

      {/* Parent Tag Selection */}
      <div>
        <label htmlFor="parentId" className={labelClass}>
          Parent Tag
        </label>
        <select
          id="parentId"
          name="parentId"
          value={formData.parentId}
          onChange={handleInputChange}
          className={`${inputBaseClass} ${errors.parentId ? errorClass : ""}`}
          disabled={loading}
        >
          <option value="">No Parent</option>
          {availableTags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
        {errors.parentId && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.parentId}</p>
        )}
        <p className={`mt-1 text-xs ${subText}`}>
          Optional: Create hierarchical tag relationships
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="3"
          className={`${inputBaseClass} ${errors.description ? errorClass : ""}`}
          placeholder="Enter tag description (optional)"
          disabled={loading}
        />
        {errors.description && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.description}</p>
        )}
        <p className={`mt-1 text-xs ${subText}`}>
          {formData.description.length}/200 characters
        </p>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${
            loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:scale-105 active:scale-95"
          } ${
            isDark
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              {isEdit ? "Updating..." : "Creating..."}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                {isEdit ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                )}
              </svg>
              {isEdit ? "Update Tag" : "Create Tag"}
            </div>
          )}
        </button>
      </div>
    </form>
  );
};

export default TagForm;