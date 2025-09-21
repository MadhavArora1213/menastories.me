const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VideoPlaylist = sequelize.define('VideoPlaylist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  slug: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[a-z0-9-]+$/i
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  thumbnailUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  coverImageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  playlistType: {
    type: DataTypes.ENUM(
      'manual',
      'auto',
      'series',
      'collection',
      'featured'
    ),
    allowNull: false,
    defaultValue: 'manual'
  },
  autoCriteria: {
    type: DataTypes.JSON, // For auto playlists: { videoType: 'news', tags: ['breaking'], limit: 10 }
    allowNull: true,
    defaultValue: null
  },
  videoIds: {
    type: DataTypes.JSON, // Array of video article IDs in order
    allowNull: false,
    defaultValue: []
  },
  totalVideos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  totalDuration: {
    type: DataTypes.INTEGER, // Total duration in seconds
    allowNull: false,
    defaultValue: 0
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  allowEmbed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  likeCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  shareCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  seoTitle: {
    type: DataTypes.STRING(60),
    allowNull: true
  },
  seoDescription: {
    type: DataTypes.STRING(160),
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'video_playlists',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['slug']
    },
    {
      fields: ['playlistType']
    },
    {
      fields: ['isPublic']
    },
    {
      fields: ['isFeatured']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['viewCount']
    }
  ]
});

// Instance methods
VideoPlaylist.prototype.addVideo = async function(videoId, position = null) {
  const videoIds = [...this.videoIds];

  if (position === null) {
    videoIds.push(videoId);
  } else {
    videoIds.splice(position, 0, videoId);
  }

  this.videoIds = videoIds;
  this.totalVideos = videoIds.length;

  return this.save();
};

VideoPlaylist.prototype.removeVideo = async function(videoId) {
  const videoIds = this.videoIds.filter(id => id !== videoId);
  this.videoIds = videoIds;
  this.totalVideos = videoIds.length;

  return this.save();
};

VideoPlaylist.prototype.reorderVideos = async function(newOrder) {
  // newOrder should be an array of video IDs in the new order
  this.videoIds = newOrder;
  return this.save();
};

VideoPlaylist.prototype.incrementViews = async function() {
  this.viewCount += 1;
  return this.save();
};

VideoPlaylist.prototype.incrementLikes = async function() {
  this.likeCount += 1;
  return this.save();
};

VideoPlaylist.prototype.incrementShares = async function() {
  this.shareCount += 1;
  return this.save();
};

VideoPlaylist.prototype.getNextVideo = function(currentVideoId) {
  const currentIndex = this.videoIds.indexOf(currentVideoId);
  if (currentIndex === -1 || currentIndex === this.videoIds.length - 1) {
    return null; // No next video
  }
  return this.videoIds[currentIndex + 1];
};

VideoPlaylist.prototype.getPreviousVideo = function(currentVideoId) {
  const currentIndex = this.videoIds.indexOf(currentVideoId);
  if (currentIndex <= 0) {
    return null; // No previous video
  }
  return this.videoIds[currentIndex - 1];
};

VideoPlaylist.prototype.updateAutoPlaylist = async function() {
  if (this.playlistType !== 'auto' || !this.autoCriteria) {
    return;
  }

  // This would implement logic to automatically update the playlist
  // based on the autoCriteria (e.g., latest videos of certain type)
  // For now, we'll just mark it as needing implementation
  console.log('Auto playlist update needed for:', this.id);
};

module.exports = VideoPlaylist;