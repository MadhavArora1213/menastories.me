const { Article, Category, Author, List, ListEntry, PowerListEntry, MediaKit, Download, Event, Admin } = require('../models');
const fs = require('fs').promises;
const path = require('path');

class RSSService {

  constructor() {
    this.feedPath = path.join(__dirname, '../../rss.xml');
    this.baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  }

  // Generate RSS feed XML
  async generateRSSFeed() {
    try {
      console.log('Starting RSS feed generation...');
      // Get regular articles
      const articles = await Article.findAll({
        where: { status: 'published' },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Author,
            as: 'primaryAuthor',
            attributes: ['id', 'name', 'title']
          }
        ],
        order: [['publishDate', 'DESC']],
        limit: 75 // Limit to recent 75 articles
      });

      // Get video articles
      const { VideoArticle } = require('../models');
      const videoArticles = await VideoArticle.findAll({
        where: { status: 'published' },
        include: [
          {
            model: Category,
            as: 'videoCategory',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Author,
            as: 'primaryAuthor',
            attributes: ['id', 'name', 'title']
          }
        ],
        order: [['publishDate', 'DESC']],
        limit: 75 // Limit to recent 75 video articles
      });

      // Get published lists
      const lists = await List.findAll({
        where: { status: 'published' },
        include: [
          {
            model: ListEntry,
            as: 'entries',
            where: { status: 'active' },
            required: false,
            attributes: ['id', 'name', 'rank', 'designation', 'company']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 50 // Limit to recent 50 lists
      });

      // Get published power lists
      const powerLists = await List.findAll({
        where: { status: 'published' },
        include: [
          {
            model: PowerListEntry,
            as: 'powerListEntries',
            where: { status: 'active' },
            required: false,
            attributes: ['id', 'name', 'rank', 'designation', 'organization', 'category', 'achievements']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 50 // Limit to recent 50 power lists
      });

      // Get published media kits
      console.log('Fetching published media kits...');
      const mediaKits = await MediaKit.findAll({
        where: { status: 'published' },
        include: [
          {
            model: Admin,
            as: 'creator',
            attributes: ['id', 'name']
          }
        ],
        order: [['publishDate', 'DESC']],
        limit: 25 // Limit to recent 25 media kits
      });
      console.log('Found', mediaKits.length, 'published media kits');

      // Get published downloads
      const downloads = await Download.findAll({
        where: { status: 'published' },
        order: [['createdAt', 'DESC']],
        limit: 50 // Limit to recent 50 downloads
      });

      // Get published events
      const events = await Event.findAll({
        where: { status: 'published' },
        include: [
          {
            model: require('../models').Admin,
            as: 'author',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 50 // Limit to recent 50 events
      });

      // Combine and sort by publish date
      const allArticles = [
        ...articles.map(article => ({ ...article.toJSON(), type: 'article' })),
        ...videoArticles.map(videoArticle => ({ ...videoArticle, type: 'video' })),
        ...lists.map(list => ({ ...list.toJSON(), type: 'list' })),
        ...powerLists.map(powerList => ({ ...powerList.toJSON(), type: 'power-list' })),
        ...mediaKits.map(mediaKit => ({ ...mediaKit.toJSON(), type: 'media-kit' })),
        ...downloads.map(download => ({ ...download.toJSON(), type: 'download' })),
        ...events.map(event => ({ ...event.toJSON(), type: 'event' }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const rssXml = this.buildRSSXML(allArticles);

      // Ensure directory exists
      await fs.mkdir(path.dirname(this.feedPath), { recursive: true });

      // Write RSS feed to file
      await fs.writeFile(this.feedPath, rssXml, 'utf8');

      console.log('RSS feed generated successfully');
      return true;
    } catch (error) {
      console.error('Error generating RSS feed:', error);
      throw error;
    }
  }

  // Build RSS XML structure
  buildRSSXML(articles) {
    const lastBuildDate = new Date().toUTCString();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">\n';
    xml += '<channel>\n';
    xml += '<title>Magazine RSS Feed</title>\n';
    xml += '<description>Latest articles and videos from our magazine</description>\n';
    xml += `<link>${this.baseUrl}</link>\n`;
    xml += `<atom:link href="${this.baseUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;
    xml += `<lastBuildDate>${lastBuildDate}</lastBuildDate>\n`;
    xml += '<language>en-us</language>\n';

    articles.forEach(article => {
      xml += '<item>\n';

      // Title
      xml += `<title><![CDATA[${this.escapeXml(article.title)}]]></title>\n`;

      // Description
      xml += `<description><![CDATA[${this.escapeXml(article.excerpt || article.description || '')}]]></description>\n`;

      // Link and GUID
      if (article.type === 'video') {
        xml += `<link>${this.baseUrl}/video-articles/${article.slug}</link>\n`;
        xml += `<guid>${this.baseUrl}/video-articles/${article.slug}</guid>\n`;
      } else if (article.type === 'list') {
        xml += `<link>${this.baseUrl}/list/${article.slug}</link>\n`;
        xml += `<guid>${this.baseUrl}/list/${article.slug}</guid>\n`;
      } else if (article.type === 'power-list') {
        xml += `<link>${this.baseUrl}/power-list/${article.slug}</link>\n`;
        xml += `<guid>${this.baseUrl}/power-list/${article.slug}</guid>\n`;
      } else if (article.type === 'media-kit') {
        xml += `<link>${this.baseUrl}/media-kit/${article.slug}</link>\n`;
        xml += `<guid>${this.baseUrl}/media-kit/${article.slug}</guid>\n`;
      } else if (article.type === 'download') {
        xml += `<link>${this.baseUrl}/downloads</link>\n`;
        xml += `<guid>${this.baseUrl}/downloads/${article.id}</guid>\n`;
      } else if (article.type === 'event') {
        xml += `<link>${this.baseUrl}/events/${article.slug}</link>\n`;
        xml += `<guid>${this.baseUrl}/events/${article.slug}</guid>\n`;
      } else {
        xml += `<link>${this.baseUrl}/article/${article.id}</link>\n`;
        xml += `<guid>${this.baseUrl}/article/${article.id}</guid>\n`;
      }

      // Publication date
      xml += `<pubDate>${new Date(article.publishDate || article.createdAt).toUTCString()}</pubDate>\n`;

      // Author
      if (article.primaryAuthor) {
        xml += `<author><![CDATA[${this.escapeXml(article.primaryAuthor.name)}]]></author>\n`;
      }

      // Category
      let categoryName = '';
      if (article.type === 'video') {
        categoryName = article.videoCategory?.name;
      } else if (article.type === 'list') {
        categoryName = article.category || 'Lists';
      } else if (article.type === 'power-list') {
        categoryName = article.category || 'Power Lists';
      } else if (article.type === 'media-kit') {
        categoryName = 'Media Kit';
      } else if (article.type === 'download') {
        categoryName = article.category || 'Downloads';
      } else if (article.type === 'event') {
        categoryName = article.category || 'Events';
      } else {
        categoryName = article.category?.name;
      }
      if (categoryName) {
        xml += `<category><![CDATA[${this.escapeXml(categoryName)}]]></category>\n`;
      }

      // Tags
      if (article.tags && article.tags.length > 0) {
        article.tags.forEach(tag => {
          xml += `<category><![CDATA[${this.escapeXml(tag)}]]></category>\n`;
        });
      }

      // Enhanced metadata fields
      if (article.nationality) {
        xml += `<category><![CDATA[Nationality: ${this.escapeXml(article.nationality)}]]></category>\n`;
      }
      if (article.industry) {
        xml += `<category><![CDATA[Industry: ${this.escapeXml(article.industry)}]]></category>\n`;
      }
      if (article.position) {
        xml += `<category><![CDATA[Position: ${this.escapeXml(article.position)}]]></category>\n`;
      }
      if (article.writerName) {
        xml += `<dc:creator><![CDATA[${this.escapeXml(article.writerName)}]]></dc:creator>\n`;
      }

      // Video-specific elements for video articles
      if (article.type === 'video' && article.youtubeUrl) {
        const videoId = this.extractYouTubeVideoId(article.youtubeUrl);
        if (videoId) {
          const thumbnailUrl = article.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          xml += `<media:thumbnail url="${thumbnailUrl}" />\n`;
          xml += `<media:content url="${article.youtubeUrl}" type="application/x-shockwave-flash" />\n`;
          xml += `<media:description><![CDATA[${this.escapeXml(article.excerpt || article.description || '')}]]></media:description>\n`;
        }
      }

      // List-specific elements
      if (article.type === 'list' && article.entries && article.entries.length > 0) {
        // Add top entries as description
        const topEntries = article.entries.slice(0, 5).map(entry =>
          `${entry.rank || ''}. ${entry.name}${entry.designation ? ` - ${entry.designation}` : ''}${entry.company ? ` (${entry.company})` : ''}`
        ).join('\n');

        xml += `<media:description><![CDATA[${this.escapeXml(`Top entries from this list:\n${topEntries}`)}]]></media:description>\n`;

        // Add list metadata
        xml += `<category><![CDATA[Lists]]></category>\n`;
        if (article.year) {
          xml += `<category><![CDATA[${article.year}]]></category>\n`;
        }
      }

      // Power List-specific elements
      if (article.type === 'power-list' && article.powerListEntries && article.powerListEntries.length > 0) {
        // Add top entries as description
        const topEntries = article.powerListEntries.slice(0, 5).map(entry =>
          `${entry.rank || ''}. ${entry.name}${entry.designation ? ` - ${entry.designation}` : ''}${entry.organization ? ` (${entry.organization})` : ''}${entry.category ? ` [${entry.category}]` : ''}`
        ).join('\n');

        xml += `<media:description><![CDATA[${this.escapeXml(`Top entries from this power list:\n${topEntries}`)}]]></media:description>\n`;

        // Add power list metadata
        xml += `<category><![CDATA[Power Lists]]></category>\n`;
        if (article.year) {
          xml += `<category><![CDATA[${article.year}]]></category>\n`;
        }
        if (article.category) {
          xml += `<category><![CDATA[${article.category}]]></category>\n`;
        }
      }

      // Media Kit-specific elements
      if (article.type === 'media-kit') {
        // Add media kit metadata
        xml += `<category><![CDATA[Media Kit]]></category>\n`;

        // Add keywords if available
        if (article.keywords && article.keywords.length > 0) {
          article.keywords.forEach(keyword => {
            xml += `<category><![CDATA[${this.escapeXml(keyword)}]]></category>\n`;
          });
        }
      }

      // Download-specific elements
      if (article.type === 'download') {
        // Add download metadata
        xml += `<category><![CDATA[Downloads]]></category>\n`;

        // Add file type and size information
        if (article.fileType) {
          xml += `<category><![CDATA[File Type: ${this.escapeXml(article.fileType.toUpperCase())}]]></category>\n`;
        }
        if (article.fileSize) {
          const sizeInMB = (article.fileSize / (1024 * 1024)).toFixed(2);
          xml += `<category><![CDATA[Size: ${sizeInMB} MB]]></category>\n`;
        }

        // Add tags if available
        if (article.tags && article.tags.length > 0) {
          article.tags.forEach(tag => {
            xml += `<category><![CDATA[${this.escapeXml(tag)}]]></category>\n`;
          });
        }

        // Add download count
        if (article.downloadCount) {
          xml += `<category><![CDATA[${article.downloadCount} downloads]]></category>\n`;
        }
      }

      // Event-specific elements
      if (article.type === 'event') {
        // Add event metadata
        xml += `<category><![CDATA[Events]]></category>\n`;

        // Add event type
        if (article.eventType) {
          xml += `<category><![CDATA[Event Type: ${this.escapeXml(article.eventType)}]]></category>\n`;
        }

        // Add event date
        if (article.startDate) {
          xml += `<category><![CDATA[Event Date: ${new Date(article.startDate).toLocaleDateString()}]]></category>\n`;
        }

        // Add location info
        if (article.venue && article.venue.city) {
          xml += `<category><![CDATA[Location: ${this.escapeXml(article.venue.city)}]]></category>\n`;
        }

        // Add virtual indicator
        if (article.isVirtual) {
          xml += `<category><![CDATA[Virtual Event]]></category>\n`;
        }

        // Add capacity
        if (article.capacity) {
          xml += `<category><![CDATA[Capacity: ${article.capacity}]]></category>\n`;
        }

        // Add price if available
        if (article.price && article.price > 0) {
          xml += `<category><![CDATA[Price: ${article.currency || 'USD'} ${article.price}]]></category>\n`;
        }
      }

      xml += '</item>\n';
    });

    xml += '</channel>\n';
    xml += '</rss>';

    return xml;
  }

  // Escape XML special characters
  escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '<';
        case '>': return '>';
        case '&': return '&';
        case "'": return "'";
        case '"': return '"';
        default: return c;
      }
    });
  }

  // Get RSS feed content
  async getRSSFeed() {
    try {
      const feedContent = await fs.readFile(this.feedPath, 'utf8');
      return feedContent;
    } catch (error) {
      // If file doesn't exist, generate it
      await this.generateRSSFeed();
      return await fs.readFile(this.feedPath, 'utf8');
    }
  }

  // Extract YouTube video ID from URL
  extractYouTubeVideoId(url) {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  // Update RSS feed (called after article changes)
  async updateRSSFeed() {
    try {
      console.log('updateRSSFeed called - starting RSS generation');
      await this.generateRSSFeed();
      console.log('RSS feed updated successfully');
    } catch (error) {
      console.error('Error updating RSS feed:', error);
    }
  }
}

module.exports = new RSSService();