import React from 'react';

const VideoContent = ({ videoArticle, contentParts, displayVideos, openGallery, getVideoAlt }) => {
  return (
    <div className="video-content">
      {/* Main video content sections */}
      <div className="content-section">
        <div dangerouslySetInnerHTML={{
          __html: contentParts[0].join('\n\n')
        }} />
      </div>

      {/* Video gallery section */}
      {displayVideos && displayVideos.length > 0 && (
        <div className="video-gallery-section">
          <div className="video-grid">
            {displayVideos.map((video, index) => (
              <div key={index} className="video-item">
                <div className="video-wrapper">
                  <iframe
                    src={video.url}
                    title={video.title || `Video ${index + 1}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="video-iframe"
                    onClick={() => openGallery(index)}
                  />
                  {video.title && (
                    <div className="video-caption">
                      <h4>{video.title}</h4>
                      {video.description && <p>{video.description}</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional content sections */}
      {contentParts.slice(1).map((part, index) => (
        <div key={index + 1} className="content-section">
          <div dangerouslySetInnerHTML={{
            __html: part.join('\n\n')
          }} />
        </div>
      ))}
    </div>
  );
};

export default VideoContent;