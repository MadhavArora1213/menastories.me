import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import articleService from '../../services/articleService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Captcha from '../Components/Captcha';


const EditArticle = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { admin, isMasterAdmin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const autoSaveRef = useRef(null);
  const quillRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categoryTags, setCategoryTags] = useState([]);
  const [article, setArticle] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [touched, setTouched] = useState({});
  const [imageJustUploaded, setImageJustUploaded] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    excerpt: '',
    description: '',
    categoryId: '',
    subcategoryId: '',
    authorId: '',
    coAuthors: [],
    tags: [],
    custom_tags: '',
    featured: false,
    heroSlider: false,
    trending: false,
    pinned: false,
    allowComments: true,
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    publishDate: '',
    featuredImage: null,
    imageCaption: '',
    gallery: [],
    authorBioOverride: '',
    status: 'draft',
    reviewNotes: '',
    // New fields
    nationality: '',
    age: '',
    gender: '',
    ethnicity: '',
    residency: '',
    industry: '',
    position: '',
    imageDisplayMode: 'single',
    links: [],
    socialEmbeds: [],
    externalLinkFollow: true,
    captchaVerified: false,
    guidelinesAccepted: false
  });

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';
  const inputBg = isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black';

  useEffect(() => {
    fetchArticle();
    fetchInitialData();
  }, [id]);

  useEffect(() => {
    if (formData.categoryId) {
      fetchSubcategories(formData.categoryId);
      fetchCategoryTags(formData.categoryId);
    }
  }, [formData.categoryId]);

  // Auto-save functionality - only for draft articles
  useEffect(() => {
    if (article && (formData.title !== article.title || formData.content !== article.content)) {
      // Only auto-save if article is in draft status and user has been inactive
      if (article.status === 'draft' && formData.captchaVerified && formData.guidelinesAccepted) {
        if (autoSaveRef.current) {
          clearTimeout(autoSaveRef.current);
        }
        autoSaveRef.current = setTimeout(() => {
          autoSave();
        }, 60000); // Increased to 60 seconds to reduce conflicts
      }
    }
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [formData, article, formData.captchaVerified, formData.guidelinesAccepted]);

  const fetchArticle = async () => {
    try {
      const response = await articleService.getArticle(id);
      if (response.success) {
        const articleData = response.data;
        console.log('Article loaded from database:', {
          id: articleData.id,
          featuredImage: articleData.featuredImage,
          gallery: articleData.gallery,
          status: articleData.status
        });
        setArticle(articleData);

        // Populate form with existing data, preserving any unsaved changes
         setFormData(prevFormData => ({
            title: articleData.title || '',
              subtitle: articleData.subtitle || '',
              content: articleData.content || '',
              excerpt: articleData.excerpt || '',
              description: articleData.description || '',
              categoryId: articleData.categoryId || '',
              subcategoryId: articleData.subcategoryId || '',
              authorId: articleData.authorId || '',
              coAuthors: articleData.coAuthors || [],
              tags: articleData.tags || [],
              featured: articleData.featured || false,
              heroSlider: articleData.heroSlider || false,
              trending: articleData.trending || false,
              pinned: articleData.pinned || false,
              allowComments: articleData.allowComments !== false,
              metaTitle: articleData.metaTitle || '',
              metaDescription: articleData.metaDescription || '',
              keywords: articleData.keywords || [],
              publishDate: articleData.publishDate
                ? (() => {
                    const date = new Date(articleData.publishDate);
                    // Ensure we get the local date string for datetime-local input
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    return `${year}-${month}-${day}T${hours}:${minutes}`;
                  })()
                : '',
              // Use database image if available, otherwise preserve uploaded file
              featuredImage: articleData.featuredImage ? null : prevFormData.featuredImage,
              imageCaption: articleData.imageCaption || '',
              // Use database gallery if available, otherwise preserve uploaded files
              gallery: articleData.gallery && articleData.gallery.length > 0 ? [] : prevFormData.gallery,
              authorBioOverride: articleData.authorBioOverride || '',
              status: articleData.status || 'draft',
              custom_tags: prevFormData.custom_tags || '', // Preserve custom tags input
              reviewNotes: articleData.reviewNotes || '',
              // New fields
              nationality: articleData.nationality || '',
              age: articleData.age || '',
              gender: articleData.gender || '',
              ethnicity: articleData.ethnicity || '',
              residency: articleData.residency || '',
              industry: articleData.industry || '',
              position: articleData.position || '',
              imageDisplayMode: articleData.imageDisplayMode || 'single',
              links: articleData.links || [],
              socialEmbeds: articleData.socialEmbeds || [],
              externalLinkFollow: articleData.externalLinkFollow !== false,
              captchaVerified: prevFormData.captchaVerified || false,
              guidelinesAccepted: prevFormData.guidelinesAccepted || false
            }));

        showSuccess('Article loaded successfully');
      } else {
        throw new Error(response.message || 'Failed to load article');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      let errorMessage = 'Failed to load article';
      if (error.response?.status === 404) {
        errorMessage = 'Article not found';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to edit this article';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showError(errorMessage);
      navigate('/admin/articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, authorsRes] = await Promise.all([
        articleService.getCategories(),
        articleService.getAuthors()
      ]);

      setCategories(categoriesRes.data || []);
      setAuthors(authorsRes.data || []);

      if (categoriesRes.success && authorsRes.success) {
        showSuccess('Categories and authors loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      showError('Failed to load categories and authors');
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await articleService.getSubcategories(categoryId);
      setSubcategories(response.data || []);
      if (response.success && response.data?.length > 0) {
        showInfo(`${response.data.length} subcategories loaded`);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      showError('Failed to load subcategories');
    }
  };

  const fetchCategoryTags = async (categoryId) => {
    try {
      const response = await articleService.getTagsByCategory(categoryId);
      setCategoryTags(response.data || []);
      if (response.success && response.data?.length > 0) {
        showInfo(`${response.data.length} category tags loaded`);
      }
    } catch (error) {
      console.error('Error fetching category tags:', error);
      showError('Failed to load category tags');
    }
  };

  const autoSave = async () => {
    // Only auto-save if article is in draft status and has required fields
    if (formData.title && formData.content && article?.status === 'draft') {
      try {
        // Only save essential fields to avoid conflicts
        const autoSaveData = {
          title: formData.title,
          content: formData.content,
          status: 'draft' // Always keep as draft for auto-save
        };

        await articleService.updateArticle(id, autoSaveData);
        showInfo('Changes auto-saved successfully');
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Don't show warning for auto-save failures to avoid annoying users
        console.warn('Auto-save failed, but user can continue working');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, featuredImage: file }));
    }
  };

  const handleGalleryImageChange = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 5;

    if (formData.gallery.length + files.length > maxImages) {
      showError(`Maximum ${maxImages} images allowed in gallery`);
      return;
    }

    // Validate each file
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        showError(`${file.name} is too large. Max size is 5MB`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        showError(`${file.name} is not an image file`);
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, ...validFiles]
    }));
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => {
      const newGallery = prev.gallery.filter((_, i) => i !== index);
      let newFeaturedImage = prev.featuredImage;

      // If the removed image was the featured image, clear it or set to first remaining image
      if (prev.featuredImage && prev.gallery[index] === prev.featuredImage) {
        newFeaturedImage = newGallery.length > 0 ? newGallery[0] : null;
        if (newFeaturedImage) {
          showInfo('Featured image updated to first remaining gallery image');
        }
      }

      return {
        ...prev,
        gallery: newGallery,
        featuredImage: newFeaturedImage
      };
    });
  };

  const selectGalleryImageAsFeatured = (index) => {
    const selectedImage = formData.gallery[index];
    if (selectedImage) {
      setFormData(prev => ({
        ...prev,
        featuredImage: selectedImage
      }));
      showSuccess('Gallery image set as featured image');
    }
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleCustomTags = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag],
          custom_tags: ''
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, custom_tags: e.target.value }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const required = ['title', 'content', 'categoryId', 'authorId'];
    const missing = required.filter(field => !formData[field]);

    if (missing.length > 0) {
      showError(`Missing required fields: ${missing.join(', ')}`);
      return false;
    }

    if (formData.tags.length < 3) {
      showError('Please add at least 3 tags');
      return false;
    }

    if (!formData.captchaVerified) {
      showError('Please complete the security verification');
      return false;
    }

    if (!formData.guidelinesAccepted) {
      showError('You must accept the content guidelines');
      return false;
    }


    return true;
  };

  const handleSubmit = async (e, newStatus = null) => {
    e.preventDefault();

    const statusToSave = newStatus || formData.status;

    // Enhanced security verification before publishing
    if (statusToSave !== 'draft') {
      // Double-check security requirements
      if (!formData.captchaVerified) {
        showError('Security verification expired. Please complete CAPTCHA again.');
        return;
      }

      if (!formData.guidelinesAccepted) {
        showError('You must accept the content guidelines before publishing.');
        return;
      }

      // Additional security checks
      if (!formData.title || formData.title.trim().length < 10) {
        showError('Article title must be at least 10 characters long for publishing.');
        return;
      }

      if (!formData.content || formData.content.replace(/<[^>]*>/g, '').trim().length < 100) {
        showError('Article content must be at least 100 words for publishing.');
        return;
      }

      if (formData.tags.length < 3) {
        showError('At least 3 tags are required for publishing.');
        return;
      }

      // Verify admin permissions
      if (!admin || !isMasterAdmin()) {
        showError('You do not have permission to publish articles.');
        return;
      }

      // Additional validation for status changes
      if (statusToSave === 'published' && article.status !== 'published') {
        showWarning('Publishing this article will make it live immediately. Are you sure?');
      }
    }

    if (statusToSave !== 'draft' && !validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const submitData = {
         ...formData,
         status: statusToSave,
         coAuthors: formData.coAuthors,
         tags: formData.tags,
         keywords: formData.keywords
       };

      // Handle featured image upload with proper database path update
       if (formData.featuredImage instanceof File) {
         try {
           // Validate file size (max 5MB)
           if (formData.featuredImage.size > 5 * 1024 * 1024) {
             showError('Featured image size should be less than 5MB');
             return;
           }

           // Create FormData for upload
           const formDataUpload = new FormData();
           formDataUpload.append('image', formData.featuredImage);

           // Upload the image using the same method as CreateArticle
           const uploadResponse = await articleService.uploadFile('/api/upload/image', formDataUpload);
           if (uploadResponse.success && uploadResponse.data?.filename) {
             // Store the old image path for deletion
             const oldImagePath = article.featuredImage;
             submitData.featuredImage = uploadResponse.data.filename;

             // If there's an old image, mark it for deletion
             if (oldImagePath && oldImagePath !== uploadResponse.data.filename) {
               submitData.oldFeaturedImage = oldImagePath;
             }

             console.log('Image uploaded successfully:', {
               oldPath: oldImagePath,
               newPath: uploadResponse.data.filename,
               willDelete: !!oldImagePath
             });

             setImageJustUploaded(true);
             showInfo('Featured image uploaded successfully');
           } else {
             showError(`Failed to upload featured image: ${uploadResponse.message || 'Unknown error'}`);
             return;
           }
         } catch (uploadError) {
           console.error('Error uploading featured image:', uploadError);
           showError(`Failed to upload featured image: ${uploadError.message}`);
           return;
         }
       } else if (formData.featuredImage === null && article.featuredImage) {
         // User removed the featured image
         submitData.oldFeaturedImage = article.featuredImage;
         submitData.featuredImage = null;
       }

      // Handle gallery images upload with proper database path management
       if (formData.gallery.length > 0) {
         const galleryImagePaths = [];
         const oldGalleryImages = [];

         // Collect existing gallery images for potential deletion
         if (article.gallery && Array.isArray(article.gallery)) {
           for (const image of article.gallery) {
             const imagePath = typeof image === 'string' ? image : image.url;
             if (imagePath) {
               oldGalleryImages.push(imagePath);
             }
           }
         }

         for (const file of formData.gallery) {
           try {
             // Validate file size (max 5MB)
             if (file.size > 5 * 1024 * 1024) {
               showError(`${file.name} is too large. Max size is 5MB`);
               continue;
             }

             // Validate file type
             if (!file.type.startsWith('image/')) {
               showError(`${file.name} is not an image file`);
               continue;
             }

             // Create FormData for upload
             const formDataUpload = new FormData();
             formDataUpload.append('image', file);

             // Upload the image using the same method as CreateArticle
             const uploadResponse = await articleService.uploadFile('/api/upload/image', formDataUpload);
             if (uploadResponse.success && uploadResponse.data?.filename) {
               galleryImagePaths.push(uploadResponse.data.filename);
               showInfo(`${file.name} uploaded successfully`);
             } else {
               showError(`Failed to upload ${file.name}: ${uploadResponse.message || 'Unknown error'}`);
             }
           } catch (uploadError) {
             console.error('Error uploading gallery image:', uploadError);
             showError(`Failed to upload ${file.name}: ${uploadError.message}`);
           }
         }

         // Convert filenames to gallery objects as expected by backend
         if (galleryImagePaths.length > 0) {
           submitData.gallery = galleryImagePaths.map(filename => ({
             url: filename,
             alt: '',
             caption: ''
           }));

           // Mark old gallery images for deletion if they exist
           if (oldGalleryImages.length > 0) {
             submitData.oldGalleryImages = oldGalleryImages;
           }
         }
       } else if (formData.gallery.length === 0 && article.gallery && Array.isArray(article.gallery) && article.gallery.length > 0) {
         // User removed all gallery images
         const oldGalleryImages = [];
         for (const image of article.gallery) {
           const imagePath = typeof image === 'string' ? image : image.url;
           if (imagePath) {
             oldGalleryImages.push(imagePath);
           }
         }
         if (oldGalleryImages.length > 0) {
           submitData.oldGalleryImages = oldGalleryImages;
           submitData.gallery = [];
         }
       }

      const response = await articleService.updateArticle(id, submitData);

      if (response.success) {
        // Update the article state with the response data
         if (response.data) {
           setArticle(response.data);
           // Update form data with server response to ensure consistency
           setFormData(prevFormData => ({
             ...prevFormData,
             status: response.data.status || prevFormData.status,
             reviewNotes: response.data.reviewNotes || prevFormData.reviewNotes,
             // Clear uploaded files since they're now saved to database
             featuredImage: null, // Clear the File object since it's now saved
             gallery: [], // Clear uploaded gallery files since they're now saved
             custom_tags: prevFormData.custom_tags
           }));

           // Clear the image upload flag since the image is now saved
           setImageJustUploaded(false);
         }

        // More specific success messages based on status
        let successMessage = '';
        switch (statusToSave) {
          case 'draft':
            successMessage = 'Article saved as draft successfully';
            break;
          case 'pending_review':
            successMessage = 'Article submitted for review successfully';
            break;
          case 'in_review':
            successMessage = 'Article moved to in-review status';
            break;
          case 'approved':
            successMessage = 'Article approved successfully';
            break;
          case 'published':
            successMessage = 'Article published successfully';
            break;
          case 'scheduled':
            successMessage = 'Article scheduled for publication';
            break;
          case 'rejected':
            successMessage = 'Article rejected';
            break;
          case 'archived':
            successMessage = 'Article archived successfully';
            break;
          default:
            successMessage = 'Article updated successfully';
        }

        showSuccess(successMessage);

         // Small delay to ensure database is updated before refetching
         setTimeout(() => {
           fetchArticle();
         }, 500);
      }
    } catch (error) {
      console.error('Update error:', error);

      // More specific error messages
      let errorMessage = 'Failed to update article';
      if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to perform this action';
      } else if (error.response?.status === 404) {
        errorMessage = 'Article not found';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid data provided';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getStatusActions = () => {
    const currentStatus = article?.status;
    const actions = [];

    const transitions = {
      draft: ['pending_review', 'published'], // Allow direct publishing from draft
      pending_review: ['in_review', 'rejected', 'draft'],
      in_review: ['approved', 'rejected', 'pending_review'],
      approved: ['scheduled', 'published', 'in_review'],
      scheduled: ['published', 'approved'],
      published: ['archived'],
      rejected: ['draft', 'pending_review'],
      archived: ['published']
    };

    if (transitions[currentStatus]) {
      transitions[currentStatus].forEach(status => {
        let buttonText = status.replace('_', ' ').toUpperCase();
        let buttonClass = 'bg-blue-600 hover:bg-blue-700';
        
        if (status === 'rejected') {
          buttonClass = 'bg-red-600 hover:bg-red-700';
        } else if (status === 'published') {
          buttonClass = 'bg-green-600 hover:bg-green-700';
        } else if (status === 'approved') {
          buttonClass = 'bg-emerald-600 hover:bg-emerald-700';
        }

        actions.push(
          <button
            key={status}
            type="button"
            onClick={(e) => handleSubmit(e, status)}
            disabled={saving}
            className={`px-4 py-2 text-white rounded-lg ${buttonClass} ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {buttonText}
          </button>
        );
      });
    }

    return actions;
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  // Show loading if auth is still loading
  if (authLoading || loading) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center`}>
        <div className={`text-center ${textMain}`}>
          <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            The article you're looking for doesn't exist or you don't have permission to edit it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgMain} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${textMain}`}>Edit Article</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Status: <span className={`font-semibold ${
                article.status === 'published' ? 'text-green-600' : 
                article.status === 'rejected' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {article.status.replace('_', ' ').toUpperCase()}
              </span>
              {article.readingTime && (
                <span className="ml-4">Reading Time: {article.readingTime} min</span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/articles')}
              className={`px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              Back to Articles
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                      placeholder="Enter article title..."
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Subtitle
                    </label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                      placeholder="Enter article subtitle..."
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Content <span className="text-red-500">*</span>
                    </label>
                    <div className={`${isDark ? 'quill-dark' : ''}`}>
                      <ReactQuill
                        ref={quillRef}
                        value={formData.content}
                        onChange={handleContentChange}
                        modules={quillModules}
                        theme="snow"
                        style={{ minHeight: '300px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Excerpt
                    </label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                      placeholder="Brief summary of the article (max 500 characters)..."
                      maxLength={500}
                    />
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {formData.excerpt.length}/500 characters
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Featured Image</h2>

                <div className="space-y-4">
                  {article.featuredImage && !formData.featuredImage && (
                    <div>
                      <label className={`block text-sm font-medium ${textMain} mb-2`}>
                        Current Image
                      </label>
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="max-w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                       {article.featuredImage ? 'Replace Image' : 'Upload Image'}
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                    />
                    {imageJustUploaded && (
                      <div className="text-sm text-green-600 mt-1">
                        ✓ Image uploaded and saved successfully
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Image Caption
                    </label>
                    <input
                      type="text"
                      name="imageCaption"
                      value={formData.imageCaption}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                      placeholder="Enter image caption..."
                    />
                  </div>

                  {formData.featuredImage && (
                    <div className="mt-4">
                      <label className={`block text-sm font-medium ${textMain} mb-2`}>
                        New Featured Image Preview
                      </label>
                      <img
                        src={URL.createObjectURL(formData.featuredImage)}
                        alt="Featured Preview"
                        className="max-w-full h-48 object-cover rounded-lg"
                      />
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                        {formData.gallery.includes(formData.featuredImage)
                          ? 'This image is also in the gallery'
                          : 'Upload gallery images to use them as featured images'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Gallery */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Image Gallery</h2>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Image Display Mode
                    </label>
                    <select
                      name="imageDisplayMode"
                      value={formData.imageDisplayMode}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                    >
                      <option value="single">Single Image</option>
                      <option value="multiple">Multiple Images (In Article)</option>
                      <option value="slider">Image Slider</option>
                    </select>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Choose how images should be displayed in the article
                    </div>
                  </div>

                  {/* Current Gallery Images */}
                  {article.gallery && Array.isArray(article.gallery) && article.gallery.length > 0 && (
                    <div>
                      <label className={`block text-sm font-medium ${textMain} mb-2`}>
                        Current Gallery Images ({article.gallery.length})
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {article.gallery.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={typeof image === 'string' ? image : image.url}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      {article.gallery && Array.isArray(article.gallery) && article.gallery.length > 0 ? 'Add More Gallery Images' : 'Upload Gallery Images'} (Max 5 total)
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleGalleryImageChange}
                      accept="image/*"
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                    />
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Select multiple images. Maximum 5 images allowed, each up to 5MB.
                    </div>
                  </div>

                  {/* Gallery Preview */}
                  {formData.gallery.length > 0 && (
                    <div className="mt-4">
                      <label className={`block text-sm font-medium ${textMain} mb-2`}>
                        New Gallery Preview ({formData.gallery.length}/5)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formData.gallery.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Gallery ${index + 1}`}
                              className={`w-full h-24 object-cover rounded-lg ${
                                formData.featuredImage === file ? 'ring-2 ring-blue-500' : ''
                              }`}
                            />
                            {/* Featured indicator */}
                            {formData.featuredImage === file && (
                              <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                Featured
                              </div>
                            )}
                            {/* Action buttons */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => selectGalleryImageAsFeatured(index)}
                                  className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
                                  title="Set as Featured"
                                >
                                  Featured
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeGalleryImage(index)}
                                  className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                                  title="Remove"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                        Click "Featured" on any image to set it as the featured image. The currently featured image is highlighted with a blue border.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SEO Settings */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>SEO Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                      placeholder="SEO title (leave blank to use article title)"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Meta Description
                    </label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                      placeholder="SEO description (leave blank to use excerpt)"
                      maxLength={160}
                    />
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {formData.metaDescription.length}/160 characters
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Profile Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Nationality
                    </label>
                    <select
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                    >
                      <option value="">Select Nationality</option>
                      {[
                        { value: 'India', label: 'India' },
                        { value: 'United Arab Emirates', label: 'United Arab Emirates' },
                        { value: 'Saudi Arabia', label: 'Saudi Arabia' },
                        { value: 'Kuwait', label: 'Kuwait' },
                        { value: 'Bahrain', label: 'Bahrain' },
                        { value: 'Qatar', label: 'Qatar' },
                        { value: 'Oman', label: 'Oman' },
                        { value: 'United States', label: 'United States' },
                        { value: 'Canada', label: 'Canada' },
                        { value: 'United Kingdom', label: 'United Kingdom' },
                        { value: 'France', label: 'France' },
                        { value: 'Germany', label: 'Germany' },
                        { value: 'Spain', label: 'Spain' },
                        { value: 'Italy', label: 'Italy' },
                        { value: 'Sweden', label: 'Sweden' },
                        { value: 'Norway', label: 'Norway' },
                        { value: 'Denmark', label: 'Denmark' },
                        { value: 'Finland', label: 'Finland' },
                        { value: 'Switzerland', label: 'Switzerland' },
                        { value: 'Netherlands', label: 'Netherlands' },
                        { value: 'Belgium', label: 'Belgium' },
                        { value: 'Ireland', label: 'Ireland' },
                        { value: 'Portugal', label: 'Portugal' },
                        { value: 'Poland', label: 'Poland' },
                        { value: 'Czech Republic', label: 'Czech Republic' },
                        { value: 'Hungary', label: 'Hungary' },
                        { value: 'Romania', label: 'Romania' },
                        { value: 'Greece', label: 'Greece' },
                        { value: 'Russia', label: 'Russia' },
                        { value: 'Ukraine', label: 'Ukraine' },
                        { value: 'Turkey', label: 'Turkey' },
                        { value: 'Israel', label: 'Israel' },
                        { value: 'Iran', label: 'Iran' },
                        { value: 'Egypt', label: 'Egypt' },
                        { value: 'South Africa', label: 'South Africa' },
                        { value: 'Nigeria', label: 'Nigeria' },
                        { value: 'Kenya', label: 'Kenya' },
                        { value: 'Ethiopia', label: 'Ethiopia' },
                        { value: 'Ghana', label: 'Ghana' },
                        { value: 'Mexico', label: 'Mexico' },
                        { value: 'Brazil', label: 'Brazil' },
                        { value: 'Argentina', label: 'Argentina' },
                        { value: 'Chile', label: 'Chile' },
                        { value: 'Colombia', label: 'Colombia' },
                        { value: 'Peru', label: 'Peru' },
                        { value: 'Japan', label: 'Japan' },
                        { value: 'South Korea', label: 'South Korea' },
                        { value: 'China', label: 'China' },
                        { value: 'Hong Kong', label: 'Hong Kong' },
                        { value: 'Singapore', label: 'Singapore' },
                        { value: 'Malaysia', label: 'Malaysia' },
                        { value: 'Thailand', label: 'Thailand' },
                        { value: 'Vietnam', label: 'Vietnam' },
                        { value: 'Indonesia', label: 'Indonesia' },
                        { value: 'Philippines', label: 'Philippines' },
                        { value: 'Australia', label: 'Australia' },
                        { value: 'New Zealand', label: 'New Zealand' },
                        { value: 'Pakistan', label: 'Pakistan' },
                        { value: 'Bangladesh', label: 'Bangladesh' },
                        { value: 'Sri Lanka', label: 'Sri Lanka' },
                        { value: 'Nepal', label: 'Nepal' },
                        { value: 'Kazakhstan', label: 'Kazakhstan' },
                        { value: 'Uzbekistan', label: 'Uzbekistan' },
                        { value: 'Azerbaijan', label: 'Azerbaijan' }
                      ].map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Age Group
                    </label>
                    <select
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                    >
                      <option value="">Select Age Group</option>
                      {[
                        { value: '18-24', label: '18-24' },
                        { value: '25-34', label: '25-34' },
                        { value: '35-44', label: '35-44' },
                        { value: '45-54', label: '45-54' },
                        { value: '55-64', label: '55-64' },
                        { value: '65+', label: '65+' }
                      ].map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                    >
                      <option value="">Select Gender</option>
                      {[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'non-binary', label: 'Non-binary' },
                        { value: 'transgender', label: 'Transgender' },
                        { value: 'prefer-not-to-say', label: 'Prefer not to say' }
                      ].map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Ethnicity
                    </label>
                    <select
                      name="ethnicity"
                      value={formData.ethnicity}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                    >
                      <option value="">Select Ethnicity</option>
                      {[
                        { value: 'Asian', label: 'Asian' },
                        { value: 'Black/African', label: 'Black/African' },
                        { value: 'Hispanic/Latino', label: 'Hispanic/Latino' },
                        { value: 'White/Caucasian', label: 'White/Caucasian' },
                        { value: 'Middle Eastern', label: 'Middle Eastern' },
                        { value: 'Mixed', label: 'Mixed' },
                        { value: 'Other', label: 'Other' }
                      ].map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Residency Status
                    </label>
                    <select
                      name="residency"
                      value={formData.residency}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                    >
                      <option value="">Select Residency</option>
                      {[
                        { value: 'citizen', label: 'Citizen' },
                        { value: 'permanent-resident', label: 'Permanent Resident' },
                        { value: 'expat', label: 'Expat' },
                        { value: 'non-resident', label: 'Non-resident' }
                      ].map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Industry
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                    >
                      <option value="">Select Industry</option>
                      {[
                        { value: 1, label: 'Agriculture & Food' },
                        { value: 2, label: 'Manufacturing' },
                        { value: 3, label: 'Energy & Natural Resources' },
                        { value: 4, label: 'Healthcare & Life Sciences' },
                        { value: 5, label: 'Finance & Insurance' },
                        { value: 6, label: 'Technology & IT' },
                        { value: 7, label: 'Media & Entertainment' },
                        { value: 8, label: 'Retail & Consumer' },
                        { value: 9, label: 'Real Estate & Construction' },
                        { value: 10, label: 'Logistics & Transportation' },
                        { value: 11, label: 'Education & Training' },
                        { value: 12, label: 'Hospitality & Tourism' },
                        { value: 13, label: 'Government & Public Sector' },
                        { value: 14, label: 'Legal & Professional Services' },
                        { value: 15, label: 'Telecom & Connectivity' },
                        { value: 16, label: 'Chemicals & Materials' },
                        { value: 17, label: 'Automotive & Mobility' },
                        { value: 18, label: 'Sports & Recreation' },
                        { value: 19, label: 'Nonprofit & Philanthropy' },
                        { value: 20, label: 'Other' }
                      ].map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Position/Title
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                    >
                      <option value="">Select Position</option>
                      {[
                        { value: 1, label: 'Chairman' },
                        { value: 2, label: 'Vice Chairman' },
                        { value: 3, label: 'Board Member' },
                        { value: 4, label: 'Founder' },
                        { value: 5, label: 'Co-Founder' },
                        { value: 6, label: 'President' },
                        { value: 7, label: 'Chief Executive Officer (CEO)' },
                        { value: 8, label: 'Managing Director (MD)' },
                        { value: 9, label: 'Executive Director' },
                        { value: 10, label: 'Chief Operating Officer (COO)' },
                        { value: 11, label: 'Chief Financial Officer (CFO)' },
                        { value: 12, label: 'Chief Technology Officer (CTO)' },
                        { value: 13, label: 'Chief Information Officer (CIO)' },
                        { value: 14, label: 'Chief Marketing Officer (CMO)' },
                        { value: 15, label: 'Chief Commercial Officer (CCO)' },
                        { value: 16, label: 'Chief Revenue Officer (CRO)' },
                        { value: 17, label: 'Chief Product Officer (CPO)' },
                        { value: 18, label: 'Chief Strategy Officer (CSO)' },
                        { value: 19, label: 'Chief Legal Officer (CLO)' },
                        { value: 20, label: 'Chief People Officer' },
                        { value: 21, label: 'Chief Human Resources Officer (CHRO)' },
                        { value: 22, label: 'Chief Risk Officer' },
                        { value: 23, label: 'Chief Compliance Officer' },
                        { value: 24, label: 'Chief Data Officer (CDO)' },
                        { value: 25, label: 'Chief Digital Officer' },
                        { value: 26, label: 'Chief Sustainability Officer (CSO)' },
                        { value: 27, label: 'Chief Innovation Officer' },
                        { value: 28, label: 'Chief Security Officer' },
                        { value: 29, label: 'Chief Privacy Officer' },
                        { value: 30, label: 'Chief Experience Officer (CXO)' },
                        { value: 31, label: 'General Manager (GM)' },
                        { value: 32, label: 'Regional Head' },
                        { value: 33, label: 'Country Head' },
                        { value: 34, label: 'Vice President (VP)' },
                        { value: 35, label: 'Senior Vice President (SVP)' },
                        { value: 36, label: 'Executive Vice President (EVP)' },
                        { value: 37, label: 'Head of Marketing' },
                        { value: 38, label: 'Head of Sales' },
                        { value: 39, label: 'Head of Finance' },
                        { value: 40, label: 'Head of Operations' },
                        { value: 41, label: 'Head of Product' },
                        { value: 42, label: 'Head of Research & Development' },
                        { value: 43, label: 'Head of Procurement' },
                        { value: 44, label: 'Head of Legal' },
                        { value: 45, label: 'Head of Communications' },
                        { value: 46, label: 'Director' },
                        { value: 47, label: 'Associate Director' },
                        { value: 48, label: 'Senior Manager' },
                        { value: 49, label: 'Manager' },
                        { value: 50, label: 'Assistant Manager' },
                        { value: 51, label: 'Team Lead' },
                        { value: 52, label: 'Project Manager' },
                        { value: 53, label: 'Program Manager' },
                        { value: 54, label: 'Product Manager' },
                        { value: 55, label: 'Account Manager' },
                        { value: 56, label: 'Sales Manager' },
                        { value: 57, label: 'Finance Manager' },
                        { value: 58, label: 'Operations Manager' },
                        { value: 59, label: 'HR Manager' },
                        { value: 60, label: 'Legal Counsel' },
                        { value: 61, label: 'In-house Counsel' },
                        { value: 62, label: 'Partner (Firm)' },
                        { value: 63, label: 'Principal (Firm)' },
                        { value: 64, label: 'Investor' },
                        { value: 65, label: 'Venture Capital Partner' },
                        { value: 66, label: 'Angel Investor' },
                        { value: 67, label: 'Portfolio Manager' },
                        { value: 68, label: 'Fund Manager' },
                        { value: 69, label: 'Trader' },
                        { value: 70, label: 'Analyst' },
                        { value: 71, label: 'Researcher' },
                        { value: 72, label: 'Scientist' },
                        { value: 73, label: 'Engineer' },
                        { value: 74, label: 'Software Engineer' },
                        { value: 75, label: 'Data Scientist' },
                        { value: 76, label: 'DevOps Engineer' },
                        { value: 77, label: 'UX/UI Designer' },
                        { value: 78, label: 'Creative Director' },
                        { value: 79, label: 'Content Director' },
                        { value: 80, label: 'Journalist' },
                        { value: 81, label: 'Editor' },
                        { value: 82, label: 'Producer' },
                        { value: 83, label: 'Director of Photography' },
                        { value: 84, label: 'Photographer' },
                        { value: 85, label: 'Videographer' },
                        { value: 86, label: 'Podcaster' },
                        { value: 87, label: 'Influencer' },
                        { value: 88, label: 'Artist' },
                        { value: 89, label: 'Musician' },
                        { value: 90, label: 'Actor' },
                        { value: 91, label: 'Athlete' },
                        { value: 92, label: 'Coach' },
                        { value: 93, label: 'Academic (Professor)' },
                        { value: 94, label: 'Teacher' },
                        { value: 95, label: 'Student' },
                        { value: 96, label: 'Consultant' },
                        { value: 97, label: 'Advisor' },
                        { value: 98, label: 'Mentor' },
                        { value: 99, label: 'Board Advisor' },
                        { value: 100, label: 'Ambassador' },
                        { value: 101, label: 'Diplomat' },
                        { value: 102, label: 'Civil Servant' }
                      ].map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Links</h2>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      External Link Follow/Nofollow
                    </label>
                    <select
                      name="externalLinkFollow"
                      value={formData.externalLinkFollow}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                    >
                      <option value={true}>Follow</option>
                      <option value={false}>Nofollow</option>
                    </select>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Choose whether external links should pass SEO value
                    </div>
                  </div>
                </div>
              </div>



              {/* Review Notes */}
              {article.reviewNotes && (
                <div className={`${cardBg} p-6 rounded-lg border`}>
                  <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Review Notes</h2>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className={textMain}>{article.reviewNotes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Save Actions */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Actions</h2>

                <div className="space-y-4">
                  {/* Real CAPTCHA */}
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Security Verification
                    </label>
                    <Captcha
                      onVerify={(token) => setFormData(prev => ({ ...prev, captchaVerified: !!token }))}
                      onExpired={() => setFormData(prev => ({ ...prev, captchaVerified: false }))}
                    />
                    {!formData.captchaVerified && touched.captchaVerified && (
                      <p className="text-red-500 text-sm mt-1">Please complete the security verification</p>
                    )}
                  </div>

                  {/* Content Guidelines Checkbox */}
                  <div>
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="guidelinesAccepted"
                        checked={formData.guidelinesAccepted}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 text-blue-600"
                        required
                      />
                      <span className={`ml-3 text-sm ${textMain}`}>
                        I have read and agree to the{' '}
                        <a
                          href="/editorial-guidelines"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Content Guidelines and Policies
                        </a>
                      </span>
                    </label>
                    {!formData.guidelinesAccepted && (
                      <p className="text-red-500 text-sm mt-1">You must accept the content guidelines to proceed</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={saving || !formData.captchaVerified || !formData.guidelinesAccepted}
                      className={`w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${(saving || !formData.captchaVerified || !formData.guidelinesAccepted) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {saving ? 'Saving...' : 'Save Draft'}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, 'published')}
                      disabled={saving || !formData.captchaVerified || !formData.guidelinesAccepted}
                      className={`w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ${(saving || !formData.captchaVerified || !formData.guidelinesAccepted) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {saving ? 'Publishing...' : 'Publish Now'}
                    </button>

                    {getStatusActions().map((action, index) => (
                      <div key={index} className="w-full">
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Publishing Options */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Publishing</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Scheduled Publish Date
                    </label>
                    <input
                      type="datetime-local"
                      name="publishDate"
                      value={formData.publishDate}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className={textMain}>Featured Article</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="heroSlider"
                        checked={formData.heroSlider}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className={textMain}>Show in Hero Slider</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="trending"
                        checked={formData.trending}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className={textMain}>Add to Trending</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="pinned"
                        checked={formData.pinned}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className={textMain}>Pin to Top</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="allowComments"
                        checked={formData.allowComments}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className={textMain}>Allow Comments</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Category</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {subcategories.length > 0 && (
                    <div>
                      <label className={`block text-sm font-medium ${textMain} mb-2`}>
                        Subcategory
                      </label>
                      <select
                        name="subcategoryId"
                        value={formData.subcategoryId}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg ${inputBg}`}
                      >
                        <option value="">Select Subcategory</option>
                        {subcategories.map(subcategory => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Author Selection */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Author</h2>
                
                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Primary Author <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="authorId"
                    value={formData.authorId}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg ${inputBg}`}
                    required
                  >
                    <option value="">Select Author</option>
                    {authors.map(author => (
                      <option key={author.id} value={author.id}>
                        {author.name} - {author.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4">
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Author Bio Override
                  </label>
                  <textarea
                    name="authorBioOverride"
                    value={formData.authorBioOverride}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full p-3 border rounded-lg ${inputBg}`}
                    placeholder="Override author bio for this article..."
                  />
                </div>
              </div>

              {/* Tags */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>
                  Tags <span className="text-red-500">*</span>
                </h2>
                
                {/* Category Tags */}
                {categoryTags.length > 0 && (
                  <div className="mb-4">
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Suggested Tags (Category: {categories.find(c => c.id == formData.categoryId)?.name})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categoryTags.map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleTagToggle(tag.name)}
                          className={`px-3 py-1 text-sm rounded-full border ${
                            formData.tags.includes(tag.name)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : `${isDark ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Tags Input */}
                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Add Custom Tags (Press Enter or comma to add)
                  </label>
                  <input
                    type="text"
                    value={formData.custom_tags}
                    onChange={handleCustomTags}
                    onKeyDown={handleCustomTags}
                    className={`w-full p-3 border rounded-lg ${inputBg}`}
                    placeholder="Type tag and press Enter..."
                  />
                </div>

                {/* Selected Tags */}
                {formData.tags.length > 0 && (
                  <div className="mt-4">
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Selected Tags ({formData.tags.length}/∞)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full flex items-center gap-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:bg-blue-700 rounded-full p-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    {formData.tags.length < 3 && (
                      <p className="text-red-500 text-sm mt-2">
                        At least 3 tags are required
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArticle;