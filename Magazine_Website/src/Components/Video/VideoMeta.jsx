import React from 'react';

const VideoMeta = ({ videoArticle }) => {
  return (
    <div className="video-meta">
      {/* Video metadata section */}
      <div className="video-meta-content">
        <div className="meta-item">
          <span className="meta-label">Duration:</span>
          <span className="meta-value">{videoArticle.duration || '0:00'} min</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Views:</span>
          <span className="meta-value">{videoArticle.viewCount || 0}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Likes:</span>
          <span className="meta-value">{videoArticle.likeCount || 0}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Published:</span>
          <span className="meta-value">
            {new Date(videoArticle.publishDate || videoArticle.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoMeta;