import React from 'react';

const VideoHeader = ({ videoArticle, displayVideos, openGallery, getVideoAlt }) => {
  return (
    <div className="video-header">
      {/* Video article title */}
      <div className="video-title-section">
        <h1 className="video-main-title">{videoArticle.title}</h1>
        {videoArticle.subtitle && (
          <h2 className="video-subtitle">{videoArticle.subtitle}</h2>
        )}
      </div>

      {/* Video meta information */}
      <div className="video-meta-section">
        <div className="video-byline">
          <span className="by-label">By</span>
          <span className="author-name">{videoArticle.primaryAuthor?.name || 'Staff Writer'}</span>
          {videoArticle.primaryAuthor?.title && (
            <span className="author-title">, {videoArticle.primaryAuthor.title}</span>
          )}
        </div>
        <div className="video-dateline">
          {new Date(videoArticle.publishDate || videoArticle.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      </div>

      {/* Featured video */}
      {displayVideos && displayVideos[0] && (
        <div className="featured-video">
          <div className="video-container">
            <iframe
              src={displayVideos[0].url}
              title={displayVideos[0].title || videoArticle.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="featured-video-iframe"
              onClick={() => openGallery(0)}
            />
            {displayVideos[0].title && (
              <div className="video-caption">
                <h3>{displayVideos[0].title}</h3>
                {displayVideos[0].description && <p>{displayVideos[0].description}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video excerpt */}
      {videoArticle.excerpt && (
        <div className="video-excerpt">
          <p className="excerpt-text">{videoArticle.excerpt}</p>
        </div>
      )}
    </div>
  );
};

export default VideoHeader;