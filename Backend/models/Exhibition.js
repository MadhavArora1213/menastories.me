const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Exhibition = sequelize.define('Exhibition', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'events',
      key: 'id'
    }
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
      len: [0, 2000]
    }
  },
  shortDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 300]
    }
  },
  exhibitionType: {
    type: DataTypes.ENUM(
      'art_gallery',
      'trade_show',
      'museum_exhibit',
      'photography',
      'sculpture',
      'interactive',
      'historical',
      'cultural',
      'educational',
      'commercial',
      'virtual_reality',
      'mixed_media'
    ),
    allowNull: false,
    defaultValue: 'art_gallery'
  },
  status: {
    type: DataTypes.ENUM(
      'draft',
      'published',
      'cancelled',
      'completed'
    ),
    allowNull: false,
    defaultValue: 'draft'
  },
  location: {
    type: DataTypes.JSON, // { hall, booth, coordinates, floor }
    allowNull: true,
    defaultValue: {}
  },
  curator: {
    type: DataTypes.JSON, // { name, bio, contact, photo }
    allowNull: true,
    defaultValue: {}
  },
  artists: {
    type: DataTypes.JSON, // Array of artist information
    allowNull: true,
    defaultValue: []
  },
  artworks: {
    type: DataTypes.JSON, // Array of artwork information
    allowNull: true,
    defaultValue: []
  },
  sponsors: {
    type: DataTypes.JSON, // Array of sponsor information
    allowNull: true,
    defaultValue: []
  },
  mediaAssets: {
    type: DataTypes.JSON, // { banner, gallery, videos, virtualTour }
    allowNull: true,
    defaultValue: {}
  },
  virtualTour: {
    type: DataTypes.JSON, // { enabled, url, hotspots, navigation }
    allowNull: true,
    defaultValue: { enabled: false }
  },
  accessibility: {
    type: DataTypes.JSON, // { wheelchair, audioGuide, braille, signLanguage }
    allowNull: true,
    defaultValue: {}
  },
  openingHours: {
    type: DataTypes.JSON, // Array of time slots
    allowNull: true,
    defaultValue: []
  },
  ticketInfo: {
    type: DataTypes.JSON, // { included, separate, pricing }
    allowNull: true,
    defaultValue: {}
  },
  merchandise: {
    type: DataTypes.JSON, // Array of merchandise items
    allowNull: true,
    defaultValue: []
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  socialLinks: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  contactInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isVirtual: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  allowVirtualTour: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  visitorCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 5
    }
  },
  reviewCount: {
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
  canonicalUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Admins',
      key: 'id'
    }
  }
}, {
  tableName: 'exhibitions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['slug']
    },
    {
      fields: ['eventId']
    },
    {
      fields: ['exhibitionType']
    },
    {
      fields: ['status']
    },
    {
      fields: ['isFeatured']
    },
    {
      fields: ['isVirtual']
    },
    {
      fields: ['viewCount']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['createdBy']
    }
  ]
});

// Instance methods
Exhibition.prototype.incrementViews = async function() {
  this.viewCount += 1;
  return this.save();
};

Exhibition.prototype.incrementVisitors = async function() {
  this.visitorCount += 1;
  return this.save();
};

Exhibition.prototype.addArtwork = async function(artwork) {
  const artworks = [...(this.artworks || [])];
  artworks.push({
    id: artwork.id || Date.now().toString(),
    title: artwork.title,
    artist: artwork.artist,
    description: artwork.description,
    imageUrl: artwork.imageUrl,
    year: artwork.year,
    medium: artwork.medium,
    dimensions: artwork.dimensions,
    price: artwork.price,
    isAvailable: artwork.isAvailable !== false,
    ...artwork
  });
  this.artworks = artworks;
  return this.save();
};

Exhibition.prototype.addArtist = async function(artist) {
  const artists = [...(this.artists || [])];
  artists.push({
    id: artist.id || Date.now().toString(),
    name: artist.name,
    bio: artist.bio,
    photo: artist.photo,
    website: artist.website,
    socialLinks: artist.socialLinks,
    artworks: artist.artworks || [],
    ...artist
  });
  this.artists = artists;
  return this.save();
};

Exhibition.prototype.updateRating = async function(newRating) {
  const currentTotal = (this.rating || 0) * this.reviewCount;
  const newTotal = currentTotal + newRating;
  this.reviewCount += 1;
  this.rating = newTotal / this.reviewCount;
  return this.save();
};

Exhibition.prototype.getVirtualTourUrl = function() {
  if (!this.virtualTour?.enabled) return null;
  return this.virtualTour.url || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/exhibitions/${this.slug}/virtual-tour`;
};

Exhibition.prototype.getShareUrl = function() {
  return `${process.env.FRONTEND_URL || 'http://localhost:3000'}/exhibitions/${this.slug}`;
};

Exhibition.prototype.getEmbedCode = function(options = {}) {
  const {
    width = '100%',
    height = '600px',
    showDetails = true
  } = options;

  return `<iframe
    src="${this.getShareUrl()}?embed=true"
    width="${width}"
    height="${height}"
    frameborder="0"
    allowfullscreen
    ${showDetails ? '' : 'data-hide-details="true"'}
  ></iframe>`;
};

Exhibition.prototype.getAvailableArtworks = function() {
  return (this.artworks || []).filter(artwork => artwork.isAvailable !== false);
};

Exhibition.prototype.getArtistsWithArtworks = function() {
  const artists = this.artists || [];
  const artworks = this.artworks || [];

  return artists.map(artist => ({
    ...artist,
    artworks: artworks.filter(artwork => artwork.artistId === artist.id)
  }));
};

Exhibition.prototype.getOpeningHoursForDate = function(date) {
  const targetDate = date || new Date();
  const dayOfWeek = targetDate.toLocaleLowerCase('en-US', { weekday: 'long' });

  return (this.openingHours || []).find(hours =>
    hours.day.toLowerCase() === dayOfWeek ||
    (hours.date && new Date(hours.date).toDateString() === targetDate.toDateString())
  );
};

Exhibition.prototype.isOpen = function(date) {
  const hours = this.getOpeningHoursForDate(date);
  if (!hours) return false;

  const now = date || new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const openTime = hours.open.split(':').reduce((h, m) => h * 60 + parseInt(m));
  const closeTime = hours.close.split(':').reduce((h, m) => h * 60 + parseInt(m));

  return currentTime >= openTime && currentTime <= closeTime;
};

Exhibition.prototype.getNextOpeningTime = function() {
  const now = new Date();
  const today = now.toDateString();

  // Check today's remaining hours
  const todayHours = this.getOpeningHoursForDate(now);
  if (todayHours && !this.isOpen(now)) {
    const closeTime = new Date(today + ' ' + todayHours.close);
    if (closeTime > now) {
      return { date: today, time: todayHours.close };
    }
  }

  // Check next 7 days
  for (let i = 1; i <= 7; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + i);
    const hours = this.getOpeningHoursForDate(checkDate);

    if (hours) {
      return {
        date: checkDate.toDateString(),
        time: hours.open,
        day: checkDate.toLocaleDateString('en-US', { weekday: 'long' })
      };
    }
  }

  return null;
};

Exhibition.prototype.getExhibitionTypeInfo = function() {
  const typeInfo = {
    art_gallery: {
      label: 'Art Gallery',
      description: 'Traditional art exhibition space',
      icon: '🎨',
      color: 'bg-purple-100 text-purple-800'
    },
    trade_show: {
      label: 'Trade Show',
      description: 'Commercial exhibition with booths',
      icon: '🏪',
      color: 'bg-blue-100 text-blue-800'
    },
    museum_exhibit: {
      label: 'Museum Exhibit',
      description: 'Educational museum-style display',
      icon: '🏛️',
      color: 'bg-green-100 text-green-800'
    },
    photography: {
      label: 'Photography',
      description: 'Photography exhibition',
      icon: '📸',
      color: 'bg-gray-100 text-gray-800'
    },
    sculpture: {
      label: 'Sculpture',
      description: 'Three-dimensional art exhibition',
      icon: '🗿',
      color: 'bg-orange-100 text-orange-800'
    },
    interactive: {
      label: 'Interactive',
      description: 'Interactive art installation',
      icon: '🎮',
      color: 'bg-pink-100 text-pink-800'
    },
    historical: {
      label: 'Historical',
      description: 'Historical artifacts and documents',
      icon: '📜',
      color: 'bg-yellow-100 text-yellow-800'
    },
    cultural: {
      label: 'Cultural',
      description: 'Cultural heritage exhibition',
      icon: '🏺',
      color: 'bg-indigo-100 text-indigo-800'
    },
    educational: {
      label: 'Educational',
      description: 'Educational exhibits and displays',
      icon: '📚',
      color: 'bg-teal-100 text-teal-800'
    },
    commercial: {
      label: 'Commercial',
      description: 'Commercial product showcase',
      icon: '💼',
      color: 'bg-red-100 text-red-800'
    },
    virtual_reality: {
      label: 'Virtual Reality',
      description: 'VR-enabled exhibition',
      icon: '🥽',
      color: 'bg-cyan-100 text-cyan-800'
    },
    mixed_media: {
      label: 'Mixed Media',
      description: 'Multi-medium art exhibition',
      icon: '🎭',
      color: 'bg-lime-100 text-lime-800'
    }
  };

  return typeInfo[this.exhibitionType] || typeInfo.art_gallery;
};

// Static methods
Exhibition.getEventExhibitions = async function(eventId, options = {}) {
  const {
    status = 'published',
    exhibitionType,
    isFeatured,
    limit = 50,
    offset = 0
  } = options;

  const whereClause = { eventId };

  if (status) whereClause.status = status;
  if (exhibitionType) whereClause.exhibitionType = exhibitionType;
  if (isFeatured !== undefined) whereClause.isFeatured = isFeatured;

  return await this.findAndCountAll({
    where: whereClause,
    order: [
      ['isFeatured', 'DESC'],
      ['viewCount', 'DESC'],
      ['createdAt', 'DESC']
    ],
    limit,
    offset
  });
};

Exhibition.getFeaturedExhibitions = async function(limit = 10) {
  return await this.findAll({
    where: {
      status: 'published',
      isFeatured: true
    },
    order: [['viewCount', 'DESC']],
    limit
  });
};

Exhibition.getVirtualExhibitions = async function(options = {}) {
  const { limit = 20, offset = 0 } = options;

  return await this.findAndCountAll({
    where: {
      status: 'published',
      isVirtual: true
    },
    order: [['viewCount', 'DESC']],
    limit,
    offset
  });
};

Exhibition.searchExhibitions = async function(query, options = {}) {
  const { limit = 20, offset = 0, exhibitionType } = options;

  const whereClause = {
    status: 'published',
    [require('sequelize').Op.or]: [
      { title: { [require('sequelize').Op.iLike]: `%${query}%` } },
      { description: { [require('sequelize').Op.iLike]: `%${query}%` } },
      { tags: { [require('sequelize').Op.contains]: [query] } },
      { 'artists.name': { [require('sequelize').Op.iLike]: `%${query}%` } }
    ]
  };

  if (exhibitionType) whereClause.exhibitionType = exhibitionType;

  return await this.findAndCountAll({
    where: whereClause,
    order: [['viewCount', 'DESC']],
    limit,
    offset
  });
};

Exhibition.getTopRatedExhibitions = async function(limit = 10) {
  return await this.findAll({
    where: {
      status: 'published',
      rating: { [require('sequelize').Op.gte]: 4.0 },
      reviewCount: { [require('sequelize').Op.gte]: 5 }
    },
    order: [['rating', 'DESC']],
    limit
  });
};

Exhibition.getExhibitionsByType = async function(exhibitionType, limit = 20) {
  return await this.findAll({
    where: {
      status: 'published',
      exhibitionType
    },
    order: [['viewCount', 'DESC']],
    limit
  });
};

module.exports = Exhibition;
