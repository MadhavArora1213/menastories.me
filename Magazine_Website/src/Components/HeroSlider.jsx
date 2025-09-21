import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  const [heroStories, setHeroStories] = useState([]);

  // Dummy content for when database is empty
  const dummyHeroStories = [
    {
      id: 'dummy-1',
      title: 'Latest Tech Innovations Reshaping the Future',
      excerpt: 'Discover how cutting-edge technology is transforming industries and creating new opportunities for innovation across the globe.',
      category: 'Technology',
      author: 'Magazine Editorial Team',
      publishedAt: new Date().toISOString(),
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      slug: 'tech-innovations-future',
      trending: true
    },
    {
      id: 'dummy-2',
      title: 'Business Leaders Share Success Strategies',
      excerpt: 'Exclusive interviews with top entrepreneurs and business leaders about their journey to success and key lessons learned.',
      category: 'Business',
      author: 'Business Desk',
      publishedAt: new Date().toISOString(),
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      slug: 'business-leaders-success-strategies',
      trending: false
    }
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${base}/api/public/homepage`);
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('Unexpected response type');
        }
        const json = await res.json();
        const list = (json.heroSlider || []).map((a) => ({
          id: a.id,
          title: a.title,
          excerpt: a.excerpt || a.description || a.subtitle || 'Discover the latest insights and stories from our magazine.',
          category: a.category?.name || 'Featured',
          subcategory: '',
          author: a.primaryAuthor?.name || a.author?.name || 'Editorial Team',
          publishedAt: a.publishedAt || a.publishDate || a.createdAt,
          readTime: a.readTime || '5 min read',
          image: a.featuredImage || a.coverImage || '',
          slug: a.slug,
          trending: a.trending || false
        }));

        // Use real data if available, otherwise use dummy data as fallback
        if (list.length > 0) {
          // Add fallback images for articles without featured images
          const listWithImages = list.map(article => ({
            ...article,
            image: article.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
          }));
          setHeroStories(listWithImages);
        } else {
          setHeroStories(dummyHeroStories);
        }
      } catch (e) {
        console.error('HeroSlider fetch failed', e);
        // Try to fetch featured articles as fallback instead of dummy data
        try {
          const fallbackRes = await fetch(`${base}/api/articles?featured=true&status=published&limit=5`);
          if (fallbackRes.ok) {
            const fallbackJson = await fallbackRes.json();
            const fallbackList = (fallbackJson.articles || []).map((a) => ({
              id: a.id,
              title: a.title,
              excerpt: a.excerpt || a.description || a.subtitle || 'Discover the latest insights and stories from our magazine.',
              category: a.category?.name || 'Featured',
              subcategory: '',
              author: a.author?.name || a.primaryAuthor?.name || 'Editorial Team',
              publishedAt: a.publishedAt || a.publishDate || a.createdAt,
              readTime: a.readTime || '5 min read',
              image: a.featuredImage || a.coverImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
              slug: a.slug,
              trending: a.trending || false
            }));
            setHeroStories(fallbackList.length > 0 ? fallbackList : dummyHeroStories);
          } else {
            setHeroStories(dummyHeroStories);
          }
        } catch (fallbackError) {
          console.error('Fallback fetch also failed', fallbackError);
          setHeroStories(dummyHeroStories);
        }
      }
    };
    load();
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || heroStories.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroStories.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, heroStories.length]);


  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + heroStories.length) % heroStories.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % heroStories.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async (platform) => {
    const currentStory = heroStories[currentSlide] || heroStories[0];
    const url = `${window.location.origin}/article/${currentStory?.slug || 'featured-article'}`;
    const title = currentStory?.title || 'Featured Article';
    const description = currentStory?.excerpt || 'Discover the latest stories and insights from our magazine.';

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${title} - ${description}`)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          // Show a more modern toast notification instead of alert
          console.log('Link copied to clipboard!');
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = url;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          console.log('Link copied to clipboard!');
        }
        // Track copy share
        trackShare(platform, currentStory?.id);
        setShowShareModal(false);
        return;
      default:
        return;
    }

    if (shareUrl) {
      if (platform === 'email') {
        window.location.href = shareUrl;
      } else {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
      // Track the share
      trackShare(platform, currentStory?.id);
    }

    setShowShareModal(false);
  };

  const trackShare = async (platform, articleId) => {
    // Don't track shares for dummy data or invalid IDs
    if (!articleId || articleId.startsWith('dummy-') || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(articleId)) {
      console.log('Skipping share tracking for dummy/invalid article ID:', articleId);
      return;
    }

    try {
      const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${base}/api/public/articles/${articleId}/share-count`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: platform
        })
      });

      if (!response.ok) {
        throw new Error(`Share tracking failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Share tracked successfully:', result);
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  };

  // Show loading state while fetching data
  if (heroStories.length === 0) {
    return (
      <section className="relative h-[70vh] lg:h-[80vh] overflow-hidden bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-xl mb-2">Loading featured stories...</div>
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  const currentStory = heroStories[currentSlide] || heroStories[0];

  return (
    <section className="relative h-[95vh] sm:h-[75vh] md:h-[80vh] lg:h-[85vh] xl:h-[90vh] overflow-hidden bg-gray-900 mt-20 sm:mt-32 md:mt-40">
      {/* Background Slides */}
      <div className="relative w-full h-full">
        {heroStories.map((story, index) => (
          <div
            key={story.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="w-full h-full">
              {story.image ? (
                <picture>
                  {/* WebP format for modern browsers */}
                  <source
                    media="(min-width: 768px)"
                    srcSet={`${story.image}?w=1920&h=1080&fit=crop&fm=webp&q=80 1920w, ${story.image}?w=1280&h=720&fit=crop&fm=webp&q=80 1280w, ${story.image}?w=768&h=432&fit=crop&fm=webp&q=80 768w`}
                    sizes="(min-width: 768px) 100vw, 100vw"
                    type="image/webp"
                  />
                  <source
                    media="(max-width: 767px)"
                    srcSet={`${story.image}?w=768&h=1024&fit=crop&fm=webp&q=80 768w, ${story.image}?w=480&h=640&fit=crop&fm=webp&q=80 480w`}
                    sizes="100vw"
                    type="image/webp"
                  />
                  {/* Fallback JPEG */}
                  <source
                    media="(min-width: 768px)"
                    srcSet={`${story.image}?w=1920&h=1080&fit=crop&q=80 1920w, ${story.image}?w=1280&h=720&fit=crop&q=80 1280w, ${story.image}?w=768&h=432&fit=crop&q=80 768w`}
                    sizes="(min-width: 768px) 100vw, 100vw"
                  />
                  <img
                    src={`${story.image}?w=1920&h=1080&fit=crop&q=80`}
                    alt={story.title || 'Hero image'}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3))`
                    }}
                  />
                </picture>
              ) : (
                <div
                  className="w-full h-full bg-gradient-to-r from-gray-900 to-gray-800"
                  style={{
                    backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3))'
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center">
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full relative z-20">
          <div className="max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
            {/* Story Content */}
            <div className="text-white space-y-4 sm:space-y-5 md:space-y-6 drop-shadow-lg">
              {/* Category Badge */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                {currentStory?.category && (
                  <span
                    className="text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium"
                    style={{ backgroundColor: '#162048' }}
                  >
                    {currentStory.category}
                  </span>
                )}
                {currentStory?.trending && (
                  <span className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    TRENDING
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-3 sm:mb-4">
                {currentStory?.title || 'Featured Article'}
              </h1>

              {/* Excerpt - Truncated to 25 words */}
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 leading-relaxed mb-4 sm:mb-6 max-w-sm sm:max-w-2xl">
                {(() => {
                  const excerpt = currentStory?.excerpt || 'Discover the latest stories and insights from our magazine.';
                  const words = excerpt.split(' ');
                  return words.length > 25 ? words.slice(0, 25).join(' ') + '...' : excerpt;
                })()}
              </p>

              {/* Meta Information */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm text-gray-300 mb-4 sm:mb-6 md:mb-8">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>By {currentStory?.author || 'Editorial Team'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{currentStory?.publishedAt ? formatDate(currentStory.publishedAt) : formatDate(new Date())}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{currentStory?.readTime || '5 min read'}</span>
                </div>
              </div>

              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                <Link
                  to={`/article/${currentStory?.slug || 'featured-article'}`}
                  className="text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-lg font-medium transition-colors duration-200 text-center text-sm sm:text-base md:text-lg touch-manipulation min-h-[44px] flex items-center justify-center"
                  style={{ backgroundColor: '#162048' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0f1a3a'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#162048'}
                >
                  Read Full Story
                </Link>
                <div className="relative share-dropdown z-50">
                  <button
                    onClick={() => {
                      console.log('Share button clicked, current state:', showShareModal);
                      setShowShareModal(!showShareModal);
                    }}
                    className="relative border border-white text-white hover:bg-white hover:text-gray-900 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 sm:space-x-2 text-sm sm:text-base md:text-lg touch-manipulation min-h-[44px]"
                  >
                    <svg className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span>Share</span>
                    <svg className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 ${showShareModal ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Share Modal */}
                  {showShareModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
                      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg mx-4">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200">
                          <h3 className="text-base font-semibold text-gray-900">Share</h3>
                          <button
                            onClick={() => setShowShareModal(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Modal Content - Icon Grid */}
                        <div className="p-3 sm:p-4 md:p-6">
                          <div className="grid grid-cols-3 gap-3">
                            <button
                              onClick={() => handleShare('facebook')}
                              className="aspect-square text-blue-600 hover:text-blue-800 flex flex-col items-center justify-center transition-all duration-200 rounded-lg p-2 group hover:bg-blue-50"
                              title="Share on Facebook"
                            >
                              <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                            </button>

                            <button
                              onClick={() => handleShare('twitter')}
                              className="aspect-square text-black hover:text-gray-900 flex flex-col items-center justify-center transition-all duration-200 rounded-lg p-2 group hover:bg-gray-50"
                              title="Share on X (Twitter)"
                            >
                              <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                            </button>

                            <button
                              onClick={() => handleShare('linkedin')}
                              className="aspect-square text-blue-700 hover:text-blue-800 flex flex-col items-center justify-center transition-all duration-200 rounded-lg p-2 group hover:bg-blue-50"
                              title="Share on LinkedIn"
                            >
                              <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </button>

                            <button
                              onClick={() => handleShare('whatsapp')}
                              className="aspect-square text-green-600 hover:text-green-800 flex flex-col items-center justify-center transition-all duration-200 rounded-lg p-2 group hover:bg-green-50"
                              title="Share on WhatsApp"
                            >
                              <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
                              </svg>
                            </button>

                            <button
                              onClick={() => handleShare('email')}
                              className="aspect-square text-gray-600 hover:text-gray-900 flex flex-col items-center justify-center transition-all duration-200 rounded-lg p-2 group hover:bg-gray-50"
                              title="Share via Email"
                            >
                              <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </button>

                            <button
                              onClick={() => handleShare('copy')}
                              className="aspect-square text-gray-600 hover:text-gray-900 flex flex-col items-center justify-center transition-all duration-200 rounded-lg p-2 group hover:bg-gray-50"
                              title="Copy Link"
                            >
                              <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-2 sm:left-3 md:left-4 lg:left-6 flex items-center z-30">
        <button
          onClick={goToPrevious}
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white hover:text-gray-200 flex items-center justify-center transition-all duration-200 touch-manipulation"
          aria-label="Previous slide"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="absolute inset-y-0 right-2 sm:right-3 md:right-4 lg:right-6 flex items-center z-30">
        <button
          onClick={goToNext}
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white hover:text-gray-200 flex items-center justify-center transition-all duration-200 touch-manipulation"
          aria-label="Next slide"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex space-x-1.5 sm:space-x-2">
          {heroStories.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-200 touch-manipulation ${
                index === currentSlide
                  ? 'bg-white shadow-lg'
                  : 'bg-white bg-opacity-40 hover:bg-opacity-70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-black bg-opacity-30 z-20">
        <div
          className="h-full transition-all duration-1000 ease-linear"
          style={{
            width: isAutoPlaying ? '100%' : `${((currentSlide + 1) / heroStories.length) * 100}%`,
            backgroundColor: '#162048'
          }}
        />
      </div>

      {/* Side Story Preview */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 hidden lg:block xl:block z-20">
        <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 max-w-xs sm:max-w-sm">
          <h3 className="text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2">Coming Up Next</h3>
          {heroStories.length > 1 && heroStories[(currentSlide + 1) % heroStories.length] && (
            <div className="text-white">
              <div className="text-xs text-blue-400 mb-1">
                {heroStories[(currentSlide + 1) % heroStories.length]?.category || 'Featured'}
              </div>
              <h4 className="text-xs sm:text-sm font-medium line-clamp-2">
                {heroStories[(currentSlide + 1) % heroStories.length]?.title || 'Next Article'}
              </h4>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;