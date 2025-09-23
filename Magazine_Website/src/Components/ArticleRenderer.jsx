import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import articleService from '../services/articleService';
import { toast } from 'react-toastify';
import StructuredData from './StructuredData';

// Lazy load components for better performance
const ArticleContent = React.lazy(() => import('./Article/ArticleContent'));
const ArticleHeader = React.lazy(() => import('./Article/ArticleHeader'));
const ArticleMeta = React.lazy(() => import('./Article/ArticleMeta'));
const RelatedArticles = React.lazy(() => import('./Article/RelatedArticles'));
const CommentSection = React.lazy(() => import('./Article/CommentSection'));
const ImageGallery = React.lazy(() => import('./Media/ImageGallery'));

const ArticleRenderer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImageList, setGalleryImageList] = useState([]);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  useEffect(() => {
    fetchArticle();
  }, [id]);

  // Enhanced image fetching with loading states and CORS support
  const fetchImageWithState = async (imageUrl, imageIndex, isExternal = false) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      setImageLoadingStates(prev => ({ ...prev, [imageIndex]: true }));

      // Handle CORS for external images
      if (isExternal) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        setImageLoadingStates(prev => ({ ...prev, [imageIndex]: false }));
        resolve(imageUrl);
      };

      img.onerror = (e) => {
        setImageLoadingStates(prev => ({ ...prev, [imageIndex]: false }));
        console.warn(`Failed to load image: ${imageUrl}`, {
          isExternal,
          error: e,
          imageIndex
        });
        reject(new Error(`Failed to load image: ${imageUrl}`));
      };

      img.src = imageUrl;
    });
  };

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await articleService.getArticle(id);

      if (response.success) {
        setArticle(response.data);

        // Fetch suggested articles based on tags
        if (response.data.tags && response.data.tags.length > 0) {
          fetchSuggestedArticles(response.data.tags, response.data.id);
        } else if (response.data.category_id) {
          // Fallback to category if no tags
          fetchSuggestedArticles([], response.data.id);
        }

        // Update page title and meta tags
        updateMetaTags(response.data);

        // Preload images for better performance - moved after image processing
      } else {
        throw new Error(response.message || 'Article not found');
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err.message || 'Article not found');

      if (err.response?.status === 404) {
        toast.error('Article not found');
        navigate('/404');
      } else {
        toast.error('Failed to load article');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedArticles = async (tags, currentArticleId) => {
    try {
      if (!tags || tags.length === 0) {
        // Fallback to category if no tags
        const response = await articleService.getAllArticles({
          status: 'published',
          limit: 10
        });

        if (response.success) {
          const suggested = response.data.articles
            .filter(art => art.id !== parseInt(currentArticleId))
            .slice(0, 8);
          setRelatedArticles(suggested);
        }
        return;
      }

      // Fetch articles and filter by matching tags
      const response = await articleService.getAllArticles({
        status: 'published',
        limit: 50 // Get more to filter by tags
      });

      if (response.success) {
        // Filter articles that share tags with current article
        const suggested = response.data.articles
          .filter(art => art.id !== parseInt(currentArticleId))
          .filter(art => {
            if (!art.tags || art.tags.length === 0) return false;
            // Check if article shares any tags
            return art.tags.some(tag => tags.includes(tag));
          })
          .slice(0, 8); // Limit to 8 articles

        // If we don't have enough suggested articles, fill with recent articles
        if (suggested.length < 8) {
          const remainingLimit = 8 - suggested.length;
          const suggestedIds = suggested.map(s => s.id);

          const additionalArticles = response.data.articles
            .filter(art => art.id !== parseInt(currentArticleId) && !suggestedIds.includes(art.id))
            .slice(0, remainingLimit);

          suggested.push(...additionalArticles);
        }

        setRelatedArticles(suggested);
      }
    } catch (err) {
      console.warn('Error fetching suggested articles:', err);
    }
  };

  const updateMetaTags = (articleData) => {
    // Meta tags are handled by Helmet in the render
  };

  const openGallery = (startIndex = 0) => {
    // Prepare gallery images in the format expected by ImageGallery component
    const images = finalDisplayImages.map((imageItem, index) => ({
      id: `article-image-${index}`,
      url: imageItem.url,
      type: 'image',
      displayName: `Article Image ${index + 1}`,
      altText: getImageAlt(index),
      caption: index === 0 ? 'Featured Image' : `Gallery Image ${index}`,
      thumbnailUrl: imageItem.url, // Use same URL for thumbnail
      format: 'jpg', // Default format
      size: 0, // Unknown size
      createdAt: article?.createdAt || new Date().toISOString(),
      isExternal: imageItem.isExternal // Pass external flag for better handling
    }));

    console.log('Opening gallery with images:', images);
    setGalleryImageList(images);
    setCurrentGalleryIndex(startIndex);
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
    setGalleryImageList([]);
    setCurrentGalleryIndex(0);
  };

  // Fix: Move keyboard navigation useEffect to always run, but only attach listeners conditionally
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!showGallery) return;

      switch (e.key) {
        case 'Escape':
          closeGallery();
          break;
        case 'ArrowLeft':
          setCurrentGalleryIndex(prev =>
            prev > 0 ? prev - 1 : galleryImageList.length - 1
          );
          break;
        case 'ArrowRight':
          setCurrentGalleryIndex(prev =>
            prev < galleryImageList.length - 1 ? prev + 1 : 0
          );
          break;
      }
    };

    // Always add/remove listeners, but they only work when gallery is open
    document.addEventListener('keydown', handleKeyPress);
    
    // Control body scroll based on gallery state
    if (showGallery) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [showGallery, galleryImageList.length]); // Always run this effect

  // Prepare structured data for JSON-LD
  const structuredData = article?.structuredData ? JSON.stringify(article.structuredData) : null;

  // Prepare images for layout - Enhanced gallery processing
  let galleryImages = [];
  if (article?.gallery) {
    try {
      if (typeof article.gallery === 'string' && article.gallery.trim() !== '') {
        galleryImages = JSON.parse(article.gallery);
        console.log('Parsed gallery from string:', galleryImages);
      } else if (Array.isArray(article.gallery)) {
        galleryImages = article.gallery;
        console.log('Gallery is already array:', galleryImages);
      }
    } catch (e) {
      console.warn('Failed to parse article gallery JSON:', e);
      console.warn('Raw gallery data:', article.gallery);
      galleryImages = [];
    }
  }

  // Debug gallery processing
  console.log('Gallery processing debug:', {
    rawGallery: article?.gallery,
    galleryType: typeof article?.gallery,
    parsedGallery: galleryImages,
    galleryLength: galleryImages.length
  });

  // Enhanced helper function to construct proper image URLs with validation and security
  const constructImageUrl = (imagePath) => {
    console.log('constructImageUrl called with:', imagePath);
    if (!imagePath || typeof imagePath !== 'string') {
      console.warn('constructImageUrl: Invalid input:', imagePath);
      return null;
    }

    // Trim whitespace
    const trimmedPath = imagePath.trim();
    if (!trimmedPath) {
      console.warn('constructImageUrl: Empty path after trimming:', imagePath);
      return null;
    }

    // If it's already a full URL, validate and return as is
    if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
      try {
        const url = new URL(trimmedPath);

        // Enhanced security validation for external URLs
        const allowedDomains = [
          'images.unsplash.com',
          'picsum.photos',
          'via.placeholder.com',
          'dummyimage.com',
          'loremflickr.com',
          'jsonplaceholder.typicode.com',
          'httpbin.org',
          'menastories.me',
          'localhost',
          '127.0.0.1'
        ];

        // Check if domain is in allowed list or if it's a relative protocol URL
        const isAllowedDomain = allowedDomains.some(domain =>
          url.hostname.includes(domain) || url.hostname === domain
        );

        // Allow relative protocol URLs (//example.com/image.jpg)
        const isRelativeProtocol = trimmedPath.startsWith('//');

        if (isAllowedDomain || isRelativeProtocol) {
          console.log('constructImageUrl: Valid external URL:', trimmedPath);
          return trimmedPath;
        } else {
          console.warn('constructImageUrl: External URL from untrusted domain:', trimmedPath);
          // Return a placeholder for untrusted external images
          return 'https://via.placeholder.com/800x600/e2e8f0/64748b?text=External+Image+Blocked';
        }
      } catch (error) {
        console.warn('constructImageUrl: Invalid image URL format:', trimmedPath, error);
        return null;
      }
    }

    // If it's a relative path, construct API URL
    if (trimmedPath.startsWith('/')) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const fullUrl = `${baseUrl}${trimmedPath}`;
      console.log('constructImageUrl: Constructed relative path URL:', fullUrl);
      return fullUrl;
    }

    // For filename-only images, use the general images endpoint
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const fullUrl = `${baseUrl}/images/${trimmedPath}`;
    console.log('constructImageUrl: Constructed filename URL:', fullUrl);
    return fullUrl;
  };

  // Enhanced image preloader with priority loading and retry mechanism
  const preloadImages = async (imageUrls) => {
    if (!imageUrls || imageUrls.length === 0) return;

    // Separate featured image (first image) from gallery images for priority loading
    const [featuredImage, ...galleryImages] = imageUrls;

    const preloadPromises = [];
    const maxRetries = 2;
    const retryDelay = 1000; // 1 second

    // Helper function to preload with retry
    const preloadWithRetry = async (url, index, isExternal = false, retryCount = 0) => {
      try {
        return await fetchImageWithState(url, index, isExternal);
      } catch (error) {
        if (retryCount < maxRetries) {
          console.log(`Retrying image ${index + 1} (attempt ${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
          return preloadWithRetry(url, index, isExternal, retryCount + 1);
        }
        throw error;
      }
    };

    // Priority load featured image first
    if (featuredImage) {
      const isExternal = featuredImage.startsWith('http://') || featuredImage.startsWith('https://');
      preloadPromises.push(
        preloadWithRetry(featuredImage, 0, isExternal).catch((error) => {
          console.warn('Featured image failed to preload after retries:', error);
          return null;
        })
      );
    }

    // Load gallery images with slight delay to prioritize featured image
    if (galleryImages.length > 0) {
      galleryImages.forEach((url, index) => {
        preloadPromises.push(
          new Promise((resolve) => {
            setTimeout(() => {
              const isExternal = url.startsWith('http://') || url.startsWith('https://');
              preloadWithRetry(url, index + 1, isExternal)
                .then(resolve)
                .catch((error) => {
                  console.warn(`Gallery image ${index + 1} failed to preload after retries:`, error);
                  resolve(null);
                });
            }, index * 100); // Stagger loading by 100ms
          })
        );
      });
    }

    try {
      const results = await Promise.allSettled(preloadPromises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      console.log(`Successfully preloaded ${successful}/${preloadPromises.length} images`);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  };

  // Enhanced image error handling with better fallbacks
  const handleImageError = (e, fallbackType = 'image', imageIndex = 0, imageAlt = '') => {
    const fallbackIcons = {
      video: '🎥',
      image: '🖼️',
      default: '📷'
    };

    const icon = fallbackIcons[fallbackType] || fallbackIcons.default;
    const parent = e.target.parentNode;

    // Hide the broken image
    e.target.style.display = 'none';

    // Create and show enhanced fallback
    let fallback = parent.querySelector('.image-fallback');
    if (!fallback) {
      fallback = document.createElement('div');
      fallback.className = 'image-fallback flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 p-4 rounded-lg border-2 border-dashed border-gray-300';

      // Add icon
      const iconDiv = document.createElement('div');
      iconDiv.className = 'text-6xl mb-2 opacity-60';
      iconDiv.textContent = icon;
      fallback.appendChild(iconDiv);

      // Add text description
      const textDiv = document.createElement('div');
      textDiv.className = 'text-center text-sm font-medium';
      textDiv.innerHTML = `
        <div class="text-gray-500 mb-1">Image unavailable</div>
        <div class="text-xs text-gray-400">${imageAlt || 'Article image'}</div>
      `;
      fallback.appendChild(textDiv);

      parent.appendChild(fallback);
    } else {
      fallback.style.display = 'flex';
    }

    // Log error for debugging
    console.warn(`Image failed to load:`, {
      index: imageIndex,
      type: fallbackType,
      alt: imageAlt,
      src: e.target.src
    });
  };

  // Enhanced image loading handler
  const handleImageLoad = (e, imageIndex = 0) => {
    console.log(`Image ${imageIndex + 1} loaded successfully:`, e.target.src);
    e.target.style.opacity = '1';
  };

  // Create displayImages array with proper URLs - Enhanced gallery processing
  console.log('Enhanced image processing debug:', {
    galleryImages: galleryImages,
    galleryImagesLength: galleryImages.length,
    articleFeaturedImage: article?.featuredImage,
    articleFeaturedImageType: typeof article?.featuredImage
  });

  // Process gallery images with better error handling and external image detection
  // Fetch all available gallery images (up to 5 total including featured image)
  console.log('Processing gallery images:', galleryImages);
  let allGalleryImages = [];

  if (galleryImages && galleryImages.length > 0) {
    allGalleryImages = galleryImages.slice(0, 4) // Get up to 4 gallery images
      .map((img, index) => {
        const processedUrl = constructImageUrl(img);
        const isExternal = img && (img.startsWith('http://') || img.startsWith('https://'));
        console.log(`Gallery image ${index + 1} processing:`, {
          original: img,
          processed: processedUrl,
          isExternal,
          type: isExternal ? 'external' : 'internal'
        });
        return { url: processedUrl, isExternal };
      })
      .filter((item, index) => {
        if (!item.url) {
          console.warn(`Gallery image ${index + 1} failed to process:`, item);
          return false;
        }
        return true;
      });
  }

  // Fallback: if no gallery images were processed but we have raw gallery data, try to use it directly
  if (allGalleryImages.length === 0 && galleryImages && galleryImages.length > 0) {
    console.log('No gallery images processed, trying fallback approach');
    allGalleryImages = galleryImages.slice(0, 4)
      .filter(img => img && typeof img === 'string' && img.trim() !== '')
      .map((img, index) => {
        const isExternal = img.startsWith('http://') || img.startsWith('https://');
        return {
          url: isExternal ? img : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/images/${img}`,
          isExternal
        };
      });
    console.log('Fallback gallery images:', allGalleryImages);
  }

  console.log('Processed gallery images:', allGalleryImages);

  // Always prioritize featured image as the lead photo
  let displayImages = [];
  if (article?.featuredImage) {
    const featuredUrl = constructImageUrl(article?.featuredImage);
    const isExternal = article.featuredImage && (article.featuredImage.startsWith('http://') || article.featuredImage.startsWith('https://'));
    console.log('Featured image processing:', {
      original: article.featuredImage,
      processed: featuredUrl,
      isExternal,
      type: isExternal ? 'external' : 'internal'
    });

    if (featuredUrl) {
      displayImages.push({ url: featuredUrl, isExternal });
      console.log('Added featured image as lead photo:', displayImages);
    } else {
      console.warn('Featured image failed to process:', article.featuredImage);
    }
  }

  // Add gallery images, but filter out the featured image if it exists in gallery
  if (allGalleryImages.length > 0) {
    const featuredUrl = displayImages[0]?.url; // Get the featured image URL for comparison
    const filteredGalleryImages = featuredUrl
      ? allGalleryImages.filter(img => {
          const isDuplicate = img.url === featuredUrl;
          if (isDuplicate) {
            console.log('Filtered out duplicate gallery image:', img.url);
          }
          return !isDuplicate;
        })
      : allGalleryImages;

    displayImages.push(...filteredGalleryImages);
    console.log('Added filtered gallery images:', displayImages);
  }

  // Show all available images (up to 5 total: 1 featured + 4 gallery)
  const finalDisplayImages = displayImages.slice(0, 5);
  console.log('Final display images array:', finalDisplayImages);
  console.log('Final display images count:', finalDisplayImages.length);
  console.log('Should show gallery images?', finalDisplayImages.length >= 2);

   // Prepare alt text fallbacks
   const getImageAlt = (index) => {
     if (index === 0 && article?.imageAlt) {
       return article.imageAlt;
     }
     if (article?.imageCaption) {
       return article.imageCaption;
     }
     return `${article?.title || 'Article'} - Image ${index + 1}`;
   };

   // Preload images for better performance after image processing is complete
   useEffect(() => {
     if (finalDisplayImages.length > 0) {
       // finalDisplayImages already contains processed URLs with external flags
       const imageUrls = finalDisplayImages.filter(item => item && item.url);
       preloadImages(imageUrls);
     }
   }, [finalDisplayImages]);

  console.log('Article images debug:', {
    gallery: galleryImages,
    featured: article?.featuredImage || null,
    displayImages: finalDisplayImages,
    allGalleryImages: allGalleryImages,
    finalDisplayImagesLength: finalDisplayImages.length,
    hasImages: finalDisplayImages.length > 0,
    firstImage: finalDisplayImages[0] || 'No first image',
    rawGalleryData: article?.gallery,
    galleryType: typeof article?.gallery
  });

  // Debug: Show gallery data in UI for troubleshooting
  const debugInfo = {
    hasGallery: !!(article?.gallery),
    galleryLength: galleryImages?.length || 0,
    finalDisplayImagesLength: finalDisplayImages.length,
    hasFeaturedImage: !!(article?.featuredImage),
    featuredImage: article?.featuredImage
  };

  // Split content into sections for the layout
  const contentSections = article?.content ? article.content.split('\n\n') : [];

  // For long-form articles, create more sophisticated content distribution
  const totalSections = contentSections.length;
  const sectionSize = Math.max(1, Math.floor(totalSections / 4));

  const contentPart1 = contentSections.slice(0, sectionSize);
  const contentPart2 = contentSections.slice(sectionSize, sectionSize * 2);
  const contentPart3 = contentSections.slice(sectionSize * 2, sectionSize * 3);
  const contentPart4 = contentSections.slice(sectionSize * 3);

  // Add early return for loading and error states
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading article...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error Loading Article</div>
          <div className="text-gray-600">{error}</div>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500 text-xl">Article not found</div>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article?.meta_title || article?.title || 'Article'}</title>
        <meta name="description" content={article?.meta_description || article?.excerpt || ''} />
        <meta name="keywords" content={article?.tags?.join(', ') || ''} />
        <meta property="og:title" content={article?.title || 'Article'} />
        <meta property="og:description" content={article?.excerpt || article?.description || ''} />
        <meta property="og:image" content={article?.featuredImage || ''} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={article?.publish_date || article?.createdAt || ''} />
        <meta property="article:author" content={article?.primaryAuthor?.name || ''} />
        <meta property="article:section" content={article?.category?.name || ''} />
        <meta property="article:tag" content={article?.tags?.join(', ') || ''} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      {/* Enhanced Structured Data */}
      <StructuredData
        type="article"
        data={{
          title: article?.title || 'Article',
          excerpt: article?.excerpt || '',
          description: article?.description || article?.excerpt || '',
          featuredImage: article?.featuredImage || '',
          publishedAt: article?.publish_date || article?.createdAt || '',
          modifiedAt: article?.updatedAt || '',
          author: article?.primaryAuthor || article?.author || {},
          category: article?.category || {},
          tags: article?.tags || [],
          slug: article?.slug || ''
        }}
      />

      <article className="newspaper-article" style={{marginTop: '10rem'}}>
        {/* Newspaper Masthead */}
        {/* <header className="newspaper-masthead">
          <div className="masthead-content">
            <div className="newspaper-name">
              <h1 className="paper-title">THE DAILY CHRONICLE</h1>
              <div className="paper-subtitle">ESTABLISHED 2024 • YOUR TRUSTED NEWS SOURCE</div>
            </div>

            <div className="masthead-info">
              <div className="publication-date">
                {new Date(article.publish_date || article.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="volume-issue">
                VOL. 1 • NO. {Math.floor(Math.random() * 1000) + 1}
              </div>
            </div>
          </div>
        </header>

        Main News`paper Layout */}
        <main className="newspaper-body">
          <div className="newspaper-container">
            {/* Above the Fold - Main Story */}
            <section className="above-the-fold">
              {/* Section Header */}
              <div className="section-header">
                <div className="section-name">{article.category?.name?.toUpperCase() || 'NEWS'}</div>
                <div className="section-line"></div>
              </div>

              {/* Main Headline */}
              <div className="main-headline">
                <h1 className="headline-text">{article?.title || 'Article'}</h1>
                {article?.subtitle && (
                  <h2 className="subheadline-text">{article.subtitle}</h2>
                )}
              </div>

              {/* Byline and Dateline */}
              <div className="story-byline">
                <div className="byline-info">
                  <span className="by-label">By</span>
                  <span className="author-name">{article?.primaryAuthor?.name || 'Staff Writer'}</span>
                  {article?.primaryAuthor?.title && (
                    <span className="author-title">, {article.primaryAuthor.title}</span>
                  )}
                </div>
                <div className="dateline">
                  {new Date(article?.publish_date || article?.createdAt || Date.now()).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* Lead Photo */}
              {displayImages[0] && (
                <div className="lead-photo">
                  <img
                    src={displayImages[0].url}
                    alt={getImageAlt(0)}
                    onClick={() => openGallery(0)}
                    className="photo-image cursor-pointer hover:opacity-95 transition-opacity"
                    onError={(e) => handleImageError(e, 'image', 0, getImageAlt(0))}
                    onLoad={(e) => handleImageLoad(e, 0)}
                    loading="lazy"
                    crossOrigin={displayImages[0].isExternal ? 'anonymous' : undefined}
                  />
                  <div className="photo-caption">
                    {article?.imageCaption || 'Lead photo'}
                  </div>
                  <div className="photo-credit">
                    Photo by {article?.primaryAuthor?.name || 'Staff Photographer'}
                    {displayImages[0].isExternal && ' (External Source)'}
                  </div>
                </div>
              )}

              {/* Lead Paragraph */}
              {article?.excerpt && (
                <div className="lead-paragraph">
                  <p className="lead-text">{article.excerpt}</p>
                </div>
              )}

            </section>

            {/* Main Story - 2 Column Layout */}
            <section className="story-columns">
              {/* Left Column */}
              <div className="story-column left-column">
                <div className="column-content">
                  <div dangerouslySetInnerHTML={{
                    __html: contentPart1.join('\n\n')
                  }} />

                  {/* Dynamic Image Layout Based on Count */}
                  {(finalDisplayImages.length >= 2 || (galleryImages && galleryImages.length > 0)) && (
                    <div className="article-images">
                      {finalDisplayImages.length >= 5 && (
                        <div className="image-grid-5">
                          {/* 5-image layout: 2x2 grid + 1 large */}
                          <div className="image-row">
                            <div className="image-item small">
                              <img
                                src={finalDisplayImages[1].url}
                                alt={getImageAlt(1)}
                                onClick={() => openGallery(1)}
                                className="grid-image cursor-pointer hover:opacity-95 transition-opacity"
                                onError={(e) => handleImageError(e, 'image', 1, getImageAlt(1))}
                                onLoad={(e) => handleImageLoad(e, 1)}
                                loading="lazy"
                                crossOrigin={finalDisplayImages[1].isExternal ? 'anonymous' : undefined}
                              />
                            </div>
                            <div className="image-item small">
                              <img
                                src={finalDisplayImages[2].url}
                                alt={getImageAlt(2)}
                                onClick={() => openGallery(2)}
                                className="grid-image cursor-pointer hover:opacity-95 transition-opacity"
                                onError={(e) => handleImageError(e, 'image', 2, getImageAlt(2))}
                                crossOrigin={finalDisplayImages[2].isExternal ? 'anonymous' : undefined}
                              />
                            </div>
                          </div>
                          <div className="image-row">
                            <div className="image-item medium">
                              <img
                                src={finalDisplayImages[3].url}
                                alt={getImageAlt(3)}
                                onClick={() => openGallery(3)}
                                className="grid-image cursor-pointer hover:opacity-95 transition-opacity"
                                onError={(e) => handleImageError(e, 'image', 3, getImageAlt(3))}
                                crossOrigin={finalDisplayImages[3].isExternal ? 'anonymous' : undefined}
                              />
                            </div>
                            <div className="image-item medium">
                              <img
                                src={finalDisplayImages[4].url}
                                alt={getImageAlt(4)}
                                onClick={() => openGallery(4)}
                                className="grid-image cursor-pointer hover:opacity-95 transition-opacity"
                                onError={(e) => handleImageError(e, 'image', 4, getImageAlt(4))}
                                crossOrigin={finalDisplayImages[4].isExternal ? 'anonymous' : undefined}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {finalDisplayImages.length === 4 && (
                        <div className="image-grid-4">
                          {/* 4-image layout: 2x2 grid */}
                          <div className="image-row">
                            <div className="image-item medium">
                              <img
                                src={finalDisplayImages[1].url}
                                alt={getImageAlt(1)}
                                onClick={() => openGallery(1)}
                                className="grid-image cursor-pointer hover:opacity-95 transition-opacity"
                                onError={(e) => {
                                  console.error('Image failed to load:', finalDisplayImages[1].url);
                                  e.target.style.display = 'none';
                                  const altDiv = document.createElement('div');
                                  altDiv.className = 'photo-alt-fallback medium';
                                  altDiv.textContent = getImageAlt(1);
                                  e.target.parentNode.appendChild(altDiv);
                                }}
                                crossOrigin={finalDisplayImages[1].isExternal ? 'anonymous' : undefined}
                              />
                            </div>
                            <div className="image-item medium">
                              <img
                                src={finalDisplayImages[2].url}
                                alt={getImageAlt(2)}
                                onClick={() => openGallery(2)}
                                className="grid-image cursor-pointer hover:opacity-95 transition-opacity"
                                onError={(e) => handleImageError(e, 'image', 2, getImageAlt(2))}
                                crossOrigin={finalDisplayImages[2].isExternal ? 'anonymous' : undefined}
                              />
                            </div>
                          </div>
                          <div className="image-row">
                            <div className="image-item medium">
                              <img
                                src={finalDisplayImages[3].url}
                                alt={getImageAlt(3)}
                                onClick={() => openGallery(3)}
                                className="grid-image cursor-pointer hover:opacity-95 transition-opacity"
                                onError={(e) => handleImageError(e, 'image', 3, getImageAlt(3))}
                                crossOrigin={finalDisplayImages[3].isExternal ? 'anonymous' : undefined}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {finalDisplayImages.length === 3 && (
                        <div className="image-grid-3">
                          {/* 3-image layout: 1 large + 2 small */}
                          <div className="image-row">
                            <div className="image-item large">
                              <img
                                src={finalDisplayImages[1].url}
                                alt={getImageAlt(1)}
                                onClick={() => openGallery(1)}
                                className="grid-image cursor-pointer hover:opacity-95 transition-opacity"
                                onError={(e) => handleImageError(e, 'image', 1, getImageAlt(1))}
                                crossOrigin={finalDisplayImages[1].isExternal ? 'anonymous' : undefined}
                              />
                            </div>
                          </div>
                          <div className="image-row">
                            <div className="image-item small">
                              <img
                                src={finalDisplayImages[2].url}
                                alt={getImageAlt(2)}
                                onClick={() => openGallery(2)}
                                className="grid-image cursor-pointer hover:opacity-95 transition-opacity"
                                onError={(e) => handleImageError(e, 'image', 2, getImageAlt(2))}
                                crossOrigin={finalDisplayImages[2].isExternal ? 'anonymous' : undefined}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {finalDisplayImages.length === 2 && (
                        <div className="image-grid-2">
                          {/* 2-image layout: 2 medium images */}
                          <div className="image-row">
                            <div className="image-item medium">
                              <img
                                src={finalDisplayImages[1].url}
                                alt={getImageAlt(1)}
                                onClick={() => openGallery(1)}
                                className="grid-image cursor-pointer hover:opacity-95 transition-opacity"
                                onError={(e) => handleImageError(e, 'image', 1, getImageAlt(1))}
                                crossOrigin={finalDisplayImages[1].isExternal ? 'anonymous' : undefined}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {finalDisplayImages.length === 1 && (
                        <div className="image-grid-1">
                          {/* 1-image layout: single large image */}
                          <div className="image-row">
                            <div className="image-item large">
                              <img
                                src={finalDisplayImages[0].url}
                                alt={getImageAlt(0)}
                                onClick={() => openGallery(0)}
                                className="grid-image cursor-pointer hover:opacity-95 transition-opacity"
                                onError={(e) => handleImageError(e, 'image', 0, getImageAlt(0))}
                                crossOrigin={finalDisplayImages[0].isExternal ? 'anonymous' : undefined}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div dangerouslySetInnerHTML={{
                    __html: contentPart2.join('\n\n')
                  }} />
                </div>
              </div>

              {/* Right Column */}
              <div className="story-column right-column">
                <div className="column-content">
                  <div dangerouslySetInnerHTML={{
                    __html: contentPart3.join('\n\n')
                  }} />

                  {/* Author Bio Sidebar */}
                  <div className="author-sidebar">
                    <h3 className="sidebar-header">ABOUT THE AUTHOR</h3>
                    <div className="author-bio-content">
                      {article.primaryAuthor?.profile_image && (
                        <img
                          src={article.primaryAuthor.profile_image}
                          alt={article.primaryAuthor.name}
                          className="author-photo"
                        />
                      )}
                      <div className="author-details">
                        <div className="author-name-sidebar">{article.primaryAuthor?.name}</div>
                        {article.primaryAuthor?.title && (
                          <div className="author-title-sidebar">{article.primaryAuthor.title}</div>
                        )}
                        <div className="author-description">
                          {article.author_bio_override || article.primaryAuthor?.bio || 'Staff writer covering current events and community news.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Story Stats */}
                  <div className="story-stats">
                    <div className="stat-item">
                      <span className="stat-label">Reading Time:</span>
                      <span className="stat-value">{Math.ceil((article.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0) / 200)} min</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Word Count:</span>
                      <span className="stat-value">{article.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0}</span>
                    </div>
                  </div>

                  {/* Story Stats */}

                  <div dangerouslySetInnerHTML={{
                    __html: contentPart4.join('\n\n')
                  }} />
                </div>
              </div>
            </section>
          </div>
        </main>
      </article>

      {/* Professional Magazine Author Bio - Removed */}

      {/* Comments Section */}
      <section className="py-16 px-8 md:px-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<div className="text-center py-8">Loading comments...</div>}>
            <CommentSection
              articleId={article.id}
              articleSlug={article.slug}
              allowComments={article.allow_comments !== false}
            />
          </Suspense>
        </div>
      </section>

      {/* Magazine Tags Section */}
      {article.tags && article.tags.length > 0 && (
        <section className="py-16 px-8 md:px-16" style={{backgroundColor: '#f8fafc'}}>
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-8 uppercase tracking-wide text-sm">Related Topics</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white text-sm border hover transition-colors cursor-pointer"
                  style={{color: '#162048', borderColor: '#162048'}}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#162048'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Suggested Articles Section */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="py-16 px-8 md:px-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-[#162048] mb-4">Suggested Articles</h3>
              <p className="text-gray-600 text-lg">Articles you might also enjoy reading</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedArticles.map((suggestedArticle) => (
                <article
                  key={suggestedArticle.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer group border border-gray-100 hover:border-[#162048]/20"
                  onClick={() => navigate(`/article/${suggestedArticle.slug}`)}
                >
                  {/* Article Image */}
                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {suggestedArticle.featuredImage ? (
                      <img
                        src={constructImageUrl(suggestedArticle.featuredImage)}
                        alt={suggestedArticle.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          console.error('Suggested article image failed to load:', suggestedArticle.featuredImage);
                          e.target.style.display = 'none';
                          // Show fallback
                          const fallback = e.target.nextElementSibling;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    {/* Fallback when no image or error */}
                    {(!suggestedArticle.featuredImage) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#e3e7f7] to-[#162048]">
                        <div className="text-center text-[#162048]">
                          <span className="text-5xl opacity-80">📰</span>
                          <div className="text-sm font-semibold mt-3 opacity-90">News Article</div>
                        </div>
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {/* Category badge */}
                    <div className="absolute top-3 left-3 bg-[#162048] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                      {suggestedArticle.category?.name || 'News'}
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="p-5">
                    <h4 className="font-bold text-[#162048] text-lg mb-3 line-clamp-2 group-hover:text-[#0f1419] transition-colors duration-300 leading-tight">
                      {suggestedArticle.title}
                    </h4>

                    {suggestedArticle.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {suggestedArticle.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span className="font-medium text-[#162048]">{suggestedArticle.primaryAuthor?.name || 'Staff Writer'}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded-full">{new Date(suggestedArticle.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Tags */}
                    {suggestedArticle.tags && suggestedArticle.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {suggestedArticle.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-[#162048] text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-[#0f1419] transition-colors duration-200"
                          >
                            #{tag}
                          </span>
                        ))}
                        {suggestedArticle.tags.length > 3 && (
                          <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                            +{suggestedArticle.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hover effect border */}
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-[#162048]/30 transition-colors duration-300 pointer-events-none"></div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Magazine Footer */}
     

      {/* Enhanced Image Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 backdrop-blur-sm">
          <div className="relative w-full h-full max-w-7xl max-h-screen p-4">
            {/* Enhanced Close Button */}
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 z-60 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
              aria-label="Close gallery"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Gallery Info Bar */}
            <div className="absolute top-4 left-4 z-50 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
              <span className="text-sm font-medium">
                {currentGalleryIndex + 1} / {galleryImageList.length}
              </span>
              {galleryImageList[currentGalleryIndex] && (
                <div className="text-xs text-gray-300 mt-1">
                  {galleryImageList[currentGalleryIndex].caption || 'Article Image'}
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            {galleryImageList.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentGalleryIndex(prev =>
                    prev > 0 ? prev - 1 : galleryImageList.length - 1
                  )}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                  aria-label="Previous image"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentGalleryIndex(prev =>
                    prev < galleryImageList.length - 1 ? prev + 1 : 0
                  )}
                  className="absolute right-16 top-1/2 transform -translate-y-1/2 z-50 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                  aria-label="Next image"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            <Suspense fallback={
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                <div className="text-white text-lg">Loading gallery...</div>
              </div>
            }>
              <ImageGallery
                images={galleryImageList}
                showMetadata={true}
                showNavigation={true}
                showThumbnails={true}
                autoPlay={false}
                className="w-full h-full"
                startIndex={currentGalleryIndex}
              />
            </Suspense>
          </div>
        </div>
      )}

      <style>{`
        /* Ultra-Premium Newspaper Styling */
        .newspaper-article {
          font-family: 'Times New Roman', 'Georgia', serif;
          background: linear-gradient(135deg, #fafbfc 0%, #f1f3f4 50%, #e8eaed 100%);
          color: #1a1a1a;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          position: relative;
        }

        .newspaper-article::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 226, 0.03) 0%, transparent 50%);
          pointer-events: none;
          z-index: -1;
        }

        /* Ultra-Premium Newspaper Masthead */
        .newspaper-masthead {
          background:
            linear-gradient(135deg, #ffffff 0%, #f8f9fa 25%, #ffffff 50%, #f8f9fa 75%, #ffffff 100%),
            linear-gradient(45deg, transparent 30%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.02) 70%, transparent 70%);
          background-size: 100% 100%, 20px 20px;
          border-bottom: 5px solid #000;
          padding: 2rem 3rem;
          margin-bottom: 3rem;
          box-shadow:
            0 8px 32px rgba(0,0,0,0.12),
            0 2px 8px rgba(0,0,0,0.08),
            inset 0 1px 0 rgba(255,255,255,0.8);
          position: relative;
          overflow: hidden;
        }

        .newspaper-masthead::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255,255,255,0.1) 25%,
            transparent 50%,
            rgba(255,255,255,0.1) 75%,
            transparent 100%);
          animation: shimmer 3s ease-in-out infinite;
        }

        .newspaper-masthead::after {
          content: '';
          position: absolute;
          bottom: -2.5px;
          left: 0;
          right: 0;
          height: 2px;
          background: repeating-linear-gradient(
            90deg,
            #000 0px,
            #000 3px,
            transparent 3px,
            transparent 6px
          );
          box-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }

        .masthead-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .newspaper-name {
          flex: 1;
        }

        .paper-title {
          font-family: 'Times New Roman', 'Georgia', serif;
          font-size: 3.5rem;
          font-weight: 900;
          margin: 0;
          letter-spacing: 4px;
          color: #000;
          text-shadow:
            2px 2px 4px rgba(0,0,0,0.2),
            0 0 20px rgba(0,0,0,0.1);
          line-height: 0.9;
          background: linear-gradient(135deg, #000 0%, #333 50%, #000 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        .paper-title::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #000 0%, #666 50%, #000 100%);
          border-radius: 2px;
        }

        .paper-subtitle {
          font-size: 0.9rem;
          color: #555;
          margin-top: 0.75rem;
          letter-spacing: 2px;
          font-weight: 600;
          text-transform: uppercase;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          border-top: 1px solid rgba(0,0,0,0.1);
          padding-top: 0.5rem;
          font-family: 'Arial Black', 'Arial', sans-serif;
        }

        .masthead-info {
          text-align: right;
          font-size: 0.95rem;
          font-family: 'Arial', sans-serif;
        }

        .publication-date {
          font-weight: bold;
          margin-bottom: 0.25rem;
          font-size: 1rem;
          color: #000;
        }

        .volume-issue {
          color: #666;
          font-weight: 500;
        }

        /* Ultra-Premium Newspaper Body */
        .newspaper-body {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 2.5rem;
          position: relative;
        }

        .newspaper-container {
          background:
            linear-gradient(135deg, #ffffff 0%, #fafbfc 25%, #ffffff 50%, #fafbfc 75%, #ffffff 100%),
            linear-gradient(45deg, transparent 40%, rgba(0,0,0,0.01) 40%, rgba(0,0,0,0.01) 60%, transparent 60%);
          background-size: 100% 100%, 30px 30px;
          box-shadow:
            0 20px 60px rgba(0,0,0,0.1),
            0 8px 32px rgba(0,0,0,0.08),
            0 0 0 1px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,0.8);
          padding: 4rem;
          border-radius: 8px;
          position: relative;
          border: 1px solid rgba(0,0,0,0.08);
        }

        .newspaper-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="premium-paper-texture" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="transparent"/><circle cx="25" cy="25" r="0.8" fill="%23000000" opacity="0.03"/><circle cx="75" cy="75" r="0.5" fill="%23000000" opacity="0.02"/><circle cx="50" cy="10" r="0.6" fill="%23000000" opacity="0.025"/><circle cx="10" cy="50" r="0.4" fill="%23000000" opacity="0.02"/><circle cx="90" cy="30" r="0.7" fill="%23000000" opacity="0.028"/></pattern></defs><rect width="100" height="100" fill="url(%23premium-paper-texture)"/>'),
            linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
          pointer-events: none;
          border-radius: 8px;
        }

        .newspaper-container::after {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          background: linear-gradient(135deg, rgba(0,0,0,0.1) 0%, transparent 25%, rgba(0,0,0,0.05) 50%, transparent 75%, rgba(0,0,0,0.08) 100%);
          border-radius: 9px;
          z-index: -1;
        }

        /* Above the Fold */
        .above-the-fold {
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 2.5rem;
          margin-bottom: 2.5rem;
          position: relative;
        }

        .above-the-fold::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 1px;
          background: repeating-linear-gradient(
            90deg,
            #000 0px,
            #000 3px,
            transparent 3px,
            transparent 6px
          );
        }

        .section-header {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-name {
          font-family: 'Arial Black', 'Arial', sans-serif;
          font-size: 1.1rem;
          font-weight: 900;
          background: #000;
          color: #fff;
          padding: 0.4rem 1rem;
          margin-right: 1.5rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .section-line {
          flex: 1;
          height: 3px;
          background: linear-gradient(90deg, #000 0%, #666 100%);
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .main-headline {
          margin-bottom: 1.5rem;
        }

        .headline-text {
          font-size: 4rem;
          font-weight: 900;
          line-height: 1.02;
          margin: 0;
          font-family: 'Times New Roman', 'Georgia', serif;
          letter-spacing: -1px;
          text-shadow:
            3px 3px 6px rgba(0,0,0,0.15),
            0 0 30px rgba(0,0,0,0.08);
          color: #000;
          background: linear-gradient(135deg, #000 0%, #333 30%, #000 70%, #111 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          text-transform: uppercase;
        }

        .headline-text::before {
          content: '';
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          background: linear-gradient(135deg, rgba(0,0,0,0.05) 0%, transparent 50%, rgba(0,0,0,0.03) 100%);
          border-radius: 8px;
          z-index: -1;
        }

        .subheadline-text {
          font-size: 1.8rem;
          font-style: italic;
          margin: 1rem 0 0 0;
          color: #555;
          line-height: 1.4;
          font-weight: 400;
          font-family: 'Georgia', serif;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.05);
          position: relative;
        }

        .subheadline-text::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, #000 0%, #666 100%);
          border-radius: 1px;
        }

        .story-byline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(248,249,250,0.8) 0%, rgba(233,236,239,0.6) 100%);
          border: 2px solid rgba(0,0,0,0.08);
          border-radius: 8px;
          position: relative;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .story-byline::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
          border-radius: 6px;
        }

        .story-byline::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: repeating-linear-gradient(
            90deg,
            #000 0px,
            #000 3px,
            transparent 3px,
            transparent 6px
          );
          border-radius: 0 0 8px 8px;
        }

        .byline-info {
          font-size: 1.2rem;
          font-family: 'Arial', sans-serif;
          font-weight: 500;
          position: relative;
          z-index: 1;
        }

        .by-label {
          font-weight: 900;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.9rem;
        }

        .author-name {
          font-weight: 900;
          color: #000;
          margin: 0 0.75rem;
          font-size: 1.3rem;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }

        .author-title {
          color: #666;
          font-style: italic;
          font-weight: 500;
          font-size: 1rem;
        }

        .dateline {
          font-size: 1.1rem;
          color: #555;
          font-weight: 600;
          font-family: 'Arial', sans-serif;
          background: rgba(0,0,0,0.05);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          position: relative;
          z-index: 1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Ultra-Premium Lead Photo */
        .lead-photo {
          margin: 3rem 0 3rem 0;
          text-align: center;
          position: relative;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(248,249,250,0.3) 0%, rgba(233,236,239,0.2) 100%);
          border-radius: 12px;
          border: 2px solid rgba(0,0,0,0.08);
        }

        .photo-image {
          max-width: 100%;
          height: auto;
          max-height: 600px;
          width: auto;
          object-fit: contain;
          border: 3px solid #000;
          box-shadow:
            0 20px 40px rgba(0,0,0,0.2),
            0 8px 16px rgba(0,0,0,0.1),
            0 0 0 1px rgba(255,255,255,0.1);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border-radius: 4px;
          position: relative;
          display: block;
          margin: 0 auto;
        }

        .photo-image::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          background: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(255,255,255,0.1) 50%, rgba(0,0,0,0.2) 100%);
          border-radius: 6px;
          z-index: -1;
        }

        .photo-image:hover {
          transform: scale(1.03) rotate(0.5deg);
          box-shadow:
            0 30px 60px rgba(0,0,0,0.3),
            0 12px 24px rgba(0,0,0,0.15),
            0 0 0 2px rgba(255,255,255,0.2);
        }

        .photo-caption {
          font-size: 1rem;
          font-style: italic;
          margin-top: 1rem;
          color: #444;
          font-weight: 600;
          line-height: 1.5;
          font-family: 'Georgia', serif;
          background: rgba(255,255,255,0.8);
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border-left: 4px solid #000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .photo-credit {
          font-size: 0.9rem;
          color: #777;
          margin-top: 0.75rem;
          font-weight: 600;
          font-family: 'Arial', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: rgba(0,0,0,0.05);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          display: inline-block;
        }

        .photo-alt-fallback {
          padding: 3rem 2rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 2px solid #dee2e6;
          font-style: italic;
          color: #666;
          text-align: center;
          border-radius: 4px;
          font-size: 1.1rem;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }

        .lead-paragraph {
          margin: 1.5rem 0;
          position: relative;
        }

        .lead-text {
          font-size: 1.3rem;
          line-height: 1.7;
          font-weight: 500;
          color: #222;
          text-align: justify;
          font-style: italic;
          position: relative;
        }

        .lead-text::first-letter {
          font-size: 3.5rem;
          float: left;
          margin-right: 0.5rem;
          margin-top: 0.1rem;
          line-height: 0.8;
          color: #000;
          font-weight: bold;
        }

        /* Ultra-Premium Story Columns */
        .story-columns {
          display: grid;
          grid-template-columns: 2.5fr 1fr;
          gap: 3rem;
          margin-bottom: 4rem;
          position: relative;
        }

        /* Center line removed for cleaner design */

        .story-column {
          position: relative;
          background: rgba(255,255,255,0.8);
          padding: 2rem;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }

        .story-column.left-column {
          margin-right: 1rem;
        }

        .story-column.right-column {
          margin-left: 1rem;
        }

        .story-column::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
          border-radius: 6px;
          pointer-events: none;
        }

        .column-content {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #222;
        }

        .column-content p {
          margin-bottom: 1.25rem;
          text-align: justify;
          hyphens: auto;
          font-family: 'Times New Roman', serif;
        }

        .column-content p:first-child {
          margin-top: 0;
        }

        /* Ultra-Premium Dynamic Image Grid System */
        .article-images {
          margin: 3rem 0;
          break-inside: avoid;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(248,249,250,0.4) 0%, rgba(233,236,239,0.3) 100%);
          border-radius: 12px;
          border: 2px solid rgba(0,0,0,0.06);
          position: relative;
        }

        .article-images::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
          border-radius: 10px;
          pointer-events: none;
        }

        .image-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
        }

        .image-row:last-child {
          margin-bottom: 0;
        }

        .image-item {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          box-shadow:
            0 8px 24px rgba(0,0,0,0.15),
            0 4px 12px rgba(0,0,0,0.1),
            0 0 0 1px rgba(255,255,255,0.1);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 2px solid rgba(0,0,0,0.08);
        }

        .image-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.1) 0%, transparent 30%, rgba(255,255,255,0.1) 70%, rgba(0,0,0,0.05) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .image-item:hover {
          transform: scale(1.05) rotate(1deg);
          box-shadow:
            0 20px 40px rgba(0,0,0,0.25),
            0 8px 16px rgba(0,0,0,0.15),
            0 0 0 2px rgba(255,255,255,0.2);
        }

        .image-item:hover::before {
          opacity: 1;
        }

        .image-item.small {
          flex: 1;
          aspect-ratio: 1;
        }

        .image-item.medium {
          flex: 1;
          aspect-ratio: 4/3;
        }

        .image-item.large {
          flex: 1;
          aspect-ratio: 16/9;
        }

        .grid-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.3s ease;
          display: block;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .image-item:hover .grid-image {
          transform: scale(1.1);
        }

        /* 5-Image Grid Layout */
        .image-grid-5 .image-row:first-child .image-item {
          aspect-ratio: 1;
        }

        .image-grid-5 .image-row:nth-child(2) .image-item {
          aspect-ratio: 4/3;
        }

        /* 4-Image Grid Layout */
        .image-grid-4 .image-row .image-item {
          aspect-ratio: 4/3;
        }

        /* 3-Image Grid Layout */
        .image-grid-3 .image-row:first-child .image-item {
          aspect-ratio: 16/9;
        }

        .image-grid-3 .image-row:nth-child(2) .image-item {
          aspect-ratio: 4/3;
        }

        /* 2-Image Grid Layout */
        .image-grid-2 .image-row .image-item {
          aspect-ratio: 4/3;
        }

        /* 1-Image Grid Layout */
        .image-grid-1 .image-row .image-item {
          aspect-ratio: 16/9;
        }

        /* Photo Alt Fallbacks for Grid */
        .photo-alt-fallback.small {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #dee2e6;
          font-size: 0.75rem;
          color: #666;
          text-align: center;
          padding: 0.5rem;
          font-style: italic;
        }

        .photo-alt-fallback.medium {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #dee2e6;
          font-size: 0.85rem;
          color: #666;
          text-align: center;
          padding: 0.75rem;
          font-style: italic;
        }

        .photo-alt-fallback.large {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #dee2e6;
          font-size: 1rem;
          color: #666;
          text-align: center;
          padding: 1rem;
          font-style: italic;
        }


        /* Inline Photo */
        .inline-photo {
          margin: 1.5rem 0;
          text-align: center;
          break-inside: avoid;
        }

        .inline-photo-image {
          max-width: 100%;
          height: auto;
          border: 1px solid #ccc;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .photo-caption.small {
          font-size: 0.85rem;
          font-style: italic;
          margin-top: 0.75rem;
          color: #555;
          font-weight: 500;
        }

        /* Ultra-Premium Sidebar Elements */
        .author-sidebar {
          background:
            linear-gradient(135deg, rgba(248,249,250,0.9) 0%, rgba(233,236,239,0.7) 50%, rgba(248,249,250,0.8) 100%),
            linear-gradient(45deg, transparent 30%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.02) 70%, transparent 70%);
          background-size: 100% 100%, 20px 20px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 2px solid rgba(0,0,0,0.08);
          border-radius: 12px;
          box-shadow:
            0 12px 32px rgba(0,0,0,0.12),
            0 4px 12px rgba(0,0,0,0.08),
            inset 0 1px 0 rgba(255,255,255,0.8);
          position: relative;
          overflow: hidden;
        }

        .author-sidebar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
          border-radius: 10px;
          pointer-events: none;
        }

        .sidebar-header {
          font-family: 'Arial Black', 'Arial', sans-serif;
          font-size: 0.9rem;
          font-weight: 900;
          background: linear-gradient(135deg, #000 0%, #333 100%);
          color: #fff;
          padding: 0.5rem 0.8rem;
          margin-bottom: 1.2rem;
          display: inline-block;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          box-shadow:
            4px 4px 8px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.2);
          border-radius: 4px;
          position: relative;
          z-index: 1;
        }

        .author-bio-content {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
          position: relative;
          z-index: 1;
        }

        .author-photo {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border: 3px solid #000;
          flex-shrink: 0;
          box-shadow:
            0 8px 20px rgba(0,0,0,0.2),
            0 4px 8px rgba(0,0,0,0.1),
            0 0 0 2px rgba(255,255,255,0.1);
          border-radius: 6px;
          transition: transform 0.3s ease;
        }

        .author-photo:hover {
          transform: scale(1.05);
        }

        .author-details {
          flex: 1;
        }

        .author-name-sidebar {
          font-weight: 900;
          font-size: 1.1rem;
          margin-bottom: 0.4rem;
          color: #000;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          font-family: 'Arial Black', sans-serif;
        }

        .author-title-sidebar {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 0.8rem;
          font-style: italic;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .author-description {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #333;
          font-family: 'Times New Roman', serif;
          font-style: italic;
        }


        /* Ultra-Premium Story Stats */
        .story-stats {
          background:
            linear-gradient(135deg, rgba(248,249,250,0.9) 0%, rgba(233,236,239,0.7) 50%, rgba(248,249,250,0.8) 100%),
            linear-gradient(45deg, transparent 30%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.02) 70%, transparent 70%);
          background-size: 100% 100%, 20px 20px;
          padding: 1.2rem;
          border: 2px solid rgba(0,0,0,0.08);
          border-radius: 8px;
          font-size: 0.9rem;
          box-shadow:
            0 8px 24px rgba(0,0,0,0.12),
            0 4px 12px rgba(0,0,0,0.08),
            inset 0 1px 0 rgba(255,255,255,0.8);
          position: relative;
          overflow: hidden;
        }

        .story-stats::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
          border-radius: 6px;
          pointer-events: none;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.6rem;
          padding: 0.4rem;
          background: rgba(255,255,255,0.6);
          border-radius: 6px;
          border: 1px solid rgba(0,0,0,0.05);
          position: relative;
          z-index: 1;
          transition: transform 0.2s ease;
        }

        .stat-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .stat-item:last-child {
          margin-bottom: 0;
        }

        .stat-label {
          font-weight: 900;
          color: #000;
          font-family: 'Arial Black', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.85rem;
        }

        .stat-value {
          color: #555;
          font-weight: 700;
          font-family: 'Arial', sans-serif;
          background: rgba(0,0,0,0.05);
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.9rem;
        }


        /* Enhanced Responsive Design */
        @media (max-width: 1200px) {
          .newspaper-container {
            padding: 3rem;
          }

          .story-columns {
            gap: 3rem;
          }

          .headline-text {
            font-size: 3.5rem;
          }
        }

        @media (max-width: 1024px) {
          .story-columns {
            grid-template-columns: 2.2fr 1fr;
            gap: 2.5rem;
          }

          .headline-text {
            font-size: 2.8rem;
          }

          .paper-title {
            font-size: 2.5rem;
          }

          .newspaper-container {
            padding: 2.5rem;
          }
        }

        @media (max-width: 768px) {
          .newspaper-masthead {
            padding: 1.5rem 2rem;
          }

          .newspaper-body {
            padding: 0 1.5rem;
          }

          .newspaper-container {
            padding: 2rem;
          }

          .story-columns {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .story-column.left-column {
            border-right: none;
            padding-right: 0;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 2rem;
            margin-bottom: 2rem;
          }

          .story-column.right-column {
            padding-left: 0;
            padding-top: 1rem;
          }

          .story-column::after {
            display: none;
          }

          .headline-text {
            font-size: 2.2rem;
            line-height: 1.1;
          }

          .subheadline-text {
            font-size: 1.3rem;
          }

          .masthead-content {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }

          .paper-title {
            font-size: 2.2rem;
          }

          .story-columns {
            gap: 1.5rem;
          }

          /* Responsive image grids */
          .image-row {
            flex-direction: column;
            gap: 0.75rem;
          }

          .image-item.small,
          .image-item.medium,
          .image-item.large {
            aspect-ratio: 16/9;
            width: 100%;
          }

          .lead-photo {
            padding: 1rem;
          }

          .photo-image {
            max-width: 100%;
            height: auto;
          }

          .author-sidebar {
            padding: 1.5rem;
          }

          .story-stats {
            padding: 1rem;
          }
        }

        @media (max-width: 640px) {
          .newspaper-masthead {
            padding: 1rem;
          }

          .newspaper-body {
            padding: 0 1rem;
          }

          .newspaper-container {
            padding: 1.5rem;
          }

          .headline-text {
            font-size: 1.9rem;
          }

          .story-byline {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 1rem;
          }

          .paper-title {
            font-size: 1.8rem;
            letter-spacing: 2px;
          }

          .lead-text::first-letter {
            font-size: 2.5rem;
          }

          .section-header {
            margin-bottom: 1rem;
          }

          .section-name {
            padding: 0.3rem 0.8rem;
            font-size: 0.9rem;
          }

          .lead-photo {
            padding: 0.75rem;
          }

          .photo-caption {
            font-size: 0.9rem;
            padding: 0.5rem 1rem;
          }

          .photo-credit {
            font-size: 0.8rem;
            padding: 0.3rem 0.75rem;
          }

          .story-column {
            padding: 1.5rem;
          }

          .author-sidebar {
            padding: 1rem;
          }

          .story-stats {
            padding: 0.75rem;
          }

          .stat-item {
            padding: 0.3rem;
          }

          .stat-label {
            font-size: 0.8rem;
          }

          .stat-value {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .newspaper-masthead {
            padding: 0.75rem;
          }

          .newspaper-container {
            padding: 1rem;
          }

          .headline-text {
            font-size: 1.6rem;
          }

          .subheadline-text {
            font-size: 1.1rem;
          }

          .paper-title {
            font-size: 1.5rem;
            letter-spacing: 1px;
          }

          .story-byline {
            padding: 0.75rem;
          }

          .byline-info {
            font-size: 1rem;
          }

          .author-name {
            font-size: 1.1rem;
          }

          .dateline {
            font-size: 0.9rem;
            padding: 0.3rem 0.75rem;
          }

          .lead-text::first-letter {
            font-size: 2rem;
          }

          .story-column {
            padding: 1rem;
          }

          .column-content p {
            font-size: 0.95rem;
            line-height: 1.6;
          }

          .author-sidebar {
            padding: 0.75rem;
          }

          .sidebar-header {
            font-size: 0.9rem;
            padding: 0.5rem 0.8rem;
          }

          .author-name-sidebar {
            font-size: 1.1rem;
          }

          .author-description {
            font-size: 0.9rem;
          }
        }


        /* Enhanced Print Styles */
        @media print {
          .newspaper-article {
            background: white;
          }

          .newspaper-masthead {
            border-bottom: 3px solid #000;
            box-shadow: none;
            break-inside: avoid;
          }

          .newspaper-container {
            box-shadow: none;
            padding: 0;
          }

          .story-columns {
            display: block;
          }

          .story-column {
            border-right: none;
            padding-right: 0;
            margin-bottom: 1.5rem;
            page-break-inside: avoid;
          }

          .photo-image {
            break-inside: avoid;
          }

          .author-sidebar,
          .story-stats {
            break-inside: avoid;
            border: 1px solid #000;
          }

          .article-images {
            break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
};

export default ArticleRenderer;
    
