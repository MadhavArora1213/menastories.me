import React, { useState, useRef, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';

const VideoPlayer = ({ 
  src,
  poster,
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  className = '',
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onLoadedMetadata,
  showMetadata = false,
  metadata = null,
  customControls = false
}) => {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [buffered, setBuffered] = useState({ start: 0, end: 0 });

  // Control visibility timer
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => setLoading(true);
    const handleCanPlay = () => setLoading(false);
    const handleError = (e) => {
      setError('Failed to load video');
      setLoading(false);
      console.error('Video error:', e);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
      if (onLoadedMetadata) {
        onLoadedMetadata({
          duration: video.duration,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight
        });
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      updateBuffered();
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (onPlay) onPlay();
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (onPause) onPause();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const updateBuffered = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedStart = video.buffered.start(0);
        setBuffered({ start: bufferedStart, end: bufferedEnd });
      }
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('progress', updateBuffered);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('progress', updateBuffered);
    };
  }, [onPlay, onPause, onEnded, onTimeUpdate, onLoadedMetadata]);

  // Hide controls after inactivity
  useEffect(() => {
    if (!customControls) return;

    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    const handleMouseMove = resetControlsTimeout;
    const handleMouseEnter = resetControlsTimeout;
    const handleMouseLeave = () => {
      if (isPlaying) {
        setShowControls(false);
      }
    };

    if (customControls) {
      document.addEventListener('mousemove', handleMouseMove);
      videoRef.current?.addEventListener('mouseenter', handleMouseEnter);
      videoRef.current?.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      videoRef.current?.removeEventListener('mouseenter', handleMouseEnter);
      videoRef.current?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [customControls, isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!videoRef.current) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekRelative(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekRelative(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(-0.1);
          break;
      }
    };

    if (customControls) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [customControls]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => {
        console.error('Failed to play video:', err);
        setError('Failed to play video');
      });
    }
  }, [isPlaying]);

  const seekToTime = useCallback((time) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(time, duration));
  }, [duration]);

  const seekRelative = useCallback((seconds) => {
    seekToTime(currentTime + seconds);
  }, [currentTime, seekToTime]);

  const changeVolume = useCallback((delta) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = Math.max(0, Math.min(1, volume + delta));
    video.volume = newVolume;
    setVolume(newVolume);
  }, [volume]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.mozRequestFullScreen) {
        videoRef.current.mozRequestFullScreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  const handleProgressClick = useCallback((e) => {
    const progressBar = progressRef.current;
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    seekToTime(percentage * duration);
  }, [duration, seekToTime]);

  const handleVolumeClick = useCallback((e) => {
    const volumeBar = volumeRef.current;
    if (!volumeBar) return;

    const rect = volumeBar.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percentage));
    
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);
    }
  }, []);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPlaybackRateLabel = (rate) => {
    if (rate === 1) return 'Normal';
    return `${rate}x`;
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Video Error</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden group ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={!customControls && controls}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
        onClick={customControls ? togglePlay : undefined}
      />

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Custom Controls */}
      {customControls && (
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent transition-all duration-300 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
          }`}
        >
          {/* Progress Bar */}
          <div className="px-4 py-2">
            <div 
              ref={progressRef}
              className="w-full h-2 bg-white bg-opacity-30 rounded-full cursor-pointer group/progress"
              onClick={handleProgressClick}
            >
              {/* Buffered Progress */}
              <div 
                className="absolute h-2 bg-white bg-opacity-50 rounded-full"
                style={{ width: `${(buffered.end / duration) * 100}%` }}
              />
              {/* Current Progress */}
              <div 
                className="h-2 bg-blue-500 rounded-full relative transition-all duration-150"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity -mr-2" />
              </div>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between px-4 pb-4">
            {/* Left Controls */}
            <div className="flex items-center space-x-3">
              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Volume Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
                
                {/* Volume Bar */}
                <div 
                  ref={volumeRef}
                  className="w-20 h-1 bg-white bg-opacity-30 rounded-full cursor-pointer group/volume"
                  onClick={handleVolumeClick}
                >
                  <div 
                    className="h-1 bg-white rounded-full relative transition-all duration-150"
                    style={{ width: `${volume * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/volume:opacity-100 transition-opacity -mr-1.5" />
                  </div>
                </div>
              </div>

              {/* Time Display */}
              <span className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              {/* Playback Speed */}
              <div className="relative group/speed">
                <button className="text-white hover:text-gray-300 transition-colors text-sm">
                  {getPlaybackRateLabel(playbackRate)}
                </button>
                <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 rounded px-2 py-1 opacity-0 group-hover/speed:opacity-100 transition-opacity pointer-events-none">
                  <div className="flex flex-col space-y-1 text-xs text-white whitespace-nowrap">
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.playbackRate = rate;
                            setPlaybackRate(rate);
                          }
                        }}
                        className={`text-left hover:text-blue-300 pointer-events-auto ${
                          playbackRate === rate ? 'text-blue-400' : ''
                        }`}
                      >
                        {getPlaybackRateLabel(rate)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isFullscreen ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metadata Panel */}
      {showMetadata && metadata && (
        <div className="absolute top-0 right-0 m-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-sm max-w-xs">
          <h4 className="font-medium mb-2">{metadata.title || metadata.displayName}</h4>
          
          {metadata.description && (
            <p className="text-gray-300 text-xs mb-2">{metadata.description}</p>
          )}
          
          <div className="space-y-1 text-xs">
            {metadata.duration && (
              <div>Duration: {formatTime(metadata.duration)}</div>
            )}
            {metadata.size && (
              <div>Size: {(metadata.size / (1024 * 1024)).toFixed(2)} MB</div>
            )}
            {metadata.format && (
              <div>Format: {metadata.format.toUpperCase()}</div>
            )}
            {metadata.createdAt && (
              <div>
                Uploaded: {formatDistanceToNow(new Date(metadata.createdAt), { addSuffix: true })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click to Play Overlay (for non-autoplay videos) */}
      {!isPlaying && !loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all transform hover:scale-105"
          >
            <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;