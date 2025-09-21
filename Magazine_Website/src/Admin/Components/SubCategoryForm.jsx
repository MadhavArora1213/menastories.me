import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { subcategoryService } from "../services/subcategoryService";
import { mediaService } from "../../services/cmsService";
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

const SubCategoryForm = ({
  initialData = {},
  onSubmit,
  onSuccess,
  isEdit = false,
  inputClass = "",
  loading = false,
  parentOptions = null
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: initialData.name || "",
    slug: initialData.slug || "",
    description: initialData.description || "",
    categoryId: initialData.categoryId || "",
    parentCategory: initialData.category || initialData.parentCategory || "",
    type: initialData.type || "regular",
    status: initialData.status || "active",
    order: initialData.order || 0,
    featureImage: initialData.featureImage || "",
    metaTitle: initialData.metaTitle || "",
    metaDescription: initialData.metaDescription || "",
    imageFile: null, // Add imageFile for optimized upload
  });

  const [errors, setErrors] = useState({});
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [availableMedia, setAvailableMedia] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (initialData && (initialData.name || initialData.id)) {
      // Revoke previous preview URL if exists
      if (previewUrl) {
        imageUploadService.revokePreviewUrl(previewUrl);
        setPreviewUrl(null);
      }

      const newFormData = {
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        categoryId: initialData.categoryId || "",
        parentCategory: initialData.category || initialData.parentCategory || "",
        type: initialData.type || "regular",
        status: initialData.status || "active",
        order: initialData.order || 0,
        featureImage: initialData.featureImage || "",
        metaTitle: initialData.metaTitle || "",
        metaDescription: initialData.metaDescription || "",
        imageFile: null,
      };
      setFormData(newFormData);
    }
  }, [initialData, previewUrl]);

  // Load parent categories on component mount
  useEffect(() => {
    if (parentOptions) {
      setParentCategories(parentOptions);
    } else {
      loadParentCategories();
    }
  }, [parentOptions]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        imageUploadService.revokePreviewUrl(previewUrl);
      }
    };
  }, [previewUrl]);

  // Debug: Monitor form data changes
  useEffect(() => {
    console.log('📊 Form data changed:', {
      featureImage: formData.featureImage,
      hasImageFile: !!formData.imageFile,
      imageFileName: formData.imageFile?.name || 'No file'
    });
  }, [formData.featureImage, formData.imageFile]);

  const loadParentCategories = async () => {
    try {
      const response = await subcategoryService.getParentCategories();

      // Handle different response formats
      let categoriesData = [];
      if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response && typeof response === 'object') {
        // Check various possible structures
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          categoriesData = response.data.data; // Backend returns { data: { data: [...] } }
        } else if (response.data && Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (response.categories && Array.isArray(response.categories)) {
          categoriesData = response.categories;
        } else if (response.items && Array.isArray(response.items)) {
          categoriesData = response.items;
        } else {
          categoriesData = [];
        }
      } else {
        categoriesData = [];
      }

      setParentCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load parent categories:', error);
      showError('Failed to load parent categories');
      setParentCategories([]);
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

      // Optimize the image (compress and convert to WebP)
      const optimizedFile = await imageUploadService.optimizeImage(file);

      // Revoke previous preview URL if exists
      if (previewUrl) {
        imageUploadService.revokePreviewUrl(previewUrl);
      }

      // Create preview URL for the optimized image
      const newPreviewUrl = imageUploadService.createPreviewUrl(optimizedFile);
      setPreviewUrl(newPreviewUrl);

      // Store the optimized file in form data for submission with the subcategory
      // Also set the featureImage to the preview URL for immediate display
      setFormData(prev => ({
        ...prev,
        imageFile: optimizedFile,
        featureImage: newPreviewUrl // Set preview URL immediately
      }));

      // Force a re-render to update the form display
      setFormData(current => ({ ...current }));

      // Debug logging to track form data updates
      console.log('🔄 Form data updated after image upload:', {
        featureImage: newPreviewUrl,
        imageFile: optimizedFile?.name || 'No file',
        hasPreviewUrl: !!newPreviewUrl
      });

      showSuccess('Image optimized and selected successfully! Preview URL set. Image will be uploaded when you save the subcategory.');
    } catch (error) {
      console.error('File selection failed:', error);
      showError(error.message || 'Failed to process selected image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleMediaSelect = (media) => {
    setFormData(prev => ({ ...prev, featureImage: media.url }));
    setShowMediaSelector(false);
  };

  const loadAvailableMedia = async () => {
    try {
      const response = await mediaService.getMedia({ type: 'image', limit: 50 });

      // Handle different response structures
      let mediaArray = [];
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          mediaArray = response;
        } else if (response.data && Array.isArray(response.data)) {
          mediaArray = response.data;
        } else if (response.media && Array.isArray(response.media)) {
          mediaArray = response.media;
        } else if (response.data && response.data.media && Array.isArray(response.data.media)) {
          mediaArray = response.data.media;
        }
      }

      setAvailableMedia(mediaArray);
    } catch (error) {
      console.error('Failed to load media:', error);
      setAvailableMedia([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Subcategory name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Subcategory name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Subcategory name must be less than 100 characters";
    } else if (!/^[a-zA-Z0-9\s\-&()]+$/.test(formData.name.trim())) {
      newErrors.name = "Subcategory name can only contain letters, numbers, spaces, hyphens, ampersands, and parentheses";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Parent category is required for subcategories";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    } else if (formData.description && !/^[a-zA-Z0-9\s\.,!?\-&\(\)'"]+$/.test(formData.description)) {
      newErrors.description = "Description can only contain letters, numbers, spaces, and basic punctuation (.,!?-&()')";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        let submitData = formData;

        // Always use FormData for consistency with backend expectations
        const formDataToSend = new FormData();

        // Add all form fields to FormData
        Object.keys(formData).forEach(key => {
          if (key === 'imageFile' && formData.imageFile) {
            // Add the file with the 'image' field name expected by multer
            formDataToSend.append('image', formData.imageFile);
          } else if (key === 'parentCategory') {
            // Skip parentCategory as it's not needed in the backend
            return;
          } else if (key === 'imageFile') {
            // Skip imageFile key if no file
            return;
          } else if (key === 'featureImage' && formData.imageFile) {
            // Don't send featureImage when uploading a file - backend will generate the URL
            return;
          } else if (formData[key] !== undefined && formData[key] !== null) {
            // Send all non-null values, including empty strings
            formDataToSend.append(key, formData[key]);
          }
        });

        submitData = formDataToSend;

        // Debug logging for form submission
        console.log('🔄 Submitting subcategory form:');
        console.log('📝 Form data being sent:');
        for (let [key, value] of formDataToSend.entries()) {
          if (key === 'image') {
            console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
          } else {
            console.log(`  ${key}: ${value}`);
          }
        }

        const response = await onSubmit(submitData);

        // Update featureImage with the URL from the response if available
        if (response && response.data && response.data.data) {
          const updatedSubcategory = response.data.data;

          // Update form data with the response data
          setFormData(prev => ({
            ...prev,
            featureImage: updatedSubcategory.featureImage || prev.featureImage,
            imageFile: null // Clear the file since it's now uploaded
          }));

          // Revoke the preview URL since we have the actual URL now
          if (previewUrl) {
            imageUploadService.revokePreviewUrl(previewUrl);
            setPreviewUrl(null);
          }

          // Show success message with image status
          if (updatedSubcategory.featureImage) {
            showSuccess('Subcategory created successfully! Image uploaded and saved.');
            console.log('✅ Subcategory created with featureImage:', updatedSubcategory.featureImage);
          } else {
            showSuccess('Subcategory created successfully! (No image uploaded)');
            console.log('⚠️ Subcategory created but no featureImage in response');
          }
        } else {
          showSuccess('Subcategory created successfully!');
          console.log('⚠️ Subcategory created but no featureImage in response');
        }

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(response);
        }
      } catch (error) {
        console.error('Form submission error:', error);

        // Handle specific error types
        if (error.response?.status === 503) {
          showError('Database connection error. Please check your Neon DB connection and try again.');
        } else if (error.response?.status === 409) {
          showError('A subcategory with this name already exists. Please choose a different name.');
        } else if (error.response?.status === 400 && error.response?.data?.errors) {
          // Handle validation errors
          const validationErrors = error.response.data.errors;
          const errorMessages = validationErrors.map(err =>
            `${err.field}: ${err.message}`
          ).join('\n');
          showError(`Validation errors:\n${errorMessages}`);
        } else {
          showError(error.response?.data?.message || error.message || 'An error occurred while saving the subcategory.');
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

      {/* Subcategory Name */}
      <div>
        <label htmlFor="name" className={labelClass}>
          Subcategory Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleNameChange}
          className={`${inputBaseClass} ${errors.name ? errorClass : ""}`}
          placeholder="Enter subcategory name"
          disabled={loading}
        />
        {errors.name && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.name}</p>
        )}
      </div>

      {/* Parent Category Selection */}
      <div>
        <label htmlFor="parentId" className={labelClass}>
          Parent Category *
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleInputChange}
          className={`${inputBaseClass} ${errors.categoryId ? errorClass : ""}`}
          disabled={loading}
        >
          <option value="">-- Select Parent Category --</option>
          {parentCategories.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.categoryId}</p>
        )}
        <p className={`mt-1 text-xs ${subText}`}>
          Choose the parent category this subcategory belongs to
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
          placeholder="Enter subcategory description (optional)"
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
          {!isEdit ? "Auto-generated from subcategory name" : "URL-friendly identifier"}
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
          <option value="featured">Featured</option>
          <option value="special">Special</option>
        </select>
        {errors.type && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.type}</p>
        )}
        <p className={`mt-1 text-xs ${subText}`}>
          Choose the type of subcategory
        </p>
      </div>

      {/* Status Selection */}
      <div>
        <label htmlFor="status" className={labelClass}>
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status || "active"}
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
          Control subcategory visibility
        </p>
      </div>

      {/* Order */}
      <div>
        <label htmlFor="order" className={labelClass}>
          Display Order
        </label>
        <input
          type="number"
          id="order"
          name="order"
          value={formData.order || 0}
          onChange={handleInputChange}
          className={`${inputBaseClass} ${errors.order ? errorClass : ""}`}
          placeholder="0"
          min="0"
          disabled={loading}
        />
        {errors.order && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.order}</p>
        )}
        <p className={`mt-1 text-xs ${subText}`}>
          Lower numbers appear first
        </p>
      </div>

      {/* Feature Image */}
      <div>
        <label htmlFor="featureImage" className={labelClass}>
          Feature Image
        </label>
        <div className="space-y-3">
          {/* Current Image Preview */}
          {formData.featureImage && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <img
                src={formData.featureImage}
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
                  {formData.imageFile ? formData.imageFile.name : (formData.featureImage.startsWith('blob:') ? 'Preview Image' : formData.featureImage)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (formData.featureImage && formData.featureImage.startsWith('blob:')) {
                    imageUploadService.revokePreviewUrl(formData.featureImage);
                  }
                  if (previewUrl) {
                    imageUploadService.revokePreviewUrl(previewUrl);
                    setPreviewUrl(null);
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
              key={`featureImage-${formData.featureImage || 'empty'}`}
              type="url"
              id="featureImage"
              name="featureImage"
              value={formData.featureImage || ""}
              onChange={handleInputChange}
              className={`${inputBaseClass} ${errors.featureImage ? errorClass : ""}`}
              placeholder="https://example.com/image.jpg"
              disabled={loading || uploading}
            />
          </div>

          {/* Upload Options */}
          <div className="flex flex-col sm:flex-row gap-3">
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

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  loadAvailableMedia();
                  setShowMediaSelector(true);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                }`}
                disabled={loading || uploading}
              >
                Select from Media Library
              </button>
            </div>
          </div>
        </div>

        {errors.featureImage && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.featureImage}</p>
        )}

        {/* Show status of image URL */}
        {formData.featureImage && formData.featureImage.startsWith('blob:') && (
          <p className={`mt-1 text-xs text-blue-600 dark:text-blue-400`}>
            ✓ Preview image selected - will be uploaded when you save
          </p>
        )}
        {formData.featureImage && !formData.featureImage.startsWith('blob:') && formData.featureImage && (
          <p className={`mt-1 text-xs text-green-600 dark:text-green-400`}>
            ✓ Image URL set - ready to save
          </p>
        )}

        <p className={`mt-1 text-xs ${subText}`}>
          Optional: Upload a new image or select from your media library
        </p>
      </div>

      {/* Meta Title */}
      <div>
        <label htmlFor="metaTitle" className={labelClass}>
          Meta Title
        </label>
        <input
          type="text"
          id="metaTitle"
          name="metaTitle"
          value={formData.metaTitle || ""}
          onChange={handleInputChange}
          className={`${inputBaseClass} ${errors.metaTitle ? errorClass : ""}`}
          placeholder="SEO title"
          disabled={loading}
          maxLength="60"
        />
        {errors.metaTitle && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.metaTitle}</p>
        )}
        <p className={`mt-1 text-xs ${subText}`}>
          {(formData.metaTitle || "").length}/60 characters
        </p>
      </div>

      {/* Meta Description */}
      <div>
        <label htmlFor="metaDescription" className={labelClass}>
          Meta Description
        </label>
        <textarea
          id="metaDescription"
          name="metaDescription"
          value={formData.metaDescription || ""}
          onChange={handleInputChange}
          rows="2"
          className={`${inputBaseClass} ${errors.metaDescription ? errorClass : ""}`}
          placeholder="SEO description"
          disabled={loading}
          maxLength="160"
        />
        {errors.metaDescription && (
          <p className={`mt-1 text-sm ${errorText}`}>{errors.metaDescription}</p>
        )}
        <p className={`mt-1 text-xs ${subText}`}>
          {(formData.metaDescription || "").length}/160 characters
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
              {isEdit ? "Update Subcategory" : "Create Subcategory"}
            </div>
          )}
        </button>
      </div>

      {/* Media Selector Modal */}
      {showMediaSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-lg font-semibold ${textMain}`}>Select Media</h3>
              <button
                onClick={() => setShowMediaSelector(false)}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${textMain}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {availableMedia.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => handleMediaSelect(media)}
                    className="cursor-pointer group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all"
                  >
                    <img
                      src={media.url}
                      alt={media.originalFilename || 'Media'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {availableMedia.length === 0 && (
                <div className="text-center py-12">
                  <svg className={`w-16 h-16 mx-auto mb-4 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className={`text-lg font-medium mb-2 ${textMain}`}>No images found</p>
                  <p className={`text-sm ${subText}`}>Upload some images first to select from your media library</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default SubCategoryForm;