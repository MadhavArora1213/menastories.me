import React from 'react';
import { useNavigate } from 'react-router-dom';

const RelatedVideos = ({ videos, getYouTubeVideoId }) => {
  const navigate = useNavigate();

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="related-videos">
      <h3 className="related-videos-title">Related Videos</h3>
      <div className="related-videos-grid">
        {videos.slice(0, 4).map((video) => (
          <div
            key={video.id}
            className="related-video-item"
            onClick={() => navigate(`/videos/${video.slug}`)}
          >
            <div className="related-video-thumbnail">
              {video.youtubeUrl ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(video.youtubeUrl)}?rel=0&showinfo=0&modestbranding=1`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="related-video-iframe"
                />
              ) : (
                <div className="related-video-placeholder">
                  <span>🎥</span>
                  <p>Video</p>
                </div>
              )}
              {video.duration && (
                <div className="related-video-duration">
                  {video.duration}
                </div>
              )}
            </div>
            <div className="related-video-info">
              <h4 className="related-video-title">{video.title}</h4>
              <p className="related-video-author">{video.primaryAuthor?.name || 'Staff Videographer'}</p>
              <p className="related-video-views">{video.viewCount || 0} views</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedVideos;