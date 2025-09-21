import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaEnvelope, FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaDownload, FaBookmark, FaEye, FaCalendar, FaClock, FaTag, FaUser, FaShare, FaHeart, FaComment, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import VideoPlayer from './VideoPlayer';
import VideoComments from './VideoComments';
import VideoTranscript from './VideoTranscript';
import VideoAnalytics from './VideoAnalytics';
import { formatDistanceToNow } from 'date-fns';
import { videoService } from '../../services/videoService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userActivityTracker } from '../../utils/userActivityTracker';

const VideoArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('comments');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);

  const videoPlayerRef = useRef(null);

  useEffect(() => {
    loadVideo();
  }, [id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      const [videoResponse, relatedResponse] = await Promise.all([
        videoService.getVideoArticleById(id),
        videoService.getRelatedVideos(id, { limit: 8 })
      ]);

      setVideo(videoResponse.video);
      setRelatedVideos(relatedResponse.videos || []);
      setShareCount(videoResponse.video.shareCount || 0);
      setViewCount(videoResponse.video.viewCount || 0);

      // Check if user has liked/saved this video
      if (user) {
        setIsLiked(userActivityTracker.isVideoLiked(user.id, videoResponse.video.id));
        setIsSaved(userActivityTracker.isVideoSaved(user.id, videoResponse.video.id));
      }

    } catch (err) {
      console.error('Failed to load video:', err);
      setError('Failed to load video article');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!video || !user) return;

    try {
      if (isLiked) {
        userActivityTracker.trackVideoLike(user.id, video.id, video.title, false);
        setIsLiked(false);
        toast.success('Removed from liked videos');
      } else {
        userActivityTracker.trackVideoLike(user.id, video.id, video.title, true);
        setIsLiked(true);
        toast.success('Added to liked videos');
      }

      // Track analytics
      await videoService.trackVideoEvent(video.id, {
        eventType: isLiked ? 'unlike' : 'like',
        currentTime,
        metadata: { source: 'video_page' }
      });
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleSave = async () => {
    if (!video || !user) return;

    try {
      if (isSaved) {
        userActivityTracker.trackVideoSave(user.id, video.id, video.title, false);
        setIsSaved(false);
        toast.success('Removed from saved videos');
      } else {
        userActivityTracker.trackVideoSave(user.id, video.id, video.title, true);
        setIsSaved(true);
        toast.success('Added to saved videos');
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const handleShare = async (platform) => {
    if (!video) return;

    const shareUrl = `${window.location.origin}/videos/${video.id}`;
    const shareText = `Check out this video: ${video.title}`;

    try {
      switch (platform) {
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard!');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
          break;
        case 'email':
          window.open(`mailto:?subject=${encodeURIComponent(video.title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`);
          break;
      }

      // Track share analytics
      await videoService.trackVideoEvent(video.id, {
        eventType: 'share',
        currentTime,
        metadata: { platform, source: 'video_page' }
      });

      setShareCount(prev => prev + 1);
      setShowShareModal(false);
    } catch (err) {
      console.error('Failed to share video:', err);
    }
  };

  const handleVideoProgress = useCallback((progress) => {
    setCurrentTime(progress.currentTime);
    setIsPlaying(progress.isPlaying);
  }, []);

  const handleRelatedVideoClick = (relatedVideo) => {
    navigate(`/videos/${relatedVideo.id}`);
  };

  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 dark:bg-gray-700 aspect-video rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {error || 'Video not found'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The video you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/videos')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Videos
          </button>
        </div>
      </div>
    );
  }

  const typeInfo = videoService.getVideoTypeInfo(video.videoType);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Video Player */}
      <div className="relative bg-gradient-to-br from-[#162048] via-[#1a1a1a] to-[#162048] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Video Player Container */}
          <div className="bg-black rounded-2xl overflow-hidden shadow-2xl mb-8">
            <div className="aspect-video">
              <VideoPlayer
                ref={videoPlayerRef}
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                title={video.title}
                onProgress={handleVideoProgress}
                onTimeUpdate={(time) => setCurrentTime(time)}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Video Info Section */}
          <div className="text-white">
            <div className="flex flex-col lg:flex-row lg:items-start gap-8">
              {/* Main Content */}
              <div className="flex-1">
                {/* Video Header */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`px-3 py-1 text-xs rounded-full ${typeInfo.color} border border-white/20`}>
                      {typeInfo.icon} {typeInfo.label}
                    </span>
                    {video.featured && (
                      <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full border border-yellow-300">
                        ⭐ Featured
                      </span>
                    )}
                    {video.isPremium && (
                      <span className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full border border-purple-300">
                        💎 Premium
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                    {video.title}
                  </h1>

                  <div className="flex items-center justify-between text-sm text-white/80 mb-6">
                    <div className="flex items-center space-x-4">
                      <span>{formatViewCount(viewCount)} views</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span>{video.likeCount} likes</span>
                      <span>•</span>
                      <span>{shareCount} shares</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleLike}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-colors border-2 ${
                        isLiked
                          ? 'bg-red-100 text-red-700 border-red-300'
                          : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
                      }`}
                    >
                      <FaThumbsUp />
                      <span>{isLiked ? 'Liked' : 'Like'}</span>
                    </button>

                    <button
                      onClick={handleSave}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-colors border-2 ${
                        isSaved
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
                      }`}
                    >
                      <FaBookmark />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center space-x-2 px-6 py-3 bg-white/10 text-white border-2 border-white/30 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <FaShare />
                      <span>Share</span>
                    </button>

                    {video.allowDownload && (
                      <button
                        onClick={() => videoService.downloadVideo(video.id)}
                        className="flex items-center space-x-2 px-6 py-3 bg-white/10 text-white border-2 border-white/30 rounded-full hover:bg-white/20 transition-colors"
                      >
                        <FaDownload />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Author Info Sidebar */}
              <div className="lg:w-80">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    {video.author?.avatar ? (
                      <img
                        src={video.author.avatar}
                        alt={video.author?.displayName}
                        className="w-12 h-12 rounded-full border-2 border-white/30"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <FaUser className="text-white/80" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-white">
                        {video.author?.displayName || video.author?.username}
                      </h3>
                      <p className="text-white/70 text-sm">
                        Published {formatDistanceToNow(new Date(video.publishedAt || video.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {video.author?.bio && (
                    <p className="text-white/80 text-sm leading-relaxed mb-4">
                      {video.author.bio}
                    </p>
                  )}

                  {/* Author Social Links */}
                  <div className="flex gap-3">
                    {video.author?.socialLinks?.twitter && (
                      <a
                        href={video.author.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-[#1da1f2] text-white rounded-full flex items-center justify-center hover:bg-[#1a91da] transition-colors"
                      >
                        <FaTwitter />
                      </a>
                    )}
                    {video.author?.socialLinks?.linkedin && (
                      <a
                        href={video.author.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-[#0077b5] text-white rounded-full flex items-center justify-center hover:bg-[#005885] transition-colors"
                      >
                        <FaLinkedin />
                      </a>
                    )}
                    {video.author?.socialLinks?.facebook && (
                      <a
                        href={video.author.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-[#1877f2] text-white rounded-full flex items-center justify-center hover:bg-[#166fe5] transition-colors"
                      >
                        <FaFacebook />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Description */}
            {video.excerpt && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-[#162048] mb-4">Description</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {video.excerpt}
                </p>
              </div>
            )}

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-[#162048] mb-4">Tags</h3>
                <div className="flex flex-wrap gap-3">
                  {video.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-[#e3e7f7] text-[#162048] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#162048] hover:text-white transition-colors border border-[#162048]/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs for Comments/Transcript/Analytics */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`flex-1 px-6 py-4 text-sm font-medium ${
                      activeTab === 'comments'
                        ? 'border-b-2 border-[#162048] text-[#162048]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FaComment className="inline mr-2" />
                    Comments
                  </button>
                  {video.transcript && (
                    <button
                      onClick={() => setActiveTab('transcript')}
                      className={`flex-1 px-6 py-4 text-sm font-medium ${
                        activeTab === 'transcript'
                          ? 'border-b-2 border-[#162048] text-[#162048]'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      📄 Transcript
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex-1 px-6 py-4 text-sm font-medium ${
                      activeTab === 'analytics'
                        ? 'border-b-2 border-[#162048] text-[#162048]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📊 Analytics
                    </button>
                </nav>
              </div>

              <div className="p-8">
                {activeTab === 'comments' && (
                  <VideoComments
                    videoId={video.id}
                    videoDuration={video.duration}
                    currentTime={currentTime}
                  />
                )}

                {activeTab === 'transcript' && video.transcript && (
                  <VideoTranscript
                    transcript={video.transcript}
                    currentTime={currentTime}
                    onTimeClick={(time) => {
                      if (videoPlayerRef.current) {
                        videoPlayerRef.current.seekTo(time);
                      }
                    }}
                  />
                )}

                {activeTab === 'analytics' && (
                  <VideoAnalytics
                    videoId={video.id}
                    viewCount={viewCount}
                    likeCount={video.likeCount}
                    shareCount={shareCount}
                    watchTime={video.watchTime}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Related Videos */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-[#162048] mb-6 text-lg">Related Videos</h3>
              <div className="space-y-4">
                {relatedVideos.map((relatedVideo) => (
                  <div
                    key={relatedVideo.id}
                    onClick={() => handleRelatedVideoClick(relatedVideo)}
                    className="flex space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-colors group"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={relatedVideo.thumbnailUrl || '/api/placeholder/120/68'}
                        alt={relatedVideo.title}
                        className="w-24 h-14 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                        <FaPlay className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#162048] transition-colors">
                        {relatedVideo.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatViewCount(relatedVideo.viewCount)} views
                      </p>
                      <p className="text-xs text-gray-600">
                        {videoService.formatDuration(relatedVideo.duration)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-[#162048] mb-6 text-lg">Video Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-gray-900 font-medium">
                    {videoService.formatDuration(video.duration)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">File Size:</span>
                  <span className="text-gray-900 font-medium">
                    {videoService.formatFileSize(video.fileSize)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Format:</span>
                  <span className="text-gray-900 font-medium">
                    {video.format?.toUpperCase() || 'MP4'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="text-gray-900 font-medium">
                    {video.category?.name || 'General'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Published:</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(video.publishedAt || video.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-r from-[#162048] to-[#1a1a1a] text-white rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
              <p className="text-white/80 text-sm mb-4 leading-relaxed">
                Get the latest videos and content delivered to your inbox.
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                />
                <button className="bg-white text-[#162048] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Share Video
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleShare('copy')}
                  className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Copy Link</span>
                </button>

                <button
                  onClick={() => handleShare('facebook')}
                  className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <FaFacebook className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Facebook</span>
                </button>

                <button
                  onClick={() => handleShare('twitter')}
                  className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <FaTwitter className="h-6 w-6 text-blue-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Twitter</span>
                </button>

                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <FaWhatsapp className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoArticlePage;