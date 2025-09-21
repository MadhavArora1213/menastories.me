import React, { useState, useEffect, useCallback } from 'react';

const VideoGallery = ({
  videos = [],
  showMetadata = true,
  showNavigation = true,
  showThumbnails = true,
  autoPlay = false,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Extract YouTube video ID
  const getYouTubeVideoId = useCallback((url) => {
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
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  }, [videos.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  }, [videos.length]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && videos.length > 1) {
      const interval = setInterval(goToNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoPlay, videos.length, goToNext]);

  if (!videos || videos.length === 0) {
    return (
      <div className={`video-gallery ${className}`}>
        <div className="no-videos">
          <p>No videos available</p>
        </div>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];
  const youtubeVideoId = currentVideo?.url ? getYouTubeVideoId(currentVideo.url) : null;

  return (
    <div className={`video-gallery ${className}`}>
      {/* Main video display */}
      <div className="main-video-container">
        {youtubeVideoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&showinfo=0&modestbranding=1${isPlaying ? '&autoplay=1' : ''}`}
            title={currentVideo.displayName || currentVideo.title || 'Video'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="main-video-iframe"
          />
        ) : (
          <div className="video-placeholder">
            <span>🎥</span>
            <p>Video not available</p>
          </div>
        )}
      </div>

      {/* Video metadata */}
      {showMetadata && currentVideo && (
        <div className="video-metadata">
          <h3 className="video-title">{currentVideo.displayName || currentVideo.title || 'Untitled Video'}</h3>
          {currentVideo.caption && (
            <p className="video-caption">{currentVideo.caption}</p>
          )}
          {currentVideo.altText && (
            <p className="video-alt-text">{currentVideo.altText}</p>
          )}
          {currentVideo.createdAt && (
            <p className="video-date">
              {new Date(currentVideo.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Navigation controls */}
      {showNavigation && videos.length > 1 && (
        <div className="gallery-controls">
          <button
            onClick={goToPrev}
            className="nav-button prev-button"
            aria-label="Previous video"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="nav-button next-button"
            aria-label="Next video"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
      )}

      {/* Thumbnail navigation */}
      {showThumbnails && videos.length > 1 && (
        <div className="thumbnail-navigation">
          <div className="thumbnail-strip">
            {videos.map((video, index) => (
              <div
                key={video.id || index}
                className={`thumbnail-item ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              >
                <div className="thumbnail-video">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.displayName || video.title || `Video ${index + 1}`}
                      className="thumbnail-image"
                    />
                  ) : (
                    <div className="thumbnail-placeholder">
                      <span>🎥</span>
                    </div>
                  )}
                  {video.duration && (
                    <div className="thumbnail-duration">
                      {video.duration}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video counter */}
      <div className="video-counter">
        {currentIndex + 1} / {videos.length}
      </div>

      <style jsx>{`
        .video-gallery {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
        }

        .main-video-container {
          flex: 1;
          position: relative;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
        }

        .main-video-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .video-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #666;
          font-size: 4rem;
        }

        .video-metadata {
          padding: 1rem;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          border-radius: 0 0 8px 8px;
        }

        .video-title {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .video-caption {
          font-style: italic;
          margin-bottom: 0.25rem;
        }

        .video-alt-text {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .video-date {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .gallery-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
        }

        .nav-button {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .nav-button:hover {
          background: rgba(0, 0, 0, 0.9);
        }

        .thumbnail-navigation {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .thumbnail-strip {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .thumbnail-item {
          flex-shrink: 0;
          width: 120px;
          cursor: pointer;
          border-radius: 4px;
          overflow: hidden;
          opacity: 0.6;
          transition: opacity 0.3s ease;
        }

        .thumbnail-item.active {
          opacity: 1;
          border: 2px solid #007bff;
        }

        .thumbnail-item:hover {
          opacity: 0.8;
        }

        .thumbnail-video {
          position: relative;
          width: 100%;
          height: 68px;
          background: #000;
        }

        .thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #666;
          font-size: 1.5rem;
        }

        .thumbnail-duration {
          position: absolute;
          bottom: 4px;
          right: 4px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          font-size: 0.7rem;
          padding: 2px 4px;
          border-radius: 2px;
        }

        .video-counter {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .no-videos {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default VideoGallery;