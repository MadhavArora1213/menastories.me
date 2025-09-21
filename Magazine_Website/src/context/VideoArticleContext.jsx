import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import videoArticleService from '../services/videoArticleService';
import { toast } from 'react-toastify';

const VideoArticleContext = createContext();

export const useVideoArticleContext = () => {
  const context = useContext(VideoArticleContext);
  if (!context) {
    throw new Error('useVideoArticleContext must be used within a VideoArticleProvider');
  }
  return context;
};

export const VideoArticleProvider = ({ children }) => {
  const [videoArticles, setVideoArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    author: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0
  });
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initial data fetch after authentication
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      console.log('🔄 Initial fetch after authentication');
      setIsAuthenticated(true);
      fetchVideoArticles();
    } else {
      setIsAuthenticated(false);
    }
  }, []); // Only run once on mount

  // Fetch video articles with current filters and pagination
  const fetchVideoArticles = useCallback(async (customFilters = {}, customPagination = {}) => {
    // Check if user is authenticated by checking for admin token
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      console.log('⏳ No admin token found, skipping fetch...');
      setIsAuthenticated(false);
      return;
    }

    setIsAuthenticated(true);

    try {
      console.log('🔄 Fetching video articles...');
      setLoading(true);

      const params = {
        page: customPagination.current_page || pagination.current_page,
        limit: 10
      };

      const currentFilters = { ...filters, ...customFilters };

      // Add filters only if they have values and are not 'all'
      if (currentFilters.status !== 'all') params.status = currentFilters.status;
      if (currentFilters.category !== 'all') params.category_id = currentFilters.category;
      if (currentFilters.author !== 'all') params.author_id = currentFilters.author;
      if (currentFilters.search) params.search = currentFilters.search;

      console.log('📡 Fetch params:', params);
      const response = await videoArticleService.getAllVideoArticles(params);
      console.log('📡 Fetch response:', response);

      if (response.success) {
        const newArticles = response.data.videoArticles || [];
        const newPagination = response.data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_items: 0
        };

        console.log('✅ Setting articles:', newArticles.length, 'items');
        setVideoArticles(newArticles);
        setPagination(newPagination);
        setLastUpdate(Date.now());
      } else {
        console.error('❌ Fetch failed:', response);
        toast.error('Failed to fetch video articles');
      }
    } catch (error) {
      console.error('❌ Error fetching video articles:', error);
      toast.error('Failed to fetch video articles');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current_page]);

  // Update video article with optimistic update
  const updateVideoArticle = useCallback(async (id, updateData) => {
    console.log('🔄 Starting update for article:', id, 'with data:', updateData);
    console.log('📊 Current articles in state:', videoArticles.length, 'items');
    
    // Check for title length before sending
    if (updateData.title && updateData.title.length > 100) {
      console.warn('⚠️ Title is too long:', updateData.title.length, 'characters');
      toast.error('Title is too long. Maximum 100 characters allowed.');
      return { success: false, error: 'Title too long' };
    }

    // If no articles in state, fetch them first
    if (videoArticles.length === 0) {
      console.log('📡 No articles in state, fetching first...');
      await fetchVideoArticles();
    }

    // Optimistic update - update UI immediately
    const originalArticles = [...videoArticles];
    const articleIndex = videoArticles.findIndex(article => String(article.id) === String(id));

    console.log('📍 Found article at index:', articleIndex);

    if (articleIndex !== -1) {
      const updatedArticle = { ...videoArticles[articleIndex], ...updateData };
      const newArticles = [...videoArticles];
      newArticles[articleIndex] = updatedArticle;
      setVideoArticles(newArticles);
      console.log('✅ Optimistic update applied:', updatedArticle);
    } else {
      console.log('⚠️ Article not found in current state, skipping optimistic update');
    }

    try {
      console.log('📡 Sending update request to server...');
      const response = await videoArticleService.updateVideoArticle(id, updateData);
      console.log('📡 Server response:', response);

      if (response.success) {
        // Comprehensive field validation
        const validationResult = validateFieldUpdates(updateData, response.data);

        if (!validationResult.allValid) {
          console.warn('⚠️ BACKEND FIELD VALIDATION ISSUES:', validationResult.issues);

          // Separate critical and minor issues
          const criticalIssues = validationResult.issues.filter(issue =>
            issue.type === 'error' && ['title', 'content', 'youtubeUrl', 'categoryId', 'authorId'].includes(issue.field)
          );
          const significantIssues = validationResult.issues.filter(issue =>
            issue.type === 'error' && !['title', 'content', 'youtubeUrl', 'categoryId', 'authorId'].includes(issue.field)
          );
          const minorWarnings = validationResult.issues.filter(issue =>
            issue.type === 'warning'
          );

          // Show critical errors prominently
          if (criticalIssues.length > 0) {
            const criticalMessages = criticalIssues.map(issue => issue.message).join('; ');
            toast.error(`🚨 Critical backend issue: ${criticalMessages}`);
          } else if (significantIssues.length > 0) {
            const significantMessages = significantIssues.map(issue => issue.message).join('; ');
            toast.error(`Backend validation issues: ${significantMessages}`);
          }

          // Log minor issues for debugging but don't show to user
          if (minorWarnings.length > 0) {
            console.log('ℹ️ Minor validation warnings (not shown to user):', minorWarnings);
          }
        } else {
          console.log('✅ All fields validated successfully');
        }

        // Update with server response (this is the authoritative data)
        if (response.data) {
          setVideoArticles(prev => {
            const existingIndex = prev.findIndex(article => String(article.id) === String(id));
            if (existingIndex !== -1) {
              const updated = [...prev];
              updated[existingIndex] = response.data;
              console.log('🔄 Server response updated existing article:', response.data);
              return updated;
            }
            return prev;
          });
        }

        // Show success message based on validation results
        if (validationResult.allValid) {
          toast.success('Video article updated successfully');
        } else {
          const significantErrors = validationResult.issues.filter(issue => issue.type === 'error');
          const minorWarnings = validationResult.issues.filter(issue => issue.type === 'warning' && !issue.significant);

          if (significantErrors.length === 0 && minorWarnings.length > 0) {
            // Only minor warnings (like empty string to null conversions)
            toast.success('Video article updated successfully');
          } else if (significantErrors.length > 0) {
            // Has significant errors
            toast.warning('Article updated but some fields may have issues');
          } else {
            // Fallback
            toast.success('Video article updated successfully');
          }
        }
        
        setLastUpdate(Date.now());
        console.log('🎉 Update completed successfully');
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Failed to update video article');
      }
    } catch (error) {
      // Revert optimistic update on error
      console.error('❌ Update failed, reverting optimistic update:', error);
      setVideoArticles(originalArticles);
      const errorMessage = error.response?.data?.message || 'Failed to update video article';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [videoArticles, fetchVideoArticles]);

  // Create video article
  const createVideoArticle = useCallback(async (articleData) => {
    try {
      const response = await videoArticleService.createVideoArticle(articleData);

      if (response.success) {
        // Add new article to the list
        setVideoArticles(prev => [response.data, ...prev]);
        setLastUpdate(Date.now());
        toast.success('Video article created successfully');
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Failed to create video article');
      }
    } catch (error) {
      console.error('Create error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create video article';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Delete video article with optimistic update
  const deleteVideoArticle = useCallback(async (id) => {
    // Optimistic update - remove from UI immediately
    const originalArticles = [...videoArticles];
    setVideoArticles(prev => prev.filter(article => article.id !== id));

    try {
      const response = await videoArticleService.deleteVideoArticle(id);

      if (response.success) {
        toast.success('Video article deleted successfully');
        setLastUpdate(Date.now());
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to delete video article');
      }
    } catch (error) {
      // Revert optimistic update on error
      setVideoArticles(originalArticles);
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete video article';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [videoArticles]);

  // Refresh data
  const refreshData = useCallback(() => {
    fetchVideoArticles();
  }, [fetchVideoArticles]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, current_page: 1 })); // Reset to first page
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  // Debounce the fetchVideoArticles to prevent multiple simultaneous calls
  const fetchVideoArticlesDebounced = useCallback(
    debounce((customFilters = {}, customPagination = {}) => {
      fetchVideoArticles(customFilters, customPagination);
    }, 300),
    [fetchVideoArticles]
  );

  // Helper function for debouncing
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Comprehensive field validation function
  const validateFieldUpdates = (sentData, receivedData) => {
    const issues = [];
    let allValid = true;

    // Helper function to compare values with appropriate logic
    const compareValues = (field, sent, received) => {
      if (sent === undefined || sent === null) return true; // Not sent, skip validation

      // Handle different data types
      if (typeof sent === 'string' && typeof received === 'string') {
        const sentTrimmed = sent.trim();
        const receivedTrimmed = received.trim();

        if (sentTrimmed === receivedTrimmed) return true;

        // Check if difference is only whitespace
        if (sentTrimmed.replace(/\s+/g, '') === receivedTrimmed.replace(/\s+/g, '')) {
          issues.push({
            field,
            type: 'warning',
            significant: false,
            message: `${field}: whitespace difference only`
          });
          return true;
        }

        issues.push({
          field,
          type: 'error',
          significant: true,
          message: `${field}: sent "${sentTrimmed}" but received "${receivedTrimmed}"`
        });
        return false;
      }

      // Handle empty string to null conversion (common backend behavior)
      if (typeof sent === 'string' && received === null) {
        const sentTrimmed = sent.trim();
        if (sentTrimmed === '') {
          issues.push({
            field,
            type: 'warning',
            significant: false,
            message: `${field}: empty string converted to null by backend`
          });
          return true;
        }
        issues.push({
          field,
          type: 'error',
          significant: true,
          message: `${field}: sent "${sentTrimmed}" but received null`
        });
        return false;
      }

      // Handle null to empty string conversion
      if (sent === null && typeof received === 'string') {
        const receivedTrimmed = received.trim();
        if (receivedTrimmed === '') {
          issues.push({
            field,
            type: 'warning',
            significant: false,
            message: `${field}: null converted to empty string by backend`
          });
          return true;
        }
        issues.push({
          field,
          type: 'error',
          significant: true,
          message: `${field}: sent null but received "${receivedTrimmed}"`
        });
        return false;
      }

      if (typeof sent === 'boolean' && typeof received === 'boolean') {
        if (sent !== received) {
          issues.push({
            field,
            type: 'error',
            significant: true,
            message: `${field}: sent ${sent} but received ${received}`
          });
          return false;
        }
        return true;
      }

      if (typeof sent === 'number' && typeof received === 'number') {
        if (sent !== received) {
          issues.push({
            field,
            type: 'error',
            significant: true,
            message: `${field}: sent ${sent} but received ${received}`
          });
          return false;
        }
        return true;
      }

      // Handle arrays (like tags, coAuthors, keywords)
      if (Array.isArray(sent) && Array.isArray(received)) {
        const sentSorted = [...sent].sort();
        const receivedSorted = [...received].sort();

        if (JSON.stringify(sentSorted) !== JSON.stringify(receivedSorted)) {
          issues.push({
            field,
            type: 'error',
            significant: true,
            message: `${field}: array mismatch - sent ${JSON.stringify(sentSorted)} but received ${JSON.stringify(receivedSorted)}`
          });
          return false;
        }
        return true;
      }

      // Handle UUIDs (categoryId, subcategoryId, authorId, etc.)
      if (typeof sent === 'string' && typeof received === 'string' && sent !== received) {
        // Check if one is empty/null and other is valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const sentIsUUID = uuidRegex.test(sent);
        const receivedIsUUID = uuidRegex.test(received);

        if ((sent === '' || sent === null) && receivedIsUUID) {
          issues.push({
            field,
            type: 'warning',
            significant: false,
            message: `${field}: converted empty value to null`
          });
          return true;
        }

        if (sentIsUUID && (received === '' || received === null)) {
          issues.push({
            field,
            type: 'warning',
            significant: false,
            message: `${field}: converted null to empty value`
          });
          return true;
        }

        issues.push({
          field,
          type: 'error',
          significant: true,
          message: `${field}: sent "${sent}" but received "${received}"`
        });
        return false;
      }

      // Handle date/time formatting differences (common with scheduledPublishDate)
      if (field === 'scheduledPublishDate' && typeof sent === 'string' && typeof received === 'string') {
        try {
          const sentDate = new Date(sent);
          const receivedDate = new Date(received);

          // Check if dates are essentially the same (within 1 minute for timezone differences)
          const timeDiff = Math.abs(sentDate.getTime() - receivedDate.getTime());
          if (timeDiff < 60000) { // 1 minute tolerance
            issues.push({
              field,
              type: 'warning',
              significant: false,
              message: `${field}: timezone/format difference (${Math.round(timeDiff/1000)}s difference)`
            });
            return true;
          }
        } catch (dateError) {
          // If date parsing fails, fall through to regular comparison
        }
      }

      // Handle fields that return undefined from backend (fields not in database schema)
      if (typeof sent === 'string' && received === undefined) {
        const sentTrimmed = sent.trim();
        if (sentTrimmed === '') {
          issues.push({
            field,
            type: 'warning',
            significant: false,
            message: `${field}: field not handled by backend (empty value ignored)`
          });
          return true;
        }
        issues.push({
          field,
          type: 'error',
          significant: true,
          message: `${field}: sent "${sentTrimmed}" but backend returned undefined`
        });
        return false;
      }

      // Default comparison
      if (sent !== received) {
        issues.push({
          field,
          type: 'error',
          significant: true,
          message: `${field}: sent ${JSON.stringify(sent)} but received ${JSON.stringify(received)}`
        });
        return false;
      }

      return true;
    };

    // Validate all important fields - prioritize critical fields
    const criticalFields = ['title', 'content', 'youtubeUrl', 'categoryId', 'authorId'];
    const importantFields = [
      'subtitle', 'excerpt', 'description', 'videoType', 'duration', 'thumbnailUrl',
      'subcategoryId', 'authorBioOverride', 'featured', 'heroSlider', 'trending',
      'pinned', 'allowComments', 'metaTitle', 'metaDescription', 'imageCaption',
      'status', 'workflowStage', 'scheduledPublishDate'
    ];
    const optionalFields = [
      'imageAlt', 'publishDate', 'assignedTo', 'nextAction',
      'reviewNotes', 'rejectionReason', 'deadline', 'priority',
      'coAuthors', 'tags', 'keywords'
    ];

    const fieldsToValidate = [...criticalFields, ...importantFields, ...optionalFields];

    fieldsToValidate.forEach(field => {
      if (sentData[field] !== undefined) {
        const isValid = compareValues(field, sentData[field], receivedData[field]);
        if (!isValid) {
          allValid = false;
        }
      }
    });

    return { allValid, issues };
  };

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    // Wait for authentication to complete
    if (!isAuthenticated || loading) return;

    console.log('⏰ Setting up auto-refresh interval');
    const interval = setInterval(() => {
      if (!loading && !document.hidden && isAuthenticated) {
        console.log('⏰ Auto-refresh triggered');
        fetchVideoArticles();
      } else {
        console.log('⏰ Auto-refresh skipped - loading in progress, page hidden, or not authenticated');
      }
    }, 30000); // 30 seconds

    return () => {
      console.log('⏰ Clearing auto-refresh interval');
      clearInterval(interval);
    };
  }, [isAuthenticated, loading]); // Include isAuthenticated and loading dependencies

  // Refresh when page becomes visible
  useEffect(() => {
    // Wait for authentication to complete
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      console.log('👁️ Visibility changed:', document.hidden ? 'hidden' : 'visible');
      if (!document.hidden && !loading && isAuthenticated) {
        console.log('👁️ Page became visible, refreshing data...');
        // Add a small delay to prevent duplicate calls
        setTimeout(() => {
          fetchVideoArticles();
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      console.log('👁️ Removing visibility change listener');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, loading]); // Include isAuthenticated and loading dependencies

  const value = {
    videoArticles,
    loading,
    filters,
    pagination,
    lastUpdate,
    isAuthenticated,
    fetchVideoArticles,
    updateVideoArticle,
    createVideoArticle,
    deleteVideoArticle,
    refreshData,
    updateFilters,
    updatePagination
  };

  return (
    <VideoArticleContext.Provider value={value}>
      {children}
    </VideoArticleContext.Provider>
  );
};

export default VideoArticleContext;