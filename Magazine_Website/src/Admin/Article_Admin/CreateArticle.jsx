import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import articleService from '../../services/articleService';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill-custom.css';
import Captcha from '../Components/Captcha';
import ErrorBoundary from './ErrorBoundary';

// Suppress ReactQuill findDOMNode and DOMNodeInserted warnings
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' &&
      (args[0].includes('findDOMNode is deprecated') ||
       args[0].includes('DOMNodeInserted') ||
       args[0].includes('Listener added for a \'DOMNodeInserted\' mutation event'))) {
    return;
  }
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' &&
      (args[0].includes('findDOMNode is deprecated') ||
       args[0].includes('DOMNodeInserted') ||
       args[0].includes('Listener added for a \'DOMNodeInserted\' mutation event'))) {
    return;
  }
  // Don't suppress AxiosError or other important errors
  if (args[0] && typeof args[0] === 'string' &&
      (args[0].includes('AxiosError') ||
       args[0].includes('Network Error') ||
       args[0].includes('Failed to fetch'))) {
    originalError.apply(console, args);
    return;
  }
  originalError.apply(console, args);
};

const CreateArticle = () => {
  const { theme } = useTheme();
  const { admin, isMasterAdmin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const autoSaveRef = useRef(null);
  const quillRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [categoryTags, setCategoryTags] = useState([]);
  const [showAuthorForm, setShowAuthorForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    recaptchaToken: false
  });
  const [authorSuggestions, setAuthorSuggestions] = useState([]);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  // Static taxonomy data from XLSX file
  const taxonomyData = {
    nationalities: [
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
    ],
    ages: [
      { value: '18-24', label: '18-24' },
      { value: '25-34', label: '25-34' },
      { value: '35-44', label: '35-44' },
      { value: '45-54', label: '45-54' },
      { value: '55-64', label: '55-64' },
      { value: '65+', label: '65+' }
    ],
    genders: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'non-binary', label: 'Non-binary' },
      { value: 'transgender', label: 'Transgender' },
      { value: 'prefer-not-to-say', label: 'Prefer not to say' }
    ],
    ethnicities: [
      { value: 'Asian', label: 'Asian' },
      { value: 'Black/African', label: 'Black/African' },
      { value: 'Hispanic/Latino', label: 'Hispanic/Latino' },
      { value: 'White/Caucasian', label: 'White/Caucasian' },
      { value: 'Middle Eastern', label: 'Middle Eastern' },
      { value: 'Mixed', label: 'Mixed' },
      { value: 'Other', label: 'Other' }
    ],
    residencies: [
      { value: 'citizen', label: 'Citizen' },
      { value: 'permanent-resident', label: 'Permanent Resident' },
      { value: 'expat', label: 'Expat' },
      { value: 'non-resident', label: 'Non-resident' }
    ],
    industries: [
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
    ],
    positions: [
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
    ]
  };

  // Get admin role to determine default status
  const defaultStatus = admin && isMasterAdmin() ? 'published' : 'draft';

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    excerpt: '',
    description: '',
    categoryId: '',
    subcategoryId: '',
    authorId: 'internal_team',
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
    status: defaultStatus,
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
    guidelinesAccepted: false,
    recaptchaToken: null
  });

  const [newAuthor, setNewAuthor] = useState({
    name: '',
    email: '',
    bio: '',
    title: '',
    experience: '',
    education: '',
    profileImage: null,
    social_media: {
      twitter: '',
      linkedin: '',
      facebook: '',
      instagram: '',
      website: ''
    },
    expertise: []
  });

  const [newTag, setNewTag] = useState({
    name: '',
    slug: '',
    type: 'regular',
    category: '',
    description: ''
  });

  const isDark = theme === 'dark';

  // Theme variables
  const bgMain = isDark ? "bg-gray-900" : "bg-gray-50";
  const textMain = isDark ? "text-white" : "text-gray-900";
  const subText = isDark ? "text-gray-300" : "text-gray-600";
  const cardBg = isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200";
  const innerCardBg = isDark ? "bg-gray-700" : "bg-gray-50";
  const innerBorderColor = isDark ? "border-gray-600" : "border-gray-300";
  const inputBg = isDark ? "bg-gray-700 border border-gray-600 text-white" : "bg-white border border-gray-300 text-gray-900";

  useEffect(() => {
    fetchInitialData();

    // Cleanup function to restore console methods
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  useEffect(() => {
    if (formData.categoryId) {
      fetchSubcategories(formData.categoryId);
      fetchCategoryTags(formData.categoryId);
    }
  }, [formData.categoryId]);

  // Auto-save functionality - only when user has made changes and not actively typing
  useEffect(() => {
    if (formData.title && formData.content && formData.categoryId && formData.authorId) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
      autoSaveRef.current = setTimeout(() => {
        // Only auto-save if user has been inactive for 60 seconds and has security verification
        if (formData.captchaVerified && formData.guidelinesAccepted) {
          autoSave();
        }
      }, 60000); // Increased to 60 seconds
    }
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [formData.title, formData.content, formData.categoryId, formData.authorId, formData.captchaVerified, formData.guidelinesAccepted]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, authorsRes, tagsRes] = await Promise.all([
        articleService.getCategories(),
        articleService.getAuthors(),
        fetchAllTags()
      ]);

      if (categoriesRes.success) {
        setCategories(categoriesRes.data || []);
      } else {
        throw new Error(categoriesRes.message || 'Failed to load categories');
      }

      if (authorsRes.success) {
        setAuthors(authorsRes.data || []);
        // Set author suggestions when no author is selected
        if (!formData.authorId) {
          setAuthorSuggestions(authorsRes.data || []);
        }
      } else {
        throw new Error(authorsRes.message || 'Failed to load authors');
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error(error.message || 'Failed to load initial data. Please refresh the page.');
      setErrors({ general: 'Failed to load required data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTags = async () => {
    try {
      // For now, we'll use the existing category tags. In a real implementation,
      // you might want to add an API endpoint to fetch all tags
      const response = await articleService.getTagsByCategory('all');
      if (response.success) {
        // Remove duplicates based on tag name and ensure clean data
        const uniqueTags = (response.data || [])
          .filter((tag, index, self) =>
            index === self.findIndex(t => t.name === tag.name)
          )
          .filter(tag => tag.name && tag.name.trim() !== '') // Remove empty tags
          .map(tag => ({
            ...tag,
            name: tag.name.trim() // Clean up any extra whitespace
          }));

        setAllTags(uniqueTags);
        setTagSuggestions(uniqueTags);
      }
    } catch (error) {
      console.error('Error fetching all tags:', error);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await articleService.getSubcategories(categoryId);
      setSubcategories(response.data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchCategoryTags = async (categoryId) => {
    try {
      const response = await articleService.getTagsByCategory(categoryId);
      setCategoryTags(response.data || []);
    } catch (error) {
      console.error('Error fetching category tags:', error);
    }
  };


  const autoSave = async () => {
    // Only auto-save if user has been inactive and has security verification
    if (formData.title && formData.content && formData.categoryId && formData.authorId &&
        formData.captchaVerified && formData.guidelinesAccepted) {
      try {
        // Only save as draft, never publish automatically
        const response = await articleService.createArticle({ ...formData, status: 'draft' });
        if (response.success) {
          toast.info('Draft auto-saved', { autoClose: 2000 });
          // Only redirect to edit mode after first save if user wants to continue editing
          if (response.data.id && !window.location.pathname.includes('/edit/')) {
            navigate(`/admin/articles/edit/${response.data.id}`);
          }
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Don't show error for auto-save failures to avoid annoying the user
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

    // Handle recaptchaToken field
    if (name === 'recaptchaToken') {
      setFormData(prev => ({
        ...prev,
        captchaVerified: !!value
      }));
    }

    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Real-time validation for critical fields
    if (name === 'title' && value.length > 60) {
      setErrors(prev => ({
        ...prev,
        title: 'Title should be under 60 characters for better SEO'
      }));
    }

    if (name === 'metaTitle' && value.length > 60) {
      setErrors(prev => ({
        ...prev,
        metaTitle: 'Meta title should be under 60 characters'
      }));
    }

    if (name === 'metaDescription' && value.length > 160) {
      setErrors(prev => ({
        ...prev,
        metaDescription: 'Meta description should be under 160 characters'
      }));
    }
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, featuredImage: file }));
    }
  };

  const handleGalleryImageChange = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 5;

    if (formData.gallery.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed in gallery`);
      return;
    }

    // Validate each file
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      return true;
    });

    setFormData(prev => {
      const newGallery = [...prev.gallery, ...validFiles];

      // If no featured image is set and we have gallery images, set the first one as featured
      let newFeaturedImage = prev.featuredImage;
      if (!newFeaturedImage && newGallery.length > 0) {
        newFeaturedImage = newGallery[0];
        toast.info('First gallery image set as featured image');
      }

      return {
        ...prev,
        gallery: newGallery,
        featuredImage: newFeaturedImage
      };
    });
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => {
      const newGallery = prev.gallery.filter((_, i) => i !== index);
      let newFeaturedImage = prev.featuredImage;

      // If the removed image was the featured image, clear it or set to first remaining image
      if (prev.featuredImage && prev.gallery[index] === prev.featuredImage) {
        newFeaturedImage = newGallery.length > 0 ? newGallery[0] : null;
        if (newFeaturedImage) {
          toast.info('Featured image updated to first remaining gallery image');
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
      toast.success('Gallery image set as featured image');
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
      const newTag = e.target.value.trim().toLowerCase();
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

  const handleAuthorInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const platform = name.replace('social_', '');
      setNewAuthor(prev => ({
        ...prev,
        social_media: {
          ...prev.social_media,
          [platform]: value
        }
      }));
    } else {
      setNewAuthor(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAuthorImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAuthor(prev => ({ ...prev, profileImage: file }));
    }
  };

  const createAuthor = async () => {
    try {
      // Validate required fields
      const requiredFields = ['name', 'email'];
      const missingFields = requiredFields.filter(field => !newAuthor[field] || newAuthor[field].trim() === '');

      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newAuthor.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Validate name length
      if (newAuthor.name.length < 2 || newAuthor.name.length > 100) {
        toast.error('Author name must be between 2 and 100 characters');
        return;
      }

      const response = await articleService.createAuthor(newAuthor);
      if (response.success) {
        toast.success('Author created successfully');
        setAuthors(prev => [...prev, response.data]);
        setFormData(prev => ({ ...prev, authorId: response.data.id }));
        setShowAuthorForm(false);
        setNewAuthor({
          name: '',
          email: '',
          bio: '',
          title: '',
          experience: '',
          education: '',
          profileImage: null,
          social_media: {
            twitter: '',
            linkedin: '',
            facebook: '',
            instagram: '',
            website: ''
          },
          expertise: []
        });
      }
    } catch (error) {
      console.error('Create author error:', error);
      toast.error(error.message || 'Failed to create author');
    }
  };

  const handleTagInputChange = (e) => {
    const { name, value } = e.target;
    setNewTag(prev => ({ ...prev, [name]: value }));

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setNewTag(prev => ({ ...prev, slug }));
    }
  };

  const createTag = async () => {
    try {
      // Validate required fields
      if (!newTag.name || !newTag.slug) {
        toast.error('Tag name and slug are required');
        return;
      }

      // Validate slug format
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(newTag.slug)) {
        toast.error('Slug can only contain lowercase letters, numbers, and hyphens');
        return;
      }

      // For now, we'll add the tag to the local state
      // In a real implementation, you would call an API to create the tag
      const tagData = {
        ...newTag,
        id: Date.now().toString(), // Temporary ID
        categoryId: formData.categoryId
      };

      setAllTags(prev => [...prev, tagData]);
      setCategoryTags(prev => [...prev, tagData]);
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.name]
      }));

      toast.success('Tag created successfully');
      setShowTagForm(false);
      setNewTag({
        name: '',
        slug: '',
        type: 'regular',
        category: '',
        description: ''
      });
    } catch (error) {
      console.error('Create tag error:', error);
      toast.error(error.message || 'Failed to create tag');
    }
  };

  const validateForm = () => {
    const errors = {};

    // Required fields validation
    const required = ['title', 'content', 'categoryId', 'authorId'];
    const missing = required.filter(field => !formData[field]);

    if (missing.length > 0) {
      missing.forEach(field => {
        if (field === 'authorId') {
          errors[field] = 'Please select a primary author';
        } else {
          errors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
        }
      });
    }

    // Title length validation
    if (formData.title && formData.title.length > 60) {
      errors.title = 'Title should be under 60 characters for better SEO';
    }

    // Tags validation
    if (formData.tags.length < 3) {
      errors.tags = 'Please add at least 3 tags';
    }

    // Word count validation
    const wordCount = formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 100) {
      errors.content = `Article content should be at least 100 words (currently ${wordCount} words)`;
    }

    // Meta title validation
    if (formData.metaTitle && formData.metaTitle.length > 60) {
      errors.metaTitle = 'Meta title should be under 60 characters';
    }

    // Meta description validation
    if (formData.metaDescription && formData.metaDescription.length > 160) {
      errors.metaDescription = 'Meta description should be under 160 characters';
    }

    // Excerpt length validation
    if (formData.excerpt && formData.excerpt.length > 500) {
      errors.excerpt = 'Excerpt should be under 500 characters';
    }

    // New field validations
    if (!formData.recaptchaToken) {
      errors.recaptchaToken = 'Please complete the security verification';
    }

    if (!formData.guidelinesAccepted) {
      errors.guidelinesAccepted = 'You must accept the content guidelines';
    }


    return errors;
  };

  const handleSubmit = async (e, status = 'draft') => {
    e.preventDefault();

    // Mark all fields as touched for validation display
    const allFields = Object.keys(formData);
    const touchedFields = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(touchedFields);

    // Enhanced security verification before publishing
    if (status !== 'draft') {
      // Double-check security requirements
      if (!formData.captchaVerified) {
        toast.error('Security verification expired. Please complete CAPTCHA again.');
        return;
      }

      if (!formData.guidelinesAccepted) {
        toast.error('You must accept the content guidelines before publishing.');
        return;
      }

      // Additional security checks
      if (!formData.title || formData.title.trim().length < 10) {
        toast.error('Article title must be at least 10 characters long for publishing.');
        return;
      }

      if (!formData.content || formData.content.replace(/<[^>]*>/g, '').trim().length < 100) {
        toast.error('Article content must be at least 100 words for publishing.');
        return;
      }

      if (formData.tags.length < 3) {
        toast.error('At least 3 tags are required for publishing.');
        return;
      }

      // Verify admin permissions
      if (!admin || !isMasterAdmin()) {
        toast.error('You do not have permission to publish articles.');
        return;
      }
    }

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    if (status !== 'draft' && !validateForm()) {
      return;
    }

    setSaving(true);
    setErrors({}); // Clear any previous errors

    try {
      // Ensure required fields are not empty
      const requiredFields = ['title', 'content', 'categoryId', 'authorId'];
      const missingFields = requiredFields.filter(field => !formData[field] || formData[field] === '');

      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        console.error('Form data:', formData);
        toast.error(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      let submitData = {
         ...formData,
         status,
         coAuthors: formData.coAuthors,
         tags: formData.tags,
         keywords: formData.keywords
        };

      console.log('Submitting article data:', submitData);

      // Handle gallery images upload
      if (formData.gallery.length > 0) {
        const galleryImagePaths = [];
        console.log('Starting gallery upload for', formData.gallery.length, 'images');

        for (let i = 0; i < formData.gallery.length; i++) {
          const file = formData.gallery[i];
          try {
            // Validate file before upload
            if (!file || typeof file.size === 'undefined') {
              console.error('Invalid gallery file detected:', file);
              toast.error(`Invalid file detected: ${file?.name || 'Unknown file'}`);
              continue;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
              console.error('Gallery file too large:', file.name, file.size);
              toast.error(`${file.name} is too large. Max size is 5MB`);
              continue;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
              console.error('Invalid file type:', file.name, file.type);
              toast.error(`${file.name} is not an image file`);
              continue;
            }

            const formDataUpload = new FormData();
            formDataUpload.append('featured_image', file);

            console.log(`Uploading gallery image ${i + 1}/${formData.gallery.length}:`, file.name);
            const uploadResponse = await articleService.uploadFile('/files/upload', formDataUpload);

            if (uploadResponse.success && uploadResponse.file?.filename) {
              galleryImagePaths.push(uploadResponse.file.filename);
              console.log(`✅ Gallery image uploaded successfully: ${file.name} -> ${uploadResponse.file.filename}`);
            } else {
              console.error('Gallery upload failed:', uploadResponse);
              toast.error(`Failed to upload ${file.name}: ${uploadResponse.message || 'Unknown error'}`);
            }
          } catch (uploadError) {
            console.error('Error uploading gallery image:', uploadError);
            toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
          }
        }

        // Store gallery images as array of objects with proper structure
        if (galleryImagePaths.length > 0) {
          submitData.gallery = galleryImagePaths.map(filename => ({
            url: filename,
            alt: '',
            caption: ''
          }));
          console.log('Gallery images stored as:', submitData.gallery);
        } else {
          console.warn('No gallery images were successfully uploaded');
          submitData.gallery = [];
        }
      }

      console.log('=== FRONTEND SUBMIT DEBUG ===');
      console.log('submitData:', submitData);
      console.log('categoryId type:', typeof submitData.categoryId);
      console.log('authorId type:', typeof submitData.authorId);
      console.log('categoryId value:', submitData.categoryId);
      console.log('authorId value:', submitData.authorId);

      const response = await articleService.createArticle(submitData);

      if (response.success) {
        toast.success(`Article ${status === 'draft' ? 'saved as draft' : 'created'} successfully`);
        navigate('/admin/articles');
      } else {
        throw new Error(response.message || 'Failed to create article');
      }
    } catch (error) {
      console.error('Create article error:', error);

      // Handle different types of errors
      if (error.response?.status === 400) {
        toast.error('Invalid data provided. Please check your inputs.');
        setErrors({ general: 'Please check your form data and try again.' });
      } else if (error.response?.status === 401) {
        toast.error('You are not authorized to create articles.');
        setErrors({ general: 'Authorization failed. Please log in again.' });
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to create articles.');
        setErrors({ general: 'Permission denied.' });
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
        setErrors({ general: 'Server error occurred. Please try again later.' });
      } else {
        toast.error(error.message || 'Failed to create article');
        setErrors({ general: error.message || 'An unexpected error occurred.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const quillModules = {
    toolbar: {
      container: [
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
      ],
      handlers: {
        // Custom handlers can be added here if needed
      }
    },
    clipboard: {
      matchVisual: false
    },
    history: {
      delay: 1000,
      maxStack: 50,
      userOnly: true
    }
  };

  return (
    <div className={`min-h-screen ${bgMain} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${textMain}`}>Create New Article</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Create engaging content for your magazine
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/articles')}
              className={`px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              Cancel
            </button>
          </div>
        </div>

        <form className="space-y-6">
          {/* General Error Display */}
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <strong>Error:</strong> {errors.general}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading form data...</span>
            </div>
          )}

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
                      className={`w-full p-3 border rounded-lg ${inputBg} ${errors.title ? 'border-red-500' : ''}`}
                      placeholder="Enter compelling article title..."
                      required
                    />
                    <div className={`text-sm mt-1 ${errors.title ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {errors.title || 'Keep it under 60 characters for better SEO'}
                    </div>
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
                      <ErrorBoundary value={formData.content} onChange={handleContentChange}>
                        <ReactQuill
                          ref={quillRef}
                          value={formData.content}
                          onChange={handleContentChange}
                          modules={quillModules}
                          theme="snow"
                          style={{ minHeight: '400px' }}
                          placeholder="Write your article content here..."
                          preserveWhitespace={true}
                        />
                      </ErrorBoundary>
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                      Word count: {formData.content ? formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length : 0} (minimum 100 words)
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
                      placeholder="Brief summary of the article (auto-generated if left empty)..."
                      maxLength={500}
                    />
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {formData.excerpt.length}/500 characters
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={2}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                      placeholder="Additional description for internal use..."
                    />
                  </div>
                </div>
              </div>

              {/* Taxonomy Information */}
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
                      {taxonomyData.nationalities.map(option => (
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
                      {taxonomyData.ages.map(option => (
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
                      {taxonomyData.genders.map(option => (
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
                      {taxonomyData.ethnicities.map(option => (
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
                      {taxonomyData.residencies.map(option => (
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
                      {taxonomyData.industries.map(option => (
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
                      {taxonomyData.positions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Featured Image</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Upload Image
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                    />
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Recommended: 1200x630px, Max size: 5MB
                    </div>
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
                        Featured Image Preview
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
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Upload Gallery Images (Max 5)
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
                        Gallery Preview ({formData.gallery.length}/5)
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
                              onError={(e) => {
                                console.error('Failed to load gallery preview image:', file);
                                e.target.style.display = 'none';
                                const fallback = e.target.nextElementSibling;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            {/* Fallback for failed images */}
                            <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs hidden">
                              Image Preview Failed
                            </div>
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
                      maxLength={60}
                    />
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {formData.metaTitle.length}/60 characters
                    </div>
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
                      onVerify={(token) => {
                        setFormData(prev => ({
                          ...prev,
                          captchaVerified: !!token,
                          recaptchaToken: token
                        }));
                      }}
                      onExpired={() => setFormData(prev => ({
                        ...prev,
                        captchaVerified: false,
                        recaptchaToken: null
                      }))}
                    />
                    {!formData.recaptchaToken && touched.recaptchaToken && (
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
                    {!formData.guidelinesAccepted && touched.guidelinesAccepted && (
                      <p className="text-red-500 text-sm mt-1">You must accept the content guidelines to proceed</p>
                    )}
                  </div>

                  <div className="space-y-3">
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'draft')}
                    disabled={saving || !formData.recaptchaToken || !formData.guidelinesAccepted}
                    className={`w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 ${(saving || !formData.recaptchaToken || !formData.guidelinesAccepted) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'published')}
                    disabled={saving || !formData.recaptchaToken || !formData.guidelinesAccepted}
                    className={`w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ${(saving || !formData.recaptchaToken || !formData.guidelinesAccepted) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {saving ? 'Publishing...' : 'Publish Now'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'pending_review')}
                    disabled={saving || !formData.recaptchaToken || !formData.guidelinesAccepted}
                    className={`w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${(saving || !formData.recaptchaToken || !formData.guidelinesAccepted) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Submit for Review
                  </button>
                </div>
              </div>
              </div>

              {/* Publishing Options */}
              <div className={`${cardBg} p-6 rounded-lg border`}>
                <h2 className={`text-xl font-semibold ${textMain} mb-4`}>Publishing Options</h2>
                
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
                      min={new Date().toISOString().slice(0, -1)}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                    />
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Leave empty for manual publishing
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="mr-3 h-4 w-4 text-blue-600"
                      />
                      <span className={textMain}>Featured Article</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="heroSlider"
                        checked={formData.heroSlider}
                        onChange={handleInputChange}
                        className="mr-3 h-4 w-4 text-blue-600"
                      />
                      <span className={textMain}>Show in Hero Slider</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="trending"
                        checked={formData.trending}
                        onChange={handleInputChange}
                        className="mr-3 h-4 w-4 text-blue-600"
                      />
                      <span className={textMain}>Add to Trending</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="pinned"
                        checked={formData.pinned}
                        onChange={handleInputChange}
                        className="mr-3 h-4 w-4 text-blue-600"
                      />
                      <span className={textMain}>Pin to Top</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="allowComments"
                        checked={formData.allowComments}
                        onChange={handleInputChange}
                        className="mr-3 h-4 w-4 text-blue-600"
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
                      <option value="all">All Categories</option>
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

                <div className="space-y-4">
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
                      <option value="">
                        {authors.length > 0 ? 'Select Author (or choose from suggestions below)' : 'No authors available - create new'}
                      </option>
                      <option value="internal_team">Internal Team</option>
                      <option value="all">All Authors</option>
                      {authors.map(author => (
                        <option key={author.id} value={author.id}>
                          {author.name} {author.title && `- ${author.title}`}
                        </option>
                      ))}
                      <option value="new">+ Add New Author</option>
                    </select>
                  </div>

                  {/* Author Suggestions */}
                  {!formData.authorId && authors.length > 0 && (
                    <div className="mt-4">
                      <label className={`block text-sm font-medium ${textMain} mb-2`}>
                        Suggested Authors
                      </label>
                      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                        {/* Internal Team option */}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, authorId: 'internal_team' }))}
                          className={`p-3 text-left border rounded-lg transition-colors ${
                            isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`font-medium ${textMain}`}>Internal Team</div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Default author for internal articles
                          </div>
                        </button>
                        {/* Other authors */}
                        {authors.slice(0, 4).map(author => (
                          <button
                            key={author.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, authorId: author.id }))}
                            className={`p-3 text-left border rounded-lg transition-colors ${
                              isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className={`font-medium ${textMain}`}>{author.name}</div>
                            {author.title && (
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {author.title}
                              </div>
                            )}
                            {author.bio && (
                              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1 line-clamp-2`}>
                                {author.bio}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.authorId === 'new' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                          Please fill in all required author information below. The author will be automatically added to the database upon article publication.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAuthorForm(true)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Create New Author
                      </button>
                    </div>
                  )}

                  <div>
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
                      Suggested Tags ({categories.find(c => c.id == formData.categoryId)?.name})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categoryTags.map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleTagToggle(tag.name)}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
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

                {/* All Tags Suggestions */}
                {allTags.length > 0 && (
                  <div className="mb-4">
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      All Available Tags
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {allTags.slice(0, 20).map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleTagToggle(tag.name)}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                            formData.tags.includes(tag.name)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : `${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Tags Input */}
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Add Custom Tags
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.custom_tags}
                      onChange={handleCustomTags}
                      onKeyDown={handleCustomTags}
                      className={`flex-1 p-3 border rounded-lg ${inputBg}`}
                      placeholder="Type tag and press Enter or comma..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowTagForm(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      + New Tag
                    </button>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    Press Enter or comma to add multiple tags, or click "New Tag" to create a structured tag
                  </div>
                </div>

                {/* Selected Tags */}
                {formData.tags.length > 0 && (
                  <div className="mt-4">
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Selected Tags ({formData.tags.length})
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
                            className="hover:bg-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    {formData.tags.length < 3 && (
                      <p className="text-red-500 text-sm mt-2">
                        At least 3 tags are required for publication
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Author Creation Modal */}
        {showAuthorForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBg} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${textMain}`}>Create New Author</h3>
                <button
                  onClick={() => setShowAuthorForm(false)}
                  className={`text-gray-500 hover:text-gray-700`}
                >
                  ×
                </button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                  <strong>Note:</strong> All required fields must be filled. The author will be automatically added to the database upon article publication.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newAuthor.name}
                      onChange={handleAuthorInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                      placeholder="Author's full name"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={newAuthor.email}
                      onChange={handleAuthorInputChange}
                      className={`w-full p-3 border rounded-lg ${inputBg}`}
                      placeholder="author@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Title/Position
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newAuthor.title}
                    onChange={handleAuthorInputChange}
                    className={`w-full p-3 border rounded-lg ${inputBg}`}
                    placeholder="e.g., Senior Writer, Editor, Freelancer"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Bio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="bio"
                    value={newAuthor.bio}
                    onChange={handleAuthorInputChange}
                    rows={4}
                    className={`w-full p-3 border rounded-lg ${inputBg}`}
                    placeholder="Brief biography of the author..."
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Experience
                  </label>
                  <textarea
                    name="experience"
                    value={newAuthor.experience}
                    onChange={handleAuthorInputChange}
                    rows={3}
                    className={`w-full p-3 border rounded-lg ${inputBg}`}
                    placeholder="Professional experience and achievements..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Education
                  </label>
                  <textarea
                    name="education"
                    value={newAuthor.education}
                    onChange={handleAuthorInputChange}
                    rows={2}
                    className={`w-full p-3 border rounded-lg ${inputBg}`}
                    placeholder="Educational background..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Profile Image
                  </label>
                  <input
                    type="file"
                    onChange={handleAuthorImageChange}
                    accept="image/*"
                    className={`w-full p-3 border rounded-lg ${inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Social Media Links
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(newAuthor.social_media).map(platform => (
                      <div key={platform}>
                        <label className={`block text-sm ${textMain} mb-1 capitalize`}>
                          {platform}
                        </label>
                        <input
                          type="url"
                          name={`social_${platform}`}
                          value={newAuthor.social_media[platform]}
                          onChange={handleAuthorInputChange}
                          className={`w-full p-2 border rounded ${inputBg}`}
                          placeholder={`https://${platform}.com/...`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAuthorForm(false)}
                  className={`px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={createAuthor}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Author
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tag Creation Modal */}
        {showTagForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBg} rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${textMain}`}>Create New Tag</h3>
                <button
                  onClick={() => setShowTagForm(false)}
                  className={`text-gray-500 hover:text-gray-700`}
                >
                  ×
                </button>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
                <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                  <strong>Note:</strong> All required fields must be filled. The tag will be automatically added to the database upon article publication.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Tag Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newTag.name}
                    onChange={handleTagInputChange}
                    className={`w-full p-3 border rounded-lg ${inputBg}`}
                    placeholder="e.g., Technology, Health, Politics"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={newTag.slug}
                    onChange={handleTagInputChange}
                    className={`w-full p-3 border rounded-lg ${inputBg}`}
                    placeholder="URL-friendly version (auto-generated)"
                    required
                  />
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    Auto-generated from name. Only lowercase letters, numbers, and hyphens allowed.
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Type
                  </label>
                  <select
                    name="type"
                    value={newTag.type}
                    onChange={handleTagInputChange}
                    className={`w-full p-3 border rounded-lg ${inputBg}`}
                  >
                    <option value="regular">Regular</option>
                    <option value="special_feature">Special Feature</option>
                    <option value="trending">Trending</option>
                    <option value="multimedia">Multimedia</option>
                    <option value="interactive">Interactive</option>
                    <option value="event">Event</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={newTag.description}
                    onChange={handleTagInputChange}
                    rows={3}
                    className={`w-full p-3 border rounded-lg ${inputBg}`}
                    placeholder="Brief description of the tag..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowTagForm(false)}
                  className={`px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={createTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Create Tag
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateArticle;