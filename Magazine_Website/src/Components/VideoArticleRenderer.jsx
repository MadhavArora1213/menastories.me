import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import videoArticleService from '../services/videoArticleService';
import { toast } from 'react-toastify';
import StructuredData from './StructuredData';

const VideoContent = React.lazy(() => import('./Video/VideoContent'));
const VideoHeader = React.lazy(() => import('./Video/VideoHeader'));
const VideoMeta = React.lazy(() => import('./Video/VideoMeta'));
const RelatedVideos = React.lazy(() => import('./Video/RelatedVideos'));
const CommentSection = React.lazy(() => import('./Article/CommentSection'));
const VideoGallery = React.lazy(() => import('./Media/VideoGallery'));

const VideoArticleRenderer = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const [videoArticle, setVideoArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryVideoList, setGalleryVideoList] = useState([]);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  useEffect(() => {
    fetchVideoArticle();
  }, [id, slug]);

  // Enhanced image fetching with loading states
  const fetchImageWithState = async (imageUrl, imageIndex) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      setImageLoadingStates(prev => ({ ...prev, [imageIndex]: true }));

      img.onload = () => {
        setImageLoadingStates(prev => ({ ...prev, [imageIndex]: false }));
        resolve(imageUrl);
      };

      img.onerror = () => {
        setImageLoadingStates(prev => ({ ...prev, [imageIndex]: false }));
        console.warn(`Failed to load image: ${imageUrl}`);
        reject(new Error(`Failed to load image: ${imageUrl}`));
      };

      img.src = imageUrl;
    });
  };

  const fetchVideoArticle = async () => {
    try {
      setLoading(true);
      setError(null);

      const identifier = id || slug;
      const response = await videoArticleService.getVideoArticle(identifier);

      if (response.success) {
        setVideoArticle(response.data);

        if (response.data.tags && response.data.tags.length > 0) {
          fetchSuggestedVideos(response.data.tags, response.data.id);
        } else if (response.data.category_id) {
          fetchSuggestedVideos([], response.data.id);
        }

        updateMetaTags(response.data);

        // Preload images for better performance
        if (finalDisplayVideos.length > 0) {
          const imageUrls = finalDisplayVideos.map(video => {
            if (video.startsWith('http://') || video.startsWith('https://')) {
              return video;
            }
            return constructVideoUrl(video);
          }).filter(Boolean);
          preloadImages(imageUrls);
        }
      } else {
        throw new Error(response.message || 'Video article not found');
      }
    } catch (err) {
      console.error('Error fetching video article:', err);
      setError(err.message || 'Video article not found');

      if (err.response?.status === 404) {
        toast.error('Video article not found');
        navigate('/404');
      } else {
        toast.error('Failed to load video article');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedVideos = async (tags, currentVideoId) => {
    try {
      if (!tags || tags.length === 0) {
        const response = await videoArticleService.getAllVideoArticles({
          status: 'published',
          limit: 10
        });

        if (response.success) {
          const suggested = response.data.videoArticles
            .filter(vid => vid.id !== parseInt(currentVideoId))
            .slice(0, 8);
          setRelatedVideos(suggested);
        }
        return;
      }

      const response = await videoArticleService.getAllVideoArticles({
        status: 'published',
        limit: 50
      });

      if (response.success) {
        const suggested = response.data.videoArticles
          .filter(vid => vid.id !== parseInt(currentVideoId))
          .filter(vid => {
            if (!vid.tags || vid.tags.length === 0) return false;
            return vid.tags.some(tag => tags.includes(tag));
          })
          .slice(0, 8);

        if (suggested.length < 8) {
          const remainingLimit = 8 - suggested.length;
          const suggestedIds = suggested.map(s => s.id);

          const additionalVideos = response.data.videoArticles
            .filter(vid => vid.id !== parseInt(currentVideoId) && !suggestedIds.includes(vid.id))
            .slice(0, remainingLimit);

          suggested.push(...additionalVideos);
        }

        setRelatedVideos(suggested);
      }
    } catch (err) {
      console.warn('Error fetching suggested videos:', err);
    }
  };

  const updateMetaTags = (videoData) => {
  };

  const openGallery = (startIndex = 0) => {
    const videos = displayVideos.map((videoUrl, index) => ({
      id: `video-article-video-${index}`,
      url: videoUrl,
      type: 'video',
      displayName: `Video Article Video ${index + 1}`,
      altText: getVideoAlt(index),
      caption: index === 0 ? 'Featured Video' : `Gallery Video ${index}`,
      thumbnailUrl: videoArticle?.thumbnailUrl || videoUrl,
      format: 'mp4',
      size: 0,
      createdAt: videoArticle?.createdAt || new Date().toISOString()
    }));

    setGalleryVideoList(videos);
    setCurrentGalleryIndex(startIndex);
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
    setGalleryVideoList([]);
    setCurrentGalleryIndex(0);
  };

  const getYouTubeVideoId = (url) => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  let galleryVideos = [];
  if (videoArticle?.gallery && typeof videoArticle.gallery === 'string' && videoArticle.gallery.trim() !== '') {
    try {
      galleryVideos = JSON.parse(videoArticle.gallery);
    } catch (e) {
      console.warn('Failed to parse video article gallery JSON:', e);
      galleryVideos = [];
    }
  }

  const constructVideoUrl = (videoPath) => {
    if (!videoPath) return null;

    // Handle YouTube URLs
    if (videoPath.includes('youtube.com') || videoPath.includes('youtu.be')) {
      return videoPath;
    }

    // Handle direct HTTP/HTTPS URLs
    if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
      return videoPath;
    }

    // Handle relative paths starting with /
    if (videoPath.startsWith('/')) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      return `${baseUrl}${videoPath}`;
    }

    // Handle filename-only paths
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${baseUrl}/videos/${videoPath}`;
  };

  // Enhanced image preloader
  const preloadImages = async (imageUrls) => {
    const preloadPromises = imageUrls.map((url, index) =>
      fetchImageWithState(url, index).catch(() => null)
    );

    try {
      await Promise.allSettled(preloadPromises);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  };

  // Handle image errors with fallback
  const handleImageError = (e, fallbackType = 'video') => {
    const fallbackIcons = {
      video: '🎥',
      image: '🖼️',
      default: '📷'
    };

    const icon = fallbackIcons[fallbackType] || fallbackIcons.default;
    const parent = e.target.parentNode;

    // Hide the broken image
    e.target.style.display = 'none';

    // Create and show fallback
    let fallback = parent.querySelector('.image-fallback');
    if (!fallback) {
      fallback = document.createElement('div');
      fallback.className = 'image-fallback flex items-center justify-center bg-gray-100 text-gray-500 text-4xl';
      fallback.textContent = icon;
      parent.appendChild(fallback);
    } else {
      fallback.style.display = 'flex';
    }
  };

  const limitedGalleryVideos = galleryVideos.slice(0, 3).map(vid => constructVideoUrl(vid)).filter(Boolean);
  const displayVideos = [...limitedGalleryVideos];

  if (videoArticle?.youtubeUrl) {
    const featuredUrl = videoArticle.youtubeUrl;
    if (featuredUrl && !displayVideos.includes(featuredUrl)) {
      displayVideos.unshift(featuredUrl);
    }
  }

  const finalDisplayVideos = displayVideos.slice(0, 4);

  const getVideoAlt = (index) => {
    if (index === 0 && videoArticle?.videoAlt) {
      return videoArticle.videoAlt;
    }
    if (videoArticle?.videoCaption) {
      return videoArticle.videoCaption;
    }
    return `${videoArticle?.title || 'Video Article'} - Video ${index + 1}`;
  };

  const contentSections = videoArticle?.content ? videoArticle.content.split('\n\n') : [];

  const totalSections = contentSections.length;
  const sectionSize = Math.max(1, Math.floor(totalSections / 4));

  const contentPart1 = contentSections.slice(0, sectionSize);
  const contentPart2 = contentSections.slice(sectionSize, sectionSize * 2);
  const contentPart3 = contentSections.slice(sectionSize * 2, sectionSize * 3);
  const contentPart4 = contentSections.slice(sectionSize * 3);

  const LoadingSkeleton = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
        <div className="h-64 bg-gray-300 rounded mb-8"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );

  // Image loading spinner component
  const ImageLoadingSpinner = ({ size = 'medium' }) => {
    const sizeClasses = {
      small: 'h-4 w-4',
      medium: 'h-8 w-8',
      large: 'h-12 w-12'
    };

    return (
      <div className="flex items-center justify-center bg-gray-200 rounded">
        <div className={`animate-spin border-2 border-gray-300 border-t-blue-500 rounded-full ${sizeClasses[size]}`}></div>
      </div>
    );
  };

  const ErrorDisplay = ({ message }) => (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-red-800 mb-4">Video Article Not Found</h2>
        <p className="text-red-600 mb-6">{message}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !videoArticle) {
    return <ErrorDisplay message={error || 'Video article not found'} />;
  }

  const structuredData = videoArticle.structuredData ? JSON.stringify(videoArticle.structuredData) : null;

  const youtubeVideoId = videoArticle.youtubeUrl ? getYouTubeVideoId(videoArticle.youtubeUrl) : null;

  return (
    <>
      <Helmet>
        <title>{videoArticle.meta_title || videoArticle.title}</title>
        <meta name="description" content={videoArticle.meta_description || videoArticle.excerpt} />
        <meta name="keywords" content={videoArticle.tags?.join(', ')} />
        <meta property="og:title" content={videoArticle.title} />
        <meta property="og:description" content={videoArticle.excerpt || videoArticle.description} />
        <meta property="og:image" content={videoArticle.thumbnailUrl || videoArticle.featured_image} />
        <meta property="og:type" content="video.other" />
        <meta property="og:video" content={videoArticle.youtubeUrl} />
        <meta property="og:video:type" content="text/html" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        <meta property="video:duration" content={videoArticle.duration || "0"} />
        <meta property="article:published_time" content={videoArticle.publish_date || videoArticle.createdAt} />
        <meta property="article:author" content={videoArticle.primaryAuthor?.name} />
        <meta property="article:section" content={videoArticle.category?.name} />
        <meta property="article:tag" content={videoArticle.tags?.join(', ')} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <StructuredData
        type="video"
        data={{
          title: videoArticle.title,
          excerpt: videoArticle.excerpt,
          description: videoArticle.description || videoArticle.excerpt,
          thumbnailUrl: videoArticle.thumbnailUrl || videoArticle.featured_image,
          publishedAt: videoArticle.publish_date || videoArticle.createdAt,
          modifiedAt: videoArticle.updatedAt,
          author: videoArticle.primaryAuthor || videoArticle.author,
          category: videoArticle.category,
          tags: videoArticle.tags,
          slug: videoArticle.slug,
          youtubeUrl: videoArticle.youtubeUrl,
          duration: videoArticle.duration
        }}
      />

      <article className="video-article" style={{marginTop: '10rem'}}>
        <main className="video-body">
          <div className="video-container">
            <section className="above-the-fold">
              <div className="section-header">
                <div className="section-name">{videoArticle.category?.name?.toUpperCase() || 'VIDEO'}</div>
                <div className="section-line"></div>
              </div>

              <div className="main-headline">
                <h1 className="headline-text">{videoArticle.title}</h1>
                {videoArticle.subtitle && (
                  <h2 className="subheadline-text">{videoArticle.subtitle}</h2>
                )}
              </div>

              <div className="story-byline">
                <div className="byline-info">
                  <span className="by-label">By</span>
                  <span className="author-name">{videoArticle.primaryAuthor?.name || 'Staff Reporter'}</span>
                  {videoArticle.primaryAuthor?.title && (
                    <span className="author-title">, {videoArticle.primaryAuthor.title}</span>
                  )}
                </div>
                <div className="dateline">
                  {new Date(videoArticle.publish_date || videoArticle.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {youtubeVideoId && (
                <div className="main-video-player">
                  <div className="video-wrapper">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&showinfo=0&modestbranding=1`}
                      title={videoArticle.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="main-video-iframe"
                    ></iframe>
                  </div>
                  <div className="video-caption">
                    {videoArticle.videoCaption || 'Featured video content'}
                  </div>
                  <div className="video-credit">
                    Video by {videoArticle.primaryAuthor?.name || 'Staff Videographer'}
                  </div>
                </div>
              )}

              {videoArticle.excerpt && (
                <div className="lead-paragraph">
                  <p className="lead-text">{videoArticle.excerpt}</p>
                </div>
              )}
            </section>

            <section className="story-columns">
              <div className="story-column left-column">
                <div className="column-content">
                  <div dangerouslySetInnerHTML={{
                    __html: contentPart1.join('\n\n')
                  }} />

                  {finalDisplayVideos.length >= 2 && (
                    <div className="article-videos">
                      {finalDisplayVideos.length === 5 && (
                        <div className="video-grid-5">
                          <div className="video-row">
                            <div className="video-item small">
                              <div className="video-wrapper">
                                <iframe
                                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(finalDisplayVideos[1])}?rel=0&showinfo=0&modestbranding=1`}
                                  title={getVideoAlt(1)}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="grid-video"
                                  onClick={() => openGallery(1)}
                                ></iframe>
                              </div>
                            </div>
                            <div className="video-item small">
                              <div className="video-wrapper">
                                <iframe
                                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(finalDisplayVideos[2])}?rel=0&showinfo=0&modestbranding=1`}
                                  title={getVideoAlt(2)}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="grid-video"
                                  onClick={() => openGallery(2)}
                                ></iframe>
                              </div>
                            </div>
                          </div>
                          <div className="video-row">
                            <div className="video-item medium">
                              <div className="video-wrapper">
                                <iframe
                                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(finalDisplayVideos[3])}?rel=0&showinfo=0&modestbranding=1`}
                                  title={getVideoAlt(3)}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="grid-video"
                                  onClick={() => openGallery(3)}
                                ></iframe>
                              </div>
                            </div>
                            <div className="video-item medium">
                              <div className="video-wrapper">
                                <iframe
                                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(finalDisplayVideos[4])}?rel=0&showinfo=0&modestbranding=1`}
                                  title={getVideoAlt(4)}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="grid-video"
                                  onClick={() => openGallery(4)}
                                ></iframe>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {finalDisplayVideos.length === 4 && (
                        <div className="video-grid-4">
                          <div className="video-row">
                            <div className="video-item medium">
                              <div className="video-wrapper">
                                <iframe
                                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(finalDisplayVideos[1])}?rel=0&showinfo=0&modestbranding=1`}
                                  title={getVideoAlt(1)}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="grid-video"
                                  onClick={() => openGallery(1)}
                                ></iframe>
                              </div>
                            </div>
                            <div className="video-item medium">
                              <div className="video-wrapper">
                                <iframe
                                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(finalDisplayVideos[2])}?rel=0&showinfo=0&modestbranding=1`}
                                  title={getVideoAlt(2)}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="grid-video"
                                  onClick={() => openGallery(2)}
                                ></iframe>
                              </div>
                            </div>
                          </div>
                          <div className="video-row">
                            <div className="video-item medium">
                              <div className="video-wrapper">
                                <iframe
                                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(finalDisplayVideos[3])}?rel=0&showinfo=0&modestbranding=1`}
                                  title={getVideoAlt(3)}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="grid-video"
                                  onClick={() => openGallery(3)}
                                ></iframe>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {finalDisplayVideos.length === 3 && (
                        <div className="video-grid-3">
                          <div className="video-row">
                            <div className="video-item large">
                              <div className="video-wrapper">
                                <iframe
                                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(finalDisplayVideos[1])}?rel=0&showinfo=0&modestbranding=1`}
                                  title={getVideoAlt(1)}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="grid-video"
                                  onClick={() => openGallery(1)}
                                ></iframe>
                              </div>
                            </div>
                          </div>
                          <div className="video-row">
                            <div className="video-item small">
                              <div className="video-wrapper">
                                <iframe
                                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(finalDisplayVideos[2])}?rel=0&showinfo=0&modestbranding=1`}
                                  title={getVideoAlt(2)}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="grid-video"
                                  onClick={() => openGallery(2)}
                                ></iframe>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {finalDisplayVideos.length === 2 && (
                        <div className="video-grid-2">
                          <div className="video-row">
                            <div className="video-item medium">
                              <div className="video-wrapper">
                                <iframe
                                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(finalDisplayVideos[1])}?rel=0&showinfo=0&modestbranding=1`}
                                  title={getVideoAlt(1)}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="grid-video"
                                  onClick={() => openGallery(1)}
                                ></iframe>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {finalDisplayVideos.length === 1 && (
                        <div className="video-grid-1">
                          <div className="video-row">
                            <div className="video-item large">
                              <div className="video-wrapper">
                                <iframe
                                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(finalDisplayVideos[0])}?rel=0&showinfo=0&modestbranding=1`}
                                  title={getVideoAlt(0)}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="grid-video"
                                  onClick={() => openGallery(0)}
                                ></iframe>
                              </div>
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

              <div className="story-column right-column">
                <div className="column-content">
                  <div dangerouslySetInnerHTML={{
                    __html: contentPart3.join('\n\n')
                  }} />

                  <div className="author-sidebar">
                    <h3 className="sidebar-header">ABOUT THE VIDEOGRAPHER</h3>
                    <div className="author-bio-content">
                      {videoArticle.primaryAuthor?.profile_image && (
                        <img
                          src={videoArticle.primaryAuthor.profile_image}
                          alt={videoArticle.primaryAuthor.name}
                          className="author-photo"
                        />
                      )}
                      <div className="author-details">
                        <div className="author-name-sidebar">{videoArticle.primaryAuthor?.name}</div>
                        {videoArticle.primaryAuthor?.title && (
                          <div className="author-title-sidebar">{videoArticle.primaryAuthor.title}</div>
                        )}
                        <div className="author-description">
                          {videoArticle.author_bio_override || videoArticle.primaryAuthor?.bio || 'Staff videographer covering current events and video journalism.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="story-stats">
                    <div className="stat-item">
                      <span className="stat-label">Watch Time:</span>
                      <span className="stat-value">{videoArticle.duration || '0:00'} min</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Views:</span>
                      <span className="stat-value">{videoArticle.viewCount || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Likes:</span>
                      <span className="stat-value">{videoArticle.likeCount || 0}</span>
                    </div>
                  </div>

                  <div dangerouslySetInnerHTML={{
                    __html: contentPart4.join('\n\n')
                  }} />
                </div>
              </div>
            </section>
          </div>
        </main>
      </article>

      {/* Comments Section */}
      {/* <section className="py-16 px-8 md:px-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<div className="text-center py-8">Loading comments...</div>}>
            <CommentSection
              articleId={videoArticle.id}
              articleSlug={videoArticle.slug}
              allowComments={videoArticle.allow_comments !== false}
              contentType="video"
            />
          </Suspense>
        </div>
      </section> */}

      {/* Video Tags Section */}
      {/* {videoArticle.tags && videoArticle.tags.length > 0 && (
        <section className="py-16 px-8 md:px-16" style={{backgroundColor: '#f8fafc'}}>
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-8 uppercase tracking-wide text-sm">Related Topics</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {videoArticle.tags.map((tag, index) => (
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
      )} */}

      {/* Suggested Videos Section */}
      {relatedVideos && relatedVideos.length > 0 && (
        <section className="py-16 px-8 md:px-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-[#162048] mb-4">Suggested Videos</h3>
              <p className="text-gray-600 text-lg">Videos you might also enjoy watching</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedVideos.map((suggestedVideo) => (
                <article
                  key={suggestedVideo.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer group border border-gray-100 hover:border-[#162048]/20"
                  onClick={() => navigate(`/videos/${suggestedVideo.slug}`)}
                >
                  {/* Video Thumbnail */}
                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {suggestedVideo.youtubeUrl ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(suggestedVideo.youtubeUrl)}?rel=0&showinfo=0&modestbranding=1`}
                        title={suggestedVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      ></iframe>
                    ) : null}
                    {/* Fallback when no video or error */}
                    {(!suggestedVideo.youtubeUrl) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#e3e7f7] to-[#162048]">
                        <div className="text-center text-[#162048]">
                          <span className="text-5xl opacity-80">🎥</span>
                          <div className="text-sm font-semibold mt-3 opacity-90">Video Article</div>
                        </div>
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {/* Category badge */}
                    <div className="absolute top-3 left-3 bg-[#162048] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                      {suggestedVideo.category?.name || 'Video'}
                    </div>
                    {/* Duration badge */}
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white text-xs font-semibold px-2 py-1 rounded">
                      {suggestedVideo.duration || '0:00'}
                    </div>
                  </div>

                  {/* Video Content */}
                  <div className="p-5">
                    <h4 className="font-bold text-[#162048] text-lg mb-3 line-clamp-2 group-hover:text-[#0f1419] transition-colors duration-300 leading-tight">
                      {suggestedVideo.title}
                    </h4>

                    {suggestedVideo.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {suggestedVideo.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span className="font-medium text-[#162048]">{suggestedVideo.primaryAuthor?.name || 'Staff Videographer'}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded-full">{new Date(suggestedVideo.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Tags */}
                    {suggestedVideo.tags && suggestedVideo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {suggestedVideo.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-[#162048] text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-[#0f1419] transition-colors duration-200"
                          >
                            #{tag}
                          </span>
                        ))}
                        {suggestedVideo.tags.length > 3 && (
                          <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                            +{suggestedVideo.tags.length - 3}
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

      {/* Video Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative w-full h-full max-w-7xl max-h-screen p-4">
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 z-60 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
              aria-label="Close gallery"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>}>
              <VideoGallery
                videos={galleryVideoList}
                showMetadata={true}
                showNavigation={true}
                showThumbnails={true}
                autoPlay={false}
                className="w-full h-full"
              />
            </Suspense>
          </div>
        </div>
      )}

      <style>{`
        /* Ultra-Premium Video Article Styling */
        .video-article {
          font-family: 'Times New Roman', 'Georgia', serif;
          background: linear-gradient(135deg, #fafbfc 0%, #f1f3f4 50%, #e8eaed 100%);
          color: #1a1a1a;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          position: relative;
        }

        .video-article::before {
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

        /* Ultra-Premium Video Body */
        .video-body {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 2.5rem;
          position: relative;
        }

        .video-container {
          background:
            linear-gradient(135deg, #ffffff 0%, #fafbfc 25%, #ffffff 50%, #fafbfc 75%, #ffffff 100%),
            linear-gradient(45deg, transparent 40%, rgba(0,0,0,0.01) 40%, rgba(0,0,0,0.01) 60%, transparent 60%);
          background-size: 100% 100%, 30px 30px;
          box-shadow:
            0 20px 60px rgba(0,0,0,0.1),
            0 8px 32px rgba(0,0,0,0.08),
            0 0 0 1px rgba(255,255,255,0.05),
            inset 0 1px 0 rgba(255,255,255,0.8);
          padding: 4rem;
          border-radius: 8px;
          position: relative;
          border: 1px solid rgba(0,0,0,0.08);
        }

        .video-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="premium-video-texture" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="transparent"/><circle cx="25" cy="25" r="0.8" fill="%23000000" opacity="0.03"/><circle cx="75" cy="75" r="0.5" fill="%23000000" opacity="0.02"/><circle cx="50" cy="10" r="0.6" fill="%23000000" opacity="0.025"/><circle cx="10" cy="50" r="0.4" fill="%23000000" opacity="0.02"/><circle cx="90" cy="30" r="0.7" fill="%23000000" opacity="0.028"/></pattern></defs><rect width="100" height="100" fill="url(%23premium-video-texture)"/></svg>'),
            linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
          pointer-events: none;
          border-radius: 8px;
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

        /* Ultra-Premium Main Video Player */
        .main-video-player {
          margin: 3rem 0 3rem 0;
          text-align: center;
          position: relative;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(248,249,250,0.3) 0%, rgba(233,236,239,0.2) 100%);
          border-radius: 12px;
          border: 2px solid rgba(0,0,0,0.08);
        }

        .video-wrapper {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          box-shadow:
            0 20px 40px rgba(0,0,0,0.2),
            0 8px 16px rgba(0,0,0,0.1),
            0 0 0 1px rgba(255,255,255,0.1);
        }

        .main-video-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        .video-caption {
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

        .video-credit {
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

        /* Ultra-Premium Dynamic Video Grid System */
        .article-videos {
          margin: 3rem 0;
          break-inside: avoid;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(248,249,250,0.4) 0%, rgba(233,236,239,0.3) 100%);
          border-radius: 12px;
          border: 2px solid rgba(0,0,0,0.06);
          position: relative;
        }

        .article-videos::before {
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

        .video-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
        }

        .video-row:last-child {
          margin-bottom: 0;
        }

        .video-item {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          box-shadow:
            0 8px 24px rgba(0,0,0,0.15),
            0 4px 12px rgba(0,0,0,0.1),
            0 0 0 1px rgba(255,255,255,0.1);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 2px solid rgba(0,0,0,0.08);
          cursor: pointer;
        }

        .video-item::before {
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

        .video-item:hover {
          transform: scale(1.05) rotate(1deg);
          box-shadow:
            0 20px 40px rgba(0,0,0,0.25),
            0 8px 16px rgba(0,0,0,0.15),
            0 0 0 2px rgba(255,255,255,0.2);
        }

        .video-item:hover::before {
          opacity: 1;
        }

        .video-item.small {
          flex: 1;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
        }

        .video-item.medium {
          flex: 1;
          padding-bottom: 75%; /* 4:3 aspect ratio */
        }

        .video-item.large {
          flex: 1;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
        }

        .grid-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        /* Video Grid Layouts */
        .video-grid-5 .video-row:first-child .video-item {
          padding-bottom: 56.25%;
        }

        .video-grid-5 .video-row:nth-child(2) .video-item {
          padding-bottom: 75%;
        }

        .video-grid-4 .video-row .video-item {
          padding-bottom: 75%;
        }

        .video-grid-3 .video-row:first-child .video-item {
          padding-bottom: 56.25%;
        }

        .video-grid-3 .video-row:nth-child(2) .video-item {
          padding-bottom: 75%;
        }

        .video-grid-2 .video-row .video-item {
          padding-bottom: 75%;
        }

        .video-grid-1 .video-row .video-item {
          padding-bottom: 56.25%;
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

        /* Ultra-Premium Video Stats */
        .story-stats {
          background:
            linear-gradient(135deg, rgba(248,249,250,0.9) 0%, rgba(233,236,239,0.7) 100%),
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
          .video-container {
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

          .video-container {
            padding: 2.5rem;
          }
        }

        @media (max-width: 768px) {
          .video-container {
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

          .story-columns {
            gap: 1.5rem;
          }

          /* Responsive video grids */
          .video-row {
            flex-direction: column;
            gap: 0.75rem;
          }

          .video-item.small,
          .video-item.medium,
          .video-item.large {
            padding-bottom: 56.25%;
            width: 100%;
          }

          .main-video-player {
            padding: 1rem;
          }

          .author-sidebar {
            padding: 1.5rem;
          }

          .story-stats {
            padding: 1rem;
          }
        }

        @media (max-width: 640px) {
          .video-container {
            padding: 1.5rem;
          }

          .headline-text {
            font-size: 1.9rem;
          }

          .subheadline-text {
            font-size: 1.1rem;
          }

          .story-byline {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 1rem;
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

          .main-video-player {
            padding: 0.75rem;
          }

          .video-caption {
            font-size: 0.9rem;
            padding: 0.5rem 1rem;
          }

          .video-credit {
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
          .video-container {
            padding: 1rem;
          }

          .headline-text {
            font-size: 1.6rem;
          }

          .subheadline-text {
            font-size: 1.1rem;
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
          .video-article {
            background: white;
          }

          .video-container {
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

          .main-video-iframe {
            break-inside: avoid;
          }

          .author-sidebar,
          .story-stats {
            break-inside: avoid;
            border: 1px solid #000;
          }

          .article-videos {
            break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
};

export default VideoArticleRenderer;