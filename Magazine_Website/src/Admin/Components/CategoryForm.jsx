import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import imageUploadService from "../../services/imageUploadService";

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

const CategoryForm = ({ 
  initialData = {}, 
  onSubmit, 
  isEdit = false, 
  inputClass = "",
  loading = false,
  selectedDesign = "design1",
  parentOptions = []
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: initialData.name || "",
    slug: initialData.slug || "",
    description: initialData.description || "",
    design: initialData.design || selectedDesign || "design1",
    status: initialData.status || "active",
    featureImage: initialData.featureImage || "",
    parentId: initialData.parentId || "",
    order: initialData.order || 0,
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData.name) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name,
        slug: initialData.slug || "",
        description: initialData.description || "",
        design: initialData.design || selectedDesign || "design1",
        status: initialData.status || "active",
        featureImage: initialData.featureImage || "",
        parentId: initialData.parentId || "",
        order: initialData.order || 0,
      }));
    }
  }, [initialData, selectedDesign]);

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

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);

      // Validate file before processing
      const validation = imageUploadService.validateImageFile(file);
      if (!validation.isValid) {
        showError(validation.errors.join(', '));
        return;
      }

      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);

      // Store the file in form data for submission with the category
      // Also set the featureImage to the preview URL for immediate display
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        featureImage: previewUrl // Set preview URL immediately
      }));

      showSuccess('Image selected successfully! Preview URL set. Image will be uploaded when you save the category.');
    } catch (error) {
      console.error('File selection failed:', error);
      showError(error.message || 'Failed to process selected image. Please try again.');
    } finally {
      setUploading(false);
    }
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Category name must be less than 100 characters";
    } else if (!/^[a-zA-Z0-9\s\-&()]+$/.test(formData.name.trim())) {
      newErrors.name = "Category name can only contain letters, numbers, spaces, hyphens, ampersands, and parentheses";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    } else if (formData.description && !/^[a-zA-Z0-9\s\.,!?\-&\(\)'"]+$/.test(formData.description)) {
      newErrors.description = "Description can only contain letters, numbers, spaces, and basic punctuation (.,!?-&()')";
    }

    if (formData.order < 0) {
      newErrors.order = "Order must be a non-negative number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        let submitData = formData;

        // If we have a newly uploaded image file, we need to submit as FormData
        if (formData.imageFile) {
          const formDataToSend = new FormData();

          // Add all form fields to FormData
          Object.keys(formData).forEach(key => {
            if (key === 'imageFile') {
              // Add the file with the 'image' field name expected by multer
              formDataToSend.append('image', formData.imageFile);
            } else if (key === 'featureImage') {
              // Skip featureImage when we have a file to upload
              // The backend will generate the proper URL
              return;
            } else if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
              formDataToSend.append(key, formData[key]);
            }
          });

          submitData = formDataToSend;
        }

        await onSubmit(submitData);
      } catch (error) {
        console.error('Form submission error:', error);

        // Handle specific error types
        if (error.response?.status === 503) {
          showError('Database connection error. Please check your Neon DB connection and try again.');
        } else if (error.response?.status === 409) {
          showError('A category with this name already exists. Please choose a different name.');
        } else if (error.response?.status === 400 && error.response?.data?.errors) {
          // Handle validation errors
          const validationErrors = error.response.data.errors;
          const errorMessages = validationErrors.map(err =>
            `${err.field}: ${err.message}`
          ).join('\n');
          showError(`Validation errors:\n${errorMessages}`);
        } else {
          showError(error.response?.data?.message || error.message || 'An error occurred while saving the category.');
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selected Design Display */}
      <div className={`p-4 rounded-lg ${isDark ? "bg-gray-800/50" : "bg-gray-50"} border ${isDark ? "border-white/10" : "border-gray-200"}`}>
        <label className={labelClass}>Selected Design</label>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg ${isDark ? "bg-white" : "bg-black"} flex items-center justify-center`}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={isDark ? "text-black" : "text-white"}>
              {selectedDesign === "design1" && <rect x="4" y="4" width="16" height="16" rx="4" />}
              {selectedDesign === "design2" && <circle cx="12" cy="12" r="8" />}
              {selectedDesign === "design3" && <polygon points="12,4 20,20 4,20" />}
            </svg>
          </div>
          <span className={`font-semibold ${textMain}`}>
            {selectedDesign === "design1" && "Design 1 - Card Grid Layout"}
            {selectedDesign === "design2" && "Design 2 - Table Layout"}
            {selectedDesign === "design3" && "Design 3 - Glassmorphism"}
          </span>
        </div>
      </div>

      {/* Category Name */}
      <div>
        <label htmlFor="name" className={labelClass}>
          Category Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleNameChange}
          className={`${inputBaseClass} ${errors.name ? errorClass : ""}`}
          placeholder="Enter category name"
          disabled={loading}
        />
        {errors.name && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.name}</p>
        )}
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
          placeholder="Enter category description (optional)"
          disabled={loading}
        />
        {errors.description && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.description}</p>
        )}
        <p className={`mt-1 text-xs ${subText}`}>
          {formData.description.length}/500 characters
        </p>
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
          {!isEdit ? "Auto-generated from category name" : "URL-friendly identifier"}
        </p>
      </div>

      {/* Design */}
      <div>
        <label htmlFor="design" className={labelClass}>
          Design
        </label>
        <select
          id="design"
          name="design"
          value={formData.design}
          onChange={handleInputChange}
          className={`${inputBaseClass} ${errors.design ? errorClass : ""}`}
          disabled={loading}
        >
          <option value="design1">Design 1 - Card Grid Layout</option>
          <option value="design2">Design 2 - Table Layout</option>
          <option value="design3">Design 3 - Glassmorphism</option>
        </select>
        {errors.design && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.design}</p>
        )}
        <p className={`mt-1 text-xs ${subText}`}>
          Choose the visual design for this category
        </p>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className={labelClass}>
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className={`${inputBaseClass} ${errors.status ? errorClass : ""}`}
          disabled={loading}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {errors.status && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.status}</p>
        )}
        <p className={`mt-1 text-xs ${subText}`}>
          Set category visibility status
        </p>
      </div>

      {/* Feature Image */}
      <div>
        <label htmlFor="featureImage" className={labelClass}>
          Feature Image
        </label>
        <div className="space-y-3">
          {/* Current Image Preview */}
          {(formData.featureImage || formData.imageFile) && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <img
                src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.featureImage}
                alt="Feature"
                className="w-16 h-16 object-cover rounded-lg border"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                }}
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${textMain}`}>
                  {formData.imageFile ? 'Selected Image' : 'Current Image'}
                </p>
                <p className={`text-xs ${subText} break-all`}>
                  {formData.imageFile ? formData.imageFile.name : formData.featureImage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (formData.imageFile) {
                    // Revoke the preview URL to free memory
                    URL.revokeObjectURL(formData.featureImage);
                  }
                  setFormData(prev => ({ ...prev, featureImage: "", imageFile: null }));
                }}
                className="text-red-500 hover:text-red-700 p-1"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* URL Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${textMain}`}>
              Image URL
            </label>
            <input
              type="url"
              id="featureImage"
              name="featureImage"
              value={formData.featureImage}
              onChange={handleInputChange}
              className={`${inputBaseClass} ${errors.featureImage ? errorClass : ""}`}
              placeholder="https://example.com/image.jpg"
              disabled={loading || uploading}
            />
          </div>

          {/* Upload Options */}
          <div className="flex flex-col gap-3">
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-2 ${textMain}`}>
                Upload New Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={loading || uploading}
              />
              {uploading && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className={`text-sm ${subText}`}>Uploading...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {errors.featureImage && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.featureImage}</p>
        )}
        <p className={`mt-1 text-xs ${subText}`}>
          Optional: Upload a new image (will be optimized and stored locally)
        </p>
      </div>

      {/* Parent Category */}
      <div>
        <label htmlFor="parentId" className={labelClass}>
          Parent Category
        </label>
        <select
          id="parentId"
          name="parentId"
          value={formData.parentId}
          onChange={handleInputChange}
          className={inputBaseClass}
          disabled={loading}
        >
          <option value="">None (Top-level)</option>
          {parentOptions.map((p)=>(
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <p className={`mt-1 text-xs ${subText}`}>
          Select a parent category to create a subcategory, or leave as "None" for a top-level category
        </p>
      </div>

      {/* Display Order */}
      <div>
        <label htmlFor="order" className={labelClass}>
          Display Order
        </label>
        <input
          type="number"
          id="order"
          name="order"
          value={formData.order}
          onChange={handleInputChange}
          min="0"
          className={`${inputBaseClass} ${errors.order ? errorClass : ""}`}
          placeholder="0"
          disabled={loading}
        />
        {errors.order && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.order}</p>
        )}
        <p className={`mt-1 text-xs ${subText}`}>
          Lower numbers appear first
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
              {isEdit ? "Update Category" : "Create Category"}
            </div>
          )}
        </button>
      </div>

    </form>
  );
};

export default CategoryForm;