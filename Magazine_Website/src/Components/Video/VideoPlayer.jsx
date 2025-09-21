import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { videoService } from '../../services/videoService';

const VideoPlayer = forwardRef(({
  src,
  poster,
  title,
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  customControls = true,
  showQualitySelector = true,
  showPlaybackSpeed = true,
  showChapters = false,
  chapters = [],
  onProgress,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  onQualityChange,
  onSpeedChange,
  className = '',
  videoId,
  ...props
}, ref) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);

  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buffered, setBuffered] = useState({ start: 0, end: 0 });

  // UI state
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Video settings
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [availableQualities, setAvailableQualities] = useState([]);

  // Control visibility timer
  const controlsTimeoutRef = useRef(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    play: () => handlePlay(),
    pause: () => handlePause(),
    seekTo: (time) => seekToTime(time),
    setVolume: (vol) => changeVolume(vol),
    toggleMute: () => toggleMute(),
    toggleFullscreen: () => toggleFullscreen(),
    getCurrentTime: () => currentTime,
    getDuration: () => duration,
    isPlaying: () => isPlaying
  }));

  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => setLoading(true);
    const handleCanPlay = () => setLoading(false);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);

      // Load available qualities if videoId is provided
      if (videoId && showQualitySelector) {
        loadQualities();
      }
    };

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      updateBuffered();

      if (onTimeUpdate) {
        onTimeUpdate(time);
      }

      if (onProgress) {
        onProgress({
          currentTime: time,
          duration: video.duration,
          percentage: (time / video.duration) * 100,
          isPlaying
        });
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

    const handleError = (e) => {
      console.error('Video error:', e);
      setError('Failed to load video');
      setLoading(false);
    };

    const updateBuffered = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered({ start: 0, end: bufferedEnd });
      }
    };

    // Add event listeners
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('error', handleError);
    video.addEventListener('progress', updateBuffered);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('error', handleError);
      video.removeEventListener('progress', updateBuffered);
    };
  }, [videoId, showQualitySelector, onTimeUpdate, onProgress, onPlay, onPause, onEnded]);

  // Load available qualities
  const loadQualities = async () => {
    try {
      if (!videoId) return;
      const qualities = await videoService.getVideoQualities(videoId);
      setAvailableQualities(qualities || []);
    } catch (err) {
      console.error('Failed to load qualities:', err);
    }
  };

  // Control visibility management
  useEffect(() => {
    if (!customControls) return;

    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying && !showSettings && !showQualityMenu && !showSpeedMenu) {
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

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [customControls, isPlaying, showSettings, showQualityMenu, showSpeedMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!customControls) return;

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
        case 'c':
        case 'C':
          e.preventDefault();
          // Toggle captions (if available)
          break;
      }
    };

    if (customControls) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [customControls]);

  // Playback controls
  const handlePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to play video:', err);
    }
  }, []);

  const handlePause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isPlaying, handlePlay, handlePause]);

  const seekToTime = useCallback((time) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, Math.min(time, duration));
    video.currentTime = newTime;
    setCurrentTime(newTime);
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

  const setVolumeLevel = useCallback((level) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = level;
    setVolume(level);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
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

  // Progress bar interaction
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
    setVolumeLevel(percentage);
  }, [setVolumeLevel]);

  // Quality and speed controls
  const changeQuality = useCallback(async (quality) => {
    setCurrentQuality(quality);
    setShowQualityMenu(false);

    if (onQualityChange) {
      onQualityChange(quality);
    }

    // Track quality change analytics
    if (videoId) {
      await videoService.trackVideoEvent(videoId, {
        eventType: 'quality_change',
        currentTime,
        metadata: { quality }
      });
    }
  }, [currentQuality, onQualityChange, videoId, currentTime]);

  const changePlaybackSpeed = useCallback(async (speed) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);

    if (onSpeedChange) {
      onSpeedChange(speed);
    }

    // Track speed change analytics
    if (videoId) {
      await videoService.trackVideoEvent(videoId, {
        eventType: 'speed_change',
        currentTime,
        metadata: { speed }
      });
    }
  }, [onSpeedChange, videoId, currentTime]);

  // Format time display
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get current chapter
  const getCurrentChapter = () => {
    if (!chapters.length) return null;
    return chapters.find((chapter, index) => {
      const nextChapter = chapters[index + 1];
      return currentTime >= chapter.time && (!nextChapter || currentTime < nextChapter.time);
    });
  };

  const currentChapter = getCurrentChapter();

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Video Error</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      style={{ aspectRatio: '16/9' }}
    >
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
        {...props}
      />

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Chapter Overlay */}
      {showChapters && currentChapter && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
          {currentChapter.title}
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
              {/* Chapters */}
              {showChapters && chapters.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-white hover:text-gray-300 transition-colors text-sm"
                  >
                    Chapters
                  </button>
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 rounded px-2 py-1 min-w-48">
                      {chapters.map((chapter, index) => (
                        <button
                          key={index}
                          onClick={() => seekToTime(chapter.time)}
                          className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-700 ${
                            currentTime >= chapter.time ? 'text-blue-400' : 'text-white'
                          }`}
                        >
                          {formatTime(chapter.time)} - {chapter.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Playback Speed */}
              {showPlaybackSpeed && (
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="text-white hover:text-gray-300 transition-colors text-sm"
                  >
                    {playbackSpeed}x
                  </button>
                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 rounded px-2 py-1">
                      {videoService.getPlaybackRates().map((rate) => (
                        <button
                          key={rate.value}
                          onClick={() => changePlaybackSpeed(rate.value)}
                          className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-700 ${
                            playbackSpeed === rate.value ? 'text-blue-400' : 'text-white'
                          }`}
                        >
                          {rate.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Quality Selector */}
              {showQualitySelector && availableQualities.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="text-white hover:text-gray-300 transition-colors text-sm"
                  >
                    {currentQuality}
                  </button>
                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 rounded px-2 py-1">
                      {availableQualities.map((quality) => (
                        <button
                          key={quality.value}
                          onClick={() => changeQuality(quality.value)}
                          className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-700 ${
                            currentQuality === quality.value ? 'text-blue-400' : 'text-white'
                          }`}
                        >
                          {quality.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;