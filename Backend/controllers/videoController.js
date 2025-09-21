const { VideoArticle, VideoPlaylist, VideoAnalytics, VideoComment, User, Category, Tag } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;

// Video Article Controllers
exports.getVideoArticles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      videoType,
      featured,
      published,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Build where clause
    if (category) whereClause.categoryId = category;
    if (videoType) whereClause.videoType = videoType;
    if (featured !== undefined) whereClause.featured = featured === 'true';
    if (published !== undefined) whereClause.isPublished = published === 'true';
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { excerpt: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } }
      ];
    }

    const { rows: videos, count: total } = await VideoArticle.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'displayName', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      videos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching video articles:', error);
    res.status(500).json({ error: 'Failed to fetch video articles' });
  }
};

exports.getVideoArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await VideoArticle.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'displayName', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }
      ]
    });

    if (!video) {
      return res.status(404).json({ error: 'Video article not found' });
    }

    // Track view analytics
    if (req.user) {
      await VideoAnalytics.create({
        videoId: id,
        userId: req.user.id,
        eventType: 'view_start',
        deviceType: req.device?.type || 'unknown',
        browser: req.useragent?.browser,
        os: req.useragent?.os,
        country: req.geo?.country,
        referrer: req.get('referer')
      });
    }

    // Increment view count
    await video.incrementViews();

    res.json({ video });
  } catch (error) {
    console.error('Error fetching video article:', error);
    res.status(500).json({ error: 'Failed to fetch video article' });
  }
};

exports.createVideoArticle = async (req, res) => {
  try {
    const videoData = {
      ...req.body,
      createdBy: req.user.id
    };

    const video = await VideoArticle.create(videoData);

    // Associate tags if provided
    if (req.body.tagIds && req.body.tagIds.length > 0) {
      await video.setTags(req.body.tagIds);
    }

    const videoWithAssociations = await VideoArticle.findByPk(video.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'displayName', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({ video: videoWithAssociations });
  } catch (error) {
    console.error('Error creating video article:', error);
    res.status(500).json({ error: 'Failed to create video article' });
  }
};

exports.updateVideoArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('=== VIDEO CONTROLLER UPDATE START ===');
    console.log('Video Article ID:', id);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Title in request:', req.body.title);

    const video = await VideoArticle.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: 'Video article not found' });
    }

    console.log('Current title in DB:', video.title);

    // Check permissions
    if (video.createdBy !== req.user?.id && req.admin?.role !== 'Master Admin') {
      return res.status(403).json({ error: 'Unauthorized to update this video' });
    }

    // Create proper updateData object with explicit field mapping
    const mappedUpdateData = {};

    // Direct field mapping
    if (req.body.title !== undefined) mappedUpdateData.title = req.body.title;
    if (req.body.subtitle !== undefined) mappedUpdateData.subtitle = req.body.subtitle;
    if (req.body.content !== undefined) mappedUpdateData.content = req.body.content;
    if (req.body.excerpt !== undefined) mappedUpdateData.excerpt = req.body.excerpt;
    if (req.body.description !== undefined) mappedUpdateData.description = req.body.description;
    if (req.body.youtubeUrl !== undefined) mappedUpdateData.youtubeUrl = req.body.youtubeUrl;
    if (req.body.videoType !== undefined) mappedUpdateData.videoType = req.body.videoType;
    if (req.body.duration !== undefined) mappedUpdateData.duration = req.body.duration;
    if (req.body.thumbnailUrl !== undefined) mappedUpdateData.thumbnailUrl = req.body.thumbnailUrl;
    if (req.body.categoryId !== undefined) mappedUpdateData.categoryId = req.body.categoryId;
    if (req.body.subcategoryId !== undefined) mappedUpdateData.subcategoryId = req.body.subcategoryId;
    if (req.body.authorId !== undefined) mappedUpdateData.authorId = req.body.authorId;
    if (req.body.featured !== undefined) mappedUpdateData.featured = req.body.featured;
    if (req.body.trending !== undefined) mappedUpdateData.trending = req.body.trending;
    if (req.body.pinned !== undefined) mappedUpdateData.pinned = req.body.pinned;
    if (req.body.allowComments !== undefined) mappedUpdateData.allowComments = req.body.allowComments;
    if (req.body.status !== undefined) mappedUpdateData.status = req.body.status;
    
    // Handle arrays
    if (req.body.tags && Array.isArray(req.body.tags)) {
      mappedUpdateData.tags = req.body.tags;
    }
    if (req.body.coAuthors && Array.isArray(req.body.coAuthors)) {
      mappedUpdateData.coAuthors = req.body.coAuthors;
    }
    if (req.body.keywords && Array.isArray(req.body.keywords)) {
      mappedUpdateData.keywords = req.body.keywords;
    }

    console.log('=== MAPPED UPDATE DATA ===');
    console.log('Mapped data:', JSON.stringify(mappedUpdateData, null, 2));
    console.log('Title in mapped data:', mappedUpdateData.title);

    await video.update(mappedUpdateData);

    console.log('=== AFTER UPDATE ===');
    console.log('Video title after update:', video.title);

    // Reload to get fresh data
    await video.reload();

    console.log('=== AFTER RELOAD ===');
    console.log('Video title after reload:', video.title);

    // Update tags if provided
    if (req.body.tagIds !== undefined) {
      await video.setTags(req.body.tagIds);
    }

    const updatedVideo = await VideoArticle.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'displayName', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }
      ]
    });

    console.log('=== FINAL RESPONSE DATA ===');
    console.log('Final video title:', updatedVideo?.title);

    res.json({ 
      success: true,
      message: 'Video article updated successfully',
      data: updatedVideo 
    });
  } catch (error) {
    console.error('Error updating video article:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update video article',
      message: error.message 
    });
  }
};

exports.deleteVideoArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await VideoArticle.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: 'Video article not found' });
    }

    // Check permissions
    if (video.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this video' });
    }

    await video.destroy();
    res.json({ message: 'Video article deleted successfully' });
  } catch (error) {
    console.error('Error deleting video article:', error);
    res.status(500).json({ error: 'Failed to delete video article' });
  }
};

// Video Analytics Controllers
exports.getVideoAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const video = await VideoArticle.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: 'Video article not found' });
    }

    // Check permissions
    if (video.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to view analytics' });
    }

    const whereClause = { videoId: id };
    if (startDate && endDate) {
      whereClause.eventTimestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const analytics = await VideoAnalytics.findAll({
      where: whereClause,
      order: [['eventTimestamp', 'DESC']],
      limit: 1000
    });

    // Calculate summary statistics
    const stats = await VideoAnalytics.getVideoStats(id, startDate, endDate);
    const deviceStats = await VideoAnalytics.getDeviceStats(id, startDate, endDate);
    const geographicStats = await VideoAnalytics.getGeographicStats(id, startDate, endDate);
    const watchTimeDistribution = await VideoAnalytics.getWatchTimeDistribution(id, startDate, endDate);

    res.json({
      video,
      analytics,
      stats,
      deviceStats,
      geographicStats,
      watchTimeDistribution
    });
  } catch (error) {
    console.error('Error fetching video analytics:', error);
    res.status(500).json({ error: 'Failed to fetch video analytics' });
  }
};

exports.trackVideoEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventType, watchTime, currentTime, quality, metadata } = req.body;

    const video = await VideoArticle.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: 'Video article not found' });
    }

    const analyticsData = {
      videoId: id,
      eventType,
      watchTime,
      currentTime,
      quality,
      deviceType: req.device?.type || 'unknown',
      browser: req.useragent?.browser,
      os: req.useragent?.os,
      country: req.geo?.country,
      region: req.geo?.region,
      city: req.geo?.city,
      referrer: req.get('referer'),
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
      metadata
    };

    if (req.user) {
      analyticsData.userId = req.user.id;
    } else {
      analyticsData.sessionId = req.sessionID || req.body.sessionId;
    }

    const analytics = await VideoAnalytics.create(analyticsData);

    // Update video watch time if it's a completion event
    if (eventType === 'view_complete' && watchTime) {
      await video.addWatchTime(watchTime);
    }

    res.json({ analytics });
  } catch (error) {
    console.error('Error tracking video event:', error);
    res.status(500).json({ error: 'Failed to track video event' });
  }
};

// Video Comment Controllers
exports.getVideoComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, includeReplies = true } = req.query;

    const video = await VideoArticle.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: 'Video article not found' });
    }

    const offset = (page - 1) * limit;
    const comments = await VideoComment.getCommentsByVideo(
      id,
      includeReplies === 'true',
      parseInt(limit),
      parseInt(offset)
    );

    const total = await VideoComment.count({
      where: { videoId: id, parentId: null, status: 'active' }
    });

    res.json({
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching video comments:', error);
    res.status(500).json({ error: 'Failed to fetch video comments' });
  }
};

exports.createVideoComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, timestamp, parentId } = req.body;

    const video = await VideoArticle.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: 'Video article not found' });
    }

    const commentData = {
      videoId: id,
      userId: req.user.id,
      content,
      timestamp,
      parentId: parentId || null
    };

    const comment = await VideoComment.create(commentData);

    // Update reply count if it's a reply
    if (parentId) {
      const parentComment = await VideoComment.findByPk(parentId);
      if (parentComment) {
        await parentComment.addReply();
      }
    }

    const commentWithUser = await VideoComment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'displayName', 'avatar']
      }]
    });

    res.status(201).json({ comment: commentWithUser });
  } catch (error) {
    console.error('Error creating video comment:', error);
    res.status(500).json({ error: 'Failed to create video comment' });
  }
};

exports.updateVideoComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await VideoComment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check permissions
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this comment' });
    }

    await comment.edit(content);

    const updatedComment = await VideoComment.findByPk(commentId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'displayName', 'avatar']
      }]
    });

    res.json({ comment: updatedComment });
  } catch (error) {
    console.error('Error updating video comment:', error);
    res.status(500).json({ error: 'Failed to update video comment' });
  }
};

exports.deleteVideoComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await VideoComment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check permissions
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    await comment.softDelete();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting video comment:', error);
    res.status(500).json({ error: 'Failed to delete video comment' });
  }
};

// Video Playlist Controllers
exports.getVideoPlaylists = async (req, res) => {
  try {
    const { page = 1, limit = 12, featured, search } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (featured !== undefined) whereClause.isFeatured = featured === 'true';
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { rows: playlists, count: total } = await VideoPlaylist.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'displayName', 'avatar']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      playlists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching video playlists:', error);
    res.status(500).json({ error: 'Failed to fetch video playlists' });
  }
};

exports.getVideoPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await VideoPlaylist.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'displayName', 'avatar']
        },
        {
          model: VideoArticle,
          as: 'videos',
          through: { attributes: ['position'] },
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'displayName', 'avatar']
            }
          ]
        }
      ]
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Video playlist not found' });
    }

    // Increment view count
    await playlist.incrementViews();

    res.json({ playlist });
  } catch (error) {
    console.error('Error fetching video playlist:', error);
    res.status(500).json({ error: 'Failed to fetch video playlist' });
  }
};

exports.createVideoPlaylist = async (req, res) => {
  try {
    const playlistData = {
      ...req.body,
      createdBy: req.user.id
    };

    const playlist = await VideoPlaylist.create(playlistData);

    // Add videos if provided
    if (req.body.videoIds && req.body.videoIds.length > 0) {
      await playlist.setVideos(req.body.videoIds);
    }

    const playlistWithVideos = await VideoPlaylist.findByPk(playlist.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'displayName', 'avatar']
        },
        {
          model: VideoArticle,
          as: 'videos',
          through: { attributes: ['position'] }
        }
      ]
    });

    res.status(201).json({ playlist: playlistWithVideos });
  } catch (error) {
    console.error('Error creating video playlist:', error);
    res.status(500).json({ error: 'Failed to create video playlist' });
  }
};

exports.updateVideoPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const playlist = await VideoPlaylist.findByPk(id);
    if (!playlist) {
      return res.status(404).json({ error: 'Video playlist not found' });
    }

    // Check permissions
    if (playlist.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this playlist' });
    }

    await playlist.update(updateData);

    // Update videos if provided
    if (req.body.videoIds !== undefined) {
      await playlist.setVideos(req.body.videoIds);
    }

    const updatedPlaylist = await VideoPlaylist.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'displayName', 'avatar']
        },
        {
          model: VideoArticle,
          as: 'videos',
          through: { attributes: ['position'] }
        }
      ]
    });

    res.json({ playlist: updatedPlaylist });
  } catch (error) {
    console.error('Error updating video playlist:', error);
    res.status(500).json({ error: 'Failed to update video playlist' });
  }
};

// Video Upload and Processing
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { title, description, videoType, categoryId, tags } = req.body;

    // Process video file (this would typically involve uploading to cloud storage)
    const videoData = {
      title: title || req.file.originalname,
      description,
      videoType: videoType || 'news',
      videoUrl: `/uploads/videos/${req.file.filename}`, // This would be cloud storage URL
      thumbnailUrl: `/uploads/thumbnails/${req.file.filename}.jpg`, // Generated thumbnail
      fileSize: req.file.size,
      duration: 0, // Would be extracted from video metadata
      categoryId,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      createdBy: req.user.id
    };

    const video = await VideoArticle.create(videoData);

    // Start background processing for thumbnail generation and metadata extraction
    // This would typically be handled by a job queue system
    setTimeout(async () => {
      try {
        // Simulate processing
        await video.update({
          duration: 300, // Example duration
          thumbnailUrl: `/api/videos/${video.id}/thumbnail`
        });
      } catch (error) {
        console.error('Error processing video:', error);
      }
    }, 1000);

    res.status(201).json({
      video,
      message: 'Video uploaded successfully. Processing in background.'
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
};

// Get related videos
exports.getRelatedVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const video = await VideoArticle.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: 'Video article not found' });
    }

    // Find related videos based on category, tags, and video type
    const relatedVideos = await VideoArticle.findAll({
      where: {
        id: { [Op.ne]: id },
        isPublished: true,
        [Op.or]: [
          { categoryId: video.categoryId },
          { videoType: video.videoType },
          { tags: { [Op.overlap]: video.tags } }
        ]
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'displayName', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [
        ['viewCount', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit)
    });

    res.json({ videos: relatedVideos });
  } catch (error) {
    console.error('Error fetching related videos:', error);
    res.status(500).json({ error: 'Failed to fetch related videos' });
  }
};

// Generate video transcript
exports.generateTranscript = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await VideoArticle.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: 'Video article not found' });
    }

    // Check permissions
    if (video.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to generate transcript' });
    }

    // Update transcript status
    await video.update({
      transcriptStatus: 'processing'
    });

    // Start background transcription process
    // This would typically integrate with a speech-to-text service
    setTimeout(async () => {
      try {
        // Simulate transcription
        const mockTranscript = "This is a sample transcript for the video content...";
        await video.update({
          transcript: mockTranscript,
          transcriptStatus: 'completed'
        });
      } catch (error) {
        console.error('Error generating transcript:', error);
        await video.update({ transcriptStatus: 'failed' });
      }
    }, 2000);

    res.json({
      message: 'Transcript generation started',
      status: 'processing'
    });
  } catch (error) {
    console.error('Error generating transcript:', error);
    res.status(500).json({ error: 'Failed to generate transcript' });
  }
};