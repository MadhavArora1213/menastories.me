const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Initialize all models
const Admin = require('./Admin');
const AdminLoginLog = require('./AdminLoginLog');
const Role = require('./Role');
const Permission = require('./Permission');
const Article = require('./Article')(sequelize);
const Author = require('./Author')(sequelize);
const ArticleAssignment = require('./ArticleAssignment');
const ArticleRevision = require('./ArticleRevision');
const ArticleComment = require('./ArticleComment');
const Category = require('./Category');
const Tag = require('./Tag');
const Subcategory = require('./Subcategory');
const User = require('./User');
const UserArticleInteraction = require('./UserArticleInteraction');
const Event = require('./Event');
const EventRegistration = require('./EventRegistration');
const EventUpdate = require('./EventUpdate');
const Exhibition = require('./Exhibition');
const Newsletter = require('./Newsletter');
const Otp = require('./Otp');
const Media = require('./Media');
const MediaFolder = require('./MediaFolder');
const SpecialFeature = require('./SpecialFeature');
const ContentMetric = require('./ContentMetric');
const ContentTag = require('./ContentTag');
const SavedSearch = require('./SavedSearch');
const SearchAnalytics = require('./SearchAnalytics');
const MediaUsage = require('./MediaUsage');

// Analytics models
const SEOAnalytics = require('./SEOAnalytics');
const SocialAnalytics = require('./SocialAnalytics');
const PerformanceMetrics = require('./PerformanceMetrics');
const EventAnalytics = require('./EventAnalytics');
const FlipbookAnalytics = require('./FlipbookAnalytics');
const DownloadAnalytics = require('./DownloadAnalytics');
const WebsiteAnalytics = require('./WebsiteAnalytics');
const UserEngagementAnalytics = require('./UserEngagementAnalytics');

// Security models
const SecurityLog = require('./SecurityLog');
const { SecuritySettings, defaultSettings } = require('./SecuritySettings');
const SecurityIncident = require('./SecurityIncident');
const BackupLog = require('./BackupLog');
const ThreatIntelligence = require('./ThreatIntelligence');

// SEO and Performance models
const SEOMetadata = require('./SEOMetadata');
const Sitemap = require('./Sitemap');
const SchemaMarkup = require('./SchemaMarkup');

// Video models
const VideoArticle = require('./VideoArticle')(sequelize);
const VideoPlaylist = require('./VideoPlaylist');
const VideoAnalytics = require('./VideoAnalytics');
const VideoComment = require('./VideoComment');

// Flipbook models
const FlipbookMagazine = require('./FlipbookMagazine');
const FlipbookPage = require('./FlipbookPage');

// Newsletter models
const NewsletterSubscriber = require('./NewsletterSubscriber');
const NewsletterTemplate = require('./NewsletterTemplate');
const NewsletterCampaign = require('./NewsletterCampaign');
const NewsletterAnalytics = require('./NewsletterAnalytics');
const WhatsAppCampaign = require('./WhatsAppCampaign');

// Initialize new models with the proper pattern
const Comment = require('./Comment')(sequelize);
const ArticleView = require('./ArticleView')(sequelize);
const ArticleShare = require('./ArticleShare')(sequelize);
const CommentVote = require('./CommentVote')(sequelize);
const CommentReport = require('./CommentReport')(sequelize);
const CommentOTP = require('./CommentOTP')(sequelize);
const VideoArticleView = require('./VideoArticleView')(sequelize);
const VideoArticleTag = require('./VideoArticleTag')(sequelize);
const MediaKit = require('./MediaKit')(sequelize);
const Download = require('./Download')(sequelize);
const File = require('./File');

// List management models
const List = require('./List')(sequelize);
const ListEntry = require('./ListEntry')(sequelize);
const PowerListEntry = require('./PowerListEntry')(sequelize);

// Create junction tables
const ArticleCategory = sequelize.define('ArticleCategory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  articleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Articles',
      key: 'id'
    }
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id'
    }
  }
}, {
  tableName: 'ArticleCategories',
  timestamps: true
});

const ArticleTag = sequelize.define('ArticleTag', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  articleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Articles',
      key: 'id'
    }
  },
  tagId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Tags',
      key: 'id'
    }
  }
}, {
  tableName: 'ArticleTags',
  timestamps: true
});

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Roles',
      key: 'id'
    }
  },
  permissionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Permissions',
      key: 'id'
    }
  }
}, {
  tableName: 'RolePermissions',
  timestamps: true
});

const ArticleAuthor = sequelize.define('ArticleAuthor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  articleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Articles',
      key: 'id'
    }
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Authors',
      key: 'id'
    }
  }
}, {
  tableName: 'ArticleAuthors',
  timestamps: true
});

// Create models object for associations
const models = {
  Admin,
  AdminLoginLog,
  Role,
  Permission,
  Article,
  Author,
  ArticleAssignment,
  ArticleRevision,
  ArticleComment,
  Category,
  Tag,
  Subcategory,
  Comment,
  User,
  UserArticleInteraction,
  Event,
  EventRegistration,
  EventUpdate,
  Exhibition,
  Newsletter,
  Otp,
  Media,
  MediaFolder,
  ArticleView,
  ArticleShare,
  CommentVote,
  CommentReport,
  CommentOTP,
  VideoArticleView,
  VideoArticleTag,
  MediaKit,
  Download,
  File,
  SpecialFeature,
  // List management models
  List,
  ListEntry,
  PowerListEntry,
  ContentMetric,
  ContentTag,
  SavedSearch,
  SearchAnalytics,
  MediaUsage,
  // Analytics models
  SEOAnalytics,
  SocialAnalytics,
  PerformanceMetrics,
  EventAnalytics,
  FlipbookAnalytics,
  DownloadAnalytics,
  WebsiteAnalytics,
  UserEngagementAnalytics,
  // Security models
  SecurityLog,
  SecuritySettings,
  SecurityIncident,
  BackupLog,
  ThreatIntelligence,
  // SEO and Performance models
  SEOMetadata,
  Sitemap,
  SchemaMarkup,
  // Video models
  VideoArticle,
  VideoPlaylist,
  VideoAnalytics,
  VideoComment,
  // Flipbook models
  FlipbookMagazine,
  FlipbookPage,
  // Newsletter models
  NewsletterSubscriber,
  NewsletterTemplate,
  NewsletterCampaign,
  NewsletterAnalytics,
  WhatsAppCampaign,
  ArticleCategory,
  ArticleTag,
  ArticleAuthor,
  RolePermission
};

// Setup associations for models that use the new pattern
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Legacy associations for older models
// Admin-Role associations
Admin.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(Admin, { foreignKey: 'roleId', as: 'admins' });

// Admin-AdminLoginLog associations
Admin.hasMany(AdminLoginLog, { foreignKey: 'adminId', as: 'loginLogs' });
AdminLoginLog.belongsTo(Admin, { foreignKey: 'adminId', as: 'admin' });

// User-Role associations
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

// Event associations
Event.belongsTo(Admin, { foreignKey: 'createdBy', as: 'author' });
Event.belongsTo(User, { foreignKey: 'submittedBy', as: 'submitter' });
Event.belongsTo(Admin, { foreignKey: 'reviewedBy', as: 'reviewer' });
Admin.hasMany(Event, { foreignKey: 'createdBy', as: 'events' });
Admin.hasMany(Event, { foreignKey: 'reviewedBy', as: 'reviewedEvents' });
User.hasMany(Event, { foreignKey: 'submittedBy', as: 'submittedEvents' });

// EventRegistration associations
EventRegistration.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
EventRegistration.belongsTo(Admin, { foreignKey: 'userId', as: 'user' });
Event.hasMany(EventRegistration, { foreignKey: 'eventId', as: 'registrations' });
Admin.hasMany(EventRegistration, { foreignKey: 'userId', as: 'eventRegistrations' });

// EventUpdate associations
EventUpdate.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
EventUpdate.belongsTo(Admin, { foreignKey: 'createdBy', as: 'author' });
Event.hasMany(EventUpdate, { foreignKey: 'eventId', as: 'updates' });
Admin.hasMany(EventUpdate, { foreignKey: 'createdBy', as: 'eventUpdates' });

// Exhibition associations
Exhibition.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Exhibition.belongsTo(Admin, { foreignKey: 'createdBy', as: 'author' });
Event.hasMany(Exhibition, { foreignKey: 'eventId', as: 'exhibitions' });
Admin.hasMany(Exhibition, { foreignKey: 'createdBy', as: 'exhibitions' });

// UserArticleInteraction associations
UserArticleInteraction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserArticleInteraction.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });
User.hasMany(UserArticleInteraction, { foreignKey: 'userId', as: 'articleInteractions' });
Article.hasMany(UserArticleInteraction, { foreignKey: 'articleId', as: 'userInteractions' });

// Article-Admin associations (main author relationship)
Article.belongsTo(Admin, { as: 'author', foreignKey: 'authorId' });
Admin.hasMany(Article, { foreignKey: 'authorId', as: 'articles' });

// Category-Subcategory associations
Category.hasMany(Subcategory, {
  foreignKey: 'categoryId',
  as: 'categorySubcategories'
});

// Article-Category associations (many-to-many through ArticleCategories)
// Note: Direct foreign key relationship removed to avoid conflicts
// Article.belongsTo(Category, {
//   foreignKey: 'categoryId',
//   as: 'category'
// });
// Category.hasMany(Article, {
//   foreignKey: 'categoryId',
//   as: 'articles'
// });

// Article-Tag many-to-many associations
Article.belongsToMany(Tag, {
  through: ArticleTag,
  foreignKey: 'articleId',
  otherKey: 'tagId',
  as: 'associatedTags'
});
Tag.belongsToMany(Article, {
  through: ArticleTag,
  foreignKey: 'tagId',
  otherKey: 'articleId',
  as: 'articles'
});

// Role-Permission associations
Role.belongsToMany(Permission, { 
  through: RolePermission,
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions'
});
Permission.belongsToMany(Role, { 
  through: RolePermission,
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles'
});

// Article associations for metrics and content tags (if still needed)
Article.belongsToMany(Tag, { 
  through: ContentTag,
  foreignKey: 'contentId',
  otherKey: 'tagId',
  constraints: false,
  scope: {
    contentType: 'article'
  },
  as: 'contentTags'
});

Tag.belongsToMany(Article, {
  through: ContentTag,
  foreignKey: 'tagId',
  otherKey: 'contentId',
  constraints: false,
  as: 'taggedContent'
});

// Associate Metrics with Articles
Article.hasMany(ContentMetric, {
  foreignKey: 'contentId',
  constraints: false,
  scope: {
    contentType: 'article'
  },
  as: 'metrics'
});

ContentMetric.belongsTo(Article, {
  foreignKey: 'contentId',
  constraints: false,
  as: 'article'
});

// SavedSearch associations
SavedSearch.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(SavedSearch, { foreignKey: 'userId', as: 'savedSearches' });

// SearchAnalytics associations
SearchAnalytics.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(SearchAnalytics, { foreignKey: 'userId', as: 'searchAnalytics' });

// Media associations
Media.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
User.hasMany(Media, { foreignKey: 'uploadedBy', as: 'uploadedMedia' });

// MediaFolder associations
MediaFolder.belongsTo(MediaFolder, { foreignKey: 'parentId', as: 'parent' });
MediaFolder.hasMany(MediaFolder, { foreignKey: 'parentId', as: 'children' });
MediaFolder.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
MediaFolder.belongsTo(User, { foreignKey: 'lastModifiedBy', as: 'lastModifier' });
User.hasMany(MediaFolder, { foreignKey: 'createdBy', as: 'createdFolders' });

// Media-MediaFolder associations
Media.belongsTo(MediaFolder, { foreignKey: 'folderId', as: 'mediaFolder' });
MediaFolder.hasMany(Media, { foreignKey: 'folderId', as: 'media' });

// MediaUsage associations
MediaUsage.belongsTo(Media, { foreignKey: 'mediaId', as: 'media' });
MediaUsage.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Media.hasMany(MediaUsage, { foreignKey: 'mediaId', as: 'usage' });
User.hasMany(MediaUsage, { foreignKey: 'createdBy', as: 'mediaUsage' });

// Newsletter associations
// NewsletterSubscriber associations
NewsletterSubscriber.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(NewsletterSubscriber, { foreignKey: 'userId', as: 'newsletterSubscription' });

// NewsletterTemplate associations
NewsletterTemplate.belongsTo(Admin, { foreignKey: 'createdBy', as: 'creator' });
NewsletterTemplate.belongsTo(Admin, { foreignKey: 'lastModifiedBy', as: 'lastModifier' });
Admin.hasMany(NewsletterTemplate, { foreignKey: 'createdBy', as: 'createdTemplates' });
Admin.hasMany(NewsletterTemplate, { foreignKey: 'lastModifiedBy', as: 'modifiedTemplates' });

// NewsletterCampaign associations
NewsletterCampaign.belongsTo(NewsletterTemplate, { foreignKey: 'templateId', as: 'template' });
NewsletterCampaign.belongsTo(Admin, { foreignKey: 'createdBy', as: 'creator' });
NewsletterTemplate.hasMany(NewsletterCampaign, { foreignKey: 'templateId', as: 'campaigns' });
Admin.hasMany(NewsletterCampaign, { foreignKey: 'createdBy', as: 'newsletterCampaigns' });

// NewsletterAnalytics associations
NewsletterAnalytics.belongsTo(NewsletterCampaign, { foreignKey: 'campaignId', as: 'campaign' });
NewsletterAnalytics.belongsTo(NewsletterSubscriber, { foreignKey: 'subscriberId', as: 'subscriber' });
NewsletterCampaign.hasMany(NewsletterAnalytics, { foreignKey: 'campaignId', as: 'analytics' });
NewsletterSubscriber.hasMany(NewsletterAnalytics, { foreignKey: 'subscriberId', as: 'analytics' });

// WhatsAppCampaign associations
WhatsAppCampaign.belongsTo(Admin, { foreignKey: 'createdBy', as: 'creator' });
Admin.hasMany(WhatsAppCampaign, { foreignKey: 'createdBy', as: 'whatsappCampaigns' });

// Article associations with newsletter (for featured articles)
NewsletterCampaign.belongsToMany(Article, {
  through: 'NewsletterCampaignArticles',
  foreignKey: 'campaignId',
  otherKey: 'articleId',
  as: 'associatedArticles'
});
Article.belongsToMany(NewsletterCampaign, {
  through: 'NewsletterCampaignArticles',
  foreignKey: 'articleId',
  otherKey: 'campaignId',
  as: 'newsletterCampaigns'
});

// Security model associations
SecurityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
SecurityLog.belongsTo(Admin, { foreignKey: 'userId', as: 'admin' });
User.hasMany(SecurityLog, { foreignKey: 'userId', as: 'securityLogs' });
Admin.hasMany(SecurityLog, { foreignKey: 'userId', as: 'securityLogs' });

SecurityIncident.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedUser' });
SecurityIncident.belongsTo(Admin, { foreignKey: 'assignedTo', as: 'assignedAdmin' });
User.hasMany(SecurityIncident, { foreignKey: 'assignedTo', as: 'assignedIncidents' });
Admin.hasMany(SecurityIncident, { foreignKey: 'assignedTo', as: 'assignedIncidents' });

BackupLog.belongsTo(User, { foreignKey: 'initiatedBy', as: 'initiator' });
BackupLog.belongsTo(Admin, { foreignKey: 'initiatedBy', as: 'adminInitiator' });
BackupLog.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });
BackupLog.belongsTo(Admin, { foreignKey: 'verifiedBy', as: 'adminVerifier' });
User.hasMany(BackupLog, { foreignKey: 'initiatedBy', as: 'initiatedBackups' });
User.hasMany(BackupLog, { foreignKey: 'verifiedBy', as: 'verifiedBackups' });
Admin.hasMany(BackupLog, { foreignKey: 'initiatedBy', as: 'initiatedBackups' });
Admin.hasMany(BackupLog, { foreignKey: 'verifiedBy', as: 'verifiedBackups' });

// SecuritySettings associations
SecuritySettings.belongsTo(User, { foreignKey: 'lastModifiedBy', as: 'lastModifiedUser' });
SecuritySettings.belongsTo(Admin, { foreignKey: 'lastModifiedBy', as: 'lastModifiedAdmin' });
User.hasMany(SecuritySettings, { foreignKey: 'lastModifiedBy', as: 'modifiedSecuritySettings' });
Admin.hasMany(SecuritySettings, { foreignKey: 'lastModifiedBy', as: 'modifiedSecuritySettings' });

// Video model associations
// VideoArticle associations are handled by the model's associate function
// VideoArticle.belongsTo(User, { foreignKey: 'createdBy', as: 'author' });
// VideoArticle.belongsTo(Category, { foreignKey: 'categoryId', as: 'videoCategory' });
// User.hasMany(VideoArticle, { foreignKey: 'createdBy', as: 'videoArticles' });
// Category.hasMany(VideoArticle, { foreignKey: 'categoryId', as: 'videoArticles' });

// VideoPlaylist associations
VideoPlaylist.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(VideoPlaylist, { foreignKey: 'createdBy', as: 'videoPlaylists' });

// VideoAnalytics associations
VideoAnalytics.belongsTo(VideoArticle, { foreignKey: 'videoId', as: 'video' });
VideoAnalytics.belongsTo(User, { foreignKey: 'userId', as: 'user' });
VideoArticle.hasMany(VideoAnalytics, { foreignKey: 'videoId', as: 'analytics' });
User.hasMany(VideoAnalytics, { foreignKey: 'userId', as: 'videoAnalytics' });

// VideoComment associations
VideoComment.belongsTo(VideoArticle, { foreignKey: 'videoId', as: 'video' });
VideoComment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
VideoComment.belongsTo(VideoComment, { foreignKey: 'parentId', as: 'parent' });
VideoComment.hasMany(VideoComment, { foreignKey: 'parentId', as: 'replies' });
// VideoArticle.hasMany(VideoComment, { foreignKey: 'videoId', as: 'comments' }); // Handled by VideoArticle associate function
User.hasMany(VideoComment, { foreignKey: 'userId', as: 'videoComments' });

// VideoPlaylist-VideoArticle many-to-many associations
VideoPlaylist.belongsToMany(VideoArticle, {
  through: 'VideoPlaylistVideos',
  foreignKey: 'playlistId',
  otherKey: 'videoId',
  as: 'videos'
});
VideoArticle.belongsToMany(VideoPlaylist, {
  through: 'VideoPlaylistVideos',
  foreignKey: 'videoId',
  otherKey: 'playlistId',
  as: 'playlists'
});

// VideoArticle-Tag many-to-many associations are handled by the model's associate function
// VideoArticle.belongsToMany(Tag, {
//   through: VideoArticleTag,
//   foreignKey: 'videoArticleId',
//   otherKey: 'tagId',
//   as: 'associatedTags'
// });
// Tag.belongsToMany(VideoArticle, {
//   through: VideoArticleTag,
//   foreignKey: 'tagId',
//   otherKey: 'videoArticleId',
//   as: 'videoArticles'
// });

// List-ListEntry associations are handled in the model files

// Flipbook model associations
// FlipbookMagazine associations
FlipbookMagazine.belongsTo(User, { foreignKey: 'createdBy', as: 'author' });
User.hasMany(FlipbookMagazine, { foreignKey: 'createdBy', as: 'flipbookMagazines' });

// FlipbookPage associations
FlipbookPage.belongsTo(FlipbookMagazine, { foreignKey: 'magazineId', as: 'magazine' });
FlipbookMagazine.hasMany(FlipbookPage, { foreignKey: 'magazineId', as: 'pages' });

// FlipbookMagazine-Tag many-to-many associations
FlipbookMagazine.belongsToMany(Tag, {
  through: 'FlipbookMagazineTags',
  foreignKey: 'magazineId',
  otherKey: 'tagId',
  as: 'associatedTags'
});
Tag.belongsToMany(FlipbookMagazine, {
  through: 'FlipbookMagazineTags',
  foreignKey: 'tagId',
  otherKey: 'magazineId',
  as: 'flipbookMagazines'
});

// File associations
File.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
User.hasMany(File, { foreignKey: 'uploadedBy', as: 'uploadedFiles' });

// Add models to sequelize for global access
sequelize.models = models;

module.exports = {
  sequelize,
  User,
  Article,
  Comment,
  CommentOTP,
  Admin,
  AdminLoginLog,
  Role,
  Permission,
  Author,
  ArticleAssignment,
  ArticleRevision,
  ArticleComment,
  Category,
  Tag,
  Subcategory,
  UserArticleInteraction,
  Event,
  EventRegistration,
  EventUpdate,
  Exhibition,
  Newsletter,
  Otp,
  Media,
  MediaFolder,
  ArticleView,
  ArticleShare,
  CommentVote,
  CommentReport,
  VideoArticleView,
  VideoArticleTag,
  MediaKit,
  Download,
  File,
  SpecialFeature,
  // List management models
  List,
  ListEntry,
  PowerListEntry,
  ContentMetric,
  ContentTag,
  SavedSearch,
  SearchAnalytics,
  MediaUsage,
  // Analytics models
  SEOAnalytics,
  SocialAnalytics,
  PerformanceMetrics,
  EventAnalytics,
  FlipbookAnalytics,
  DownloadAnalytics,
  WebsiteAnalytics,
  UserEngagementAnalytics,
  // Security models
  SecurityLog,
  SecuritySettings,
  SecurityIncident,
  BackupLog,
  ThreatIntelligence,
  // SEO and Performance models
  SEOMetadata,
  Sitemap,
  SchemaMarkup,
  // Video models
  VideoArticle,
  VideoPlaylist,
  VideoAnalytics,
  VideoComment,
  // Flipbook models
  FlipbookMagazine,
  FlipbookPage,
  // Newsletter models
  NewsletterSubscriber,
  NewsletterTemplate,
  NewsletterCampaign,
  NewsletterAnalytics,
  WhatsAppCampaign,
  ArticleCategory,
  ArticleTag,
  ArticleAuthor,
  RolePermission,
  defaultSecuritySettings: defaultSettings
};