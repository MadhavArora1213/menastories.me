const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const { ImageUploadService } = require('./imageUploadService');
const { Article, Category, Author, Admin } = require('../models');
const slugify = require('slugify');
const rssService = require('./rssService');

class BulkUploadService {
  constructor() {
    this.imageService = new ImageUploadService();
    this.drive = null;
    this.initializeGoogleDrive();
  }

  /**
   * Initialize Google Drive API client
   */
  initializeGoogleDrive() {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS || '{}');
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.readonly']
      });
      this.drive = google.drive({ version: 'v3', auth });
    } catch (error) {
      console.error('Failed to initialize Google Drive:', error);
    }
  }

  /**
   * Process bulk article upload from Google Drive
   * @param {string} driveLink - Google Drive folder link
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - Upload results
   */
  async processBulkUpload(driveLink, options = {}) {
    const results = {
      success: [],
      errors: [],
      total: 0,
      processed: 0,
      logs: []
    };

    console.log('🚀 Starting bulk upload process...');
    console.log('📋 Drive Link:', driveLink);
    console.log('⚙️ Options:', options);

    try {
      // Extract folder ID from Drive link
      console.log('🔗 Extracting folder ID from Drive link...');
      const folderId = this.extractFolderId(driveLink);
      if (!folderId) {
        const errorMsg = '❌ Invalid Google Drive link format';
        console.error(errorMsg);
        results.logs.push(errorMsg);
        throw new Error('Invalid Google Drive link');
      }
      console.log('✅ Folder ID extracted:', folderId);
      results.logs.push(`✅ Folder ID extracted: ${folderId}`);

      // Get all files from the Drive folder
      console.log('📁 Fetching files from Google Drive...');
      const files = await this.getDriveFiles(folderId);
      console.log(`📊 Found ${files.length} total files in Drive folder`);
      results.logs.push(`📊 Found ${files.length} total files in Drive folder`);

      const articleFolders = this.groupFilesByArticle(files);
      console.log(`📂 Found ${Object.keys(articleFolders).length} article folders:`, Object.keys(articleFolders));
      results.logs.push(`📂 Found ${Object.keys(articleFolders).length} article folders: ${Object.keys(articleFolders).join(', ')}`);

      results.total = Object.keys(articleFolders).length;

      // Process each article folder
      for (const [articleName, articleFiles] of Object.entries(articleFolders)) {
        console.log(`\n🔄 Processing article: ${articleName}`);
        results.logs.push(`🔄 Processing article: ${articleName}`);

        try {
          const articleData = await this.processArticleFolder(articleName, articleFiles, options);
          if (articleData) {
            console.log(`✅ Successfully processed: ${articleName}`);
            results.logs.push(`✅ Successfully processed: ${articleName}`);
            results.success.push(articleData);
          } else {
            const errorMsg = `❌ No data returned for: ${articleName}`;
            console.error(errorMsg);
            results.logs.push(errorMsg);
            results.errors.push({
              article: articleName,
              error: 'No data returned from processing',
              details: 'Article folder processing returned null'
            });
          }
        } catch (error) {
          const errorMsg = `❌ Error processing ${articleName}: ${error.message}`;
          console.error(errorMsg);
          console.error('Stack trace:', error.stack);
          results.logs.push(errorMsg);
          results.errors.push({
            article: articleName,
            error: error.message,
            details: error.stack,
            timestamp: new Date().toISOString()
          });
        }
        results.processed++;
        console.log(`📈 Progress: ${results.processed}/${results.total} articles processed`);
      }

      // Update RSS feed if any articles were successfully uploaded
      if (results.success.length > 0) {
        console.log('📰 Updating RSS feed...');
        try {
          await rssService.updateRSSFeed();
          console.log('✅ RSS feed updated successfully');
          results.logs.push('✅ RSS feed updated successfully');
        } catch (rssError) {
          console.error('❌ RSS feed update failed:', rssError);
          results.logs.push(`❌ RSS feed update failed: ${rssError.message}`);
        }
      }

      // Final summary
      console.log('\n📊 BULK UPLOAD SUMMARY:');
      console.log(`✅ Successful: ${results.success.length}`);
      console.log(`❌ Errors: ${results.errors.length}`);
      console.log(`📁 Total processed: ${results.processed}/${results.total}`);

      results.logs.push('\n📊 FINAL SUMMARY:');
      results.logs.push(`✅ Successful: ${results.success.length}`);
      results.logs.push(`❌ Errors: ${results.errors.length}`);
      results.logs.push(`📁 Total processed: ${results.processed}/${results.total}`);

    } catch (error) {
      const errorMsg = `💥 Critical bulk upload error: ${error.message}`;
      console.error(errorMsg);
      console.error('Stack trace:', error.stack);
      results.logs.push(errorMsg);
      results.logs.push(`Stack trace: ${error.stack}`);
      results.errors.push({
        article: 'General',
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      });
    }

    return results;
  }

  /**
   * Extract folder ID from Google Drive link
   * @param {string} driveLink - Google Drive link
   * @returns {string|null} - Folder ID
   */
  extractFolderId(driveLink) {
    const patterns = [
      /\/folders\/([a-zA-Z0-9-_]+)/,
      /id=([a-zA-Z0-9-_]+)/,
      /\/d\/([a-zA-Z0-9-_]+)/
    ];

    for (const pattern of patterns) {
      const match = driveLink.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Get all files from Google Drive folder
   * @param {string} folderId - Google Drive folder ID
   * @returns {Promise<Array>} - Array of file objects
   */
  async getDriveFiles(folderId) {
    if (!this.drive) {
      throw new Error('Google Drive API not initialized. Check GOOGLE_DRIVE_CREDENTIALS environment variable.');
    }

    console.log(`🔍 Fetching files from Google Drive folder: ${folderId}`);

    try {
      const files = [];
      let pageToken = null;
      let pageCount = 0;

      do {
        pageCount++;
        console.log(`📄 Fetching page ${pageCount} of files...`);

        const response = await this.drive.files.list({
          q: `'${folderId}' in parents and trashed = false`,
          fields: 'nextPageToken, files(id, name, mimeType, parents, size, modifiedTime)',
          pageToken: pageToken,
          pageSize: 100
        });

        const pageFiles = response.data.files || [];
        console.log(`📄 Found ${pageFiles.length} files in page ${pageCount}`);
        files.push(...pageFiles);

        pageToken = response.data.nextPageToken;
      } while (pageToken);

      console.log(`✅ Total files retrieved: ${files.length}`);

      // Log file details for debugging
      files.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.name} (${file.mimeType}) - ID: ${file.id}`);
      });

      return files;

    } catch (error) {
      console.error('❌ Google Drive API error:', error);
      if (error.code === 404) {
        throw new Error(`Google Drive folder not found. Check if the folder ID '${folderId}' is correct and the folder is shared publicly.`);
      } else if (error.code === 403) {
        throw new Error('Google Drive access denied. Check sharing permissions and API credentials.');
      } else if (error.code === 401) {
        throw new Error('Google Drive authentication failed. Check GOOGLE_DRIVE_CREDENTIALS environment variable.');
      } else {
        throw new Error(`Google Drive API error: ${error.message}`);
      }
    }
  }

  /**
   * Group files by article folder
   * @param {Array} files - Array of Drive files
   * @returns {Object} - Files grouped by article
   */
  groupFilesByArticle(files) {
    const articles = {};

    files.forEach(file => {
      // Check if it's an article folder (starts with ARTICLE_)
      if (file.mimeType === 'application/vnd.google-apps.folder' && file.name.startsWith('ARTICLE_')) {
        articles[file.name] = {
          folderId: file.id,
          files: []
        };
      }
    });

    // Group files under their respective article folders
    files.forEach(file => {
      if (file.parents && file.parents.length > 0) {
        const parentId = file.parents[0];
        const articleFolder = Object.values(articles).find(article => article.folderId === parentId);
        if (articleFolder) {
          articleFolder.files.push(file);
        }
      }
    });

    return articles;
  }

  /**
   * Process a single article folder
   * @param {string} articleName - Article folder name
   * @param {Object} articleFiles - Files in the article folder
   * @param {Object} options - Processing options
   * @returns {Promise<Object|null>} - Processed article data
   */
  async processArticleFolder(articleName, articleFiles, options = {}) {
    const { categoryId, authorId, createdBy } = options;

    console.log(`🔍 Processing folder: ${articleName}`);
    console.log(`📁 Files in folder:`, articleFiles.files.map(f => f.name));

    try {
      // Find the .docx file
      console.log(`📄 Looking for .docx file in ${articleName}...`);
      const docxFile = articleFiles.files.find(file =>
        file.name.endsWith('.docx') && file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );

      if (!docxFile) {
        const availableFiles = articleFiles.files.map(f => `${f.name} (${f.mimeType})`).join(', ');
        const errorMsg = `No .docx file found in ${articleName}. Available files: ${availableFiles}`;
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
      }

      console.log(`✅ Found .docx file: ${docxFile.name} (ID: ${docxFile.id})`);

      // Download and parse the .docx file
      console.log(`📥 Downloading and parsing .docx file...`);
      const docxContent = await this.downloadAndParseDocx(docxFile.id);
      console.log(`📖 Parsed content length: ${docxContent.length} characters`);

      const articleData = this.extractArticleData(docxContent, articleName);
      console.log(`📝 Extracted article data:`, {
        title: articleData.title,
        hasSubtitle: !!articleData.subtitle,
        contentLength: articleData.content.length,
        keywordsCount: articleData.keywords.length
      });

      // Process images
      console.log(`🖼️ Processing images...`);
      const imageUrls = await this.processArticleImages(articleFiles.files);
      console.log(`🖼️ Image processing results:`, {
        featured: !!imageUrls.featured,
        galleryCount: imageUrls.gallery.length
      });

      // Create the article
      console.log(`💾 Creating article in database...`);
      const article = await this.createArticle({
        ...articleData,
        categoryId,
        authorId,
        createdBy,
        featuredImage: imageUrls.featured || null,
        gallery: imageUrls.gallery,
        status: 'published', // Auto-publish bulk uploaded articles
        publishDate: new Date()
      });

      console.log(`✅ Article created successfully: ${article.title} (ID: ${article.id})`);

      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        status: article.status
      };

    } catch (error) {
      console.error(`💥 Error in processArticleFolder for ${articleName}:`, error);
      throw error; // Re-throw to be caught by the calling function
    }
  }

  /**
   * Download and parse .docx file
   * @param {string} fileId - Google Drive file ID
   * @returns {Promise<string>} - Parsed text content
   */
  async downloadAndParseDocx(fileId) {
    if (!this.drive) {
      throw new Error('Google Drive not initialized');
    }

    const response = await this.drive.files.get({
      fileId: fileId,
      alt: 'media'
    }, { responseType: 'arraybuffer' });

    // Save to temp file
    const tempPath = path.join(__dirname, '../temp', `temp-${Date.now()}.docx`);
    fs.writeFileSync(tempPath, Buffer.from(response.data));

    try {
      // Parse with mammoth
      const result = await mammoth.extractRawText({ path: tempPath });
      return result.value;
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  /**
   * Extract article data from parsed .docx content
   * @param {string} content - Raw text content
   * @param {string} articleName - Article folder name
   * @returns {Object} - Extracted article data
   */
  extractArticleData(content, articleName) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);

    let title = '';
    let subtitle = '';
    let articleContent = '';
    let description = '';
    let keywords = [];
    let metaTitle = '';
    let metaDescription = '';

    // Extract title (first non-empty line)
    if (lines.length > 0) {
      title = lines[0];
    }

    // Extract subtitle (second line if it looks like a subtitle)
    if (lines.length > 1 && lines[1].length < 100) {
      subtitle = lines[1];
    }

    // Find keywords line and extract content before it
    let contentEndIndex = lines.length;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().startsWith('keywords:')) {
        // Extract keywords
        const keywordsLine = lines[i].replace(/^keywords?:/i, '').trim();
        keywords = keywordsLine.split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0);

        contentEndIndex = i;
        break;
      }
    }

    // Extract content (lines between subtitle and keywords)
    const contentStart = subtitle ? 2 : 1;
    articleContent = lines.slice(contentStart, contentEndIndex).join('\n');

    // Generate description from first paragraph
    const firstParagraph = articleContent.split('\n\n')[0];
    if (firstParagraph) {
      description = firstParagraph.length > 200 ? firstParagraph.substring(0, 200) + '...' : firstParagraph;
    }

    // Generate excerpt
    const excerpt = articleContent.length > 200 ? articleContent.substring(0, 200) + '...' : articleContent;

    // Generate slug
    const slug = slugify(title || articleName, { lower: true, strict: true });

    // Set meta title and description
    metaTitle = title || articleName;
    metaDescription = excerpt || description;

    // Calculate reading time
    const wordCount = articleContent.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200);

    return {
      title: title || articleName,
      subtitle,
      content: articleContent,
      excerpt,
      description,
      slug,
      keywords,
      metaTitle,
      metaDescription,
      readingTime
    };
  }

  /**
   * Process article images
   * @param {Array} files - Array of files in article folder
   * @returns {Promise<Object>} - Processed image URLs
   */
  async processArticleImages(files) {
    const imageUrls = {
      featured: null,
      gallery: []
    };

    // Find PNG subfolder
    const pngFolder = files.find(file =>
      file.mimeType === 'application/vnd.google-apps.folder' && file.name.toLowerCase() === 'png'
    );

    if (!pngFolder) {
      return imageUrls;
    }

    // Get images from PNG folder
    const pngFiles = files.filter(file =>
      file.parents && file.parents.includes(pngFolder.id) &&
      file.mimeType.startsWith('image/')
    );

    // Sort images by name
    pngFiles.sort((a, b) => a.name.localeCompare(b.name));

    // Process featured image (first image or one named 'featured_image')
    const featuredImage = pngFiles.find(file =>
      file.name.toLowerCase().includes('featured_image')
    ) || pngFiles[0];

    if (featuredImage) {
      imageUrls.featured = await this.downloadAndProcessImage(featuredImage.id, featuredImage.name);
    }

    // Process gallery images (up to 4 additional images)
    const galleryImages = pngFiles.filter(file => file !== featuredImage).slice(0, 4);
    for (const image of galleryImages) {
      const imageUrl = await this.downloadAndProcessImage(image.id, image.name);
      if (imageUrl) {
        imageUrls.gallery.push({
          url: imageUrl,
          alt: `Gallery image for article`,
          caption: ''
        });
      }
    }

    return imageUrls;
  }

  /**
   * Download and process image from Google Drive
   * @param {string} fileId - Google Drive file ID
   * @param {string} filename - Original filename
   * @returns {Promise<string|null>} - Processed image URL
   */
  async downloadAndProcessImage(fileId, filename) {
    if (!this.drive) {
      return null;
    }

    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, { responseType: 'arraybuffer' });

      // Save to temp file
      const tempPath = path.join(__dirname, '../temp', `temp-image-${Date.now()}.png`);
      fs.writeFileSync(tempPath, Buffer.from(response.data));

      // Process image
      const processedFilename = await this.imageService.processImage(tempPath, {
        width: 1200,
        quality: 85,
        format: 'webp'
      });

      return this.imageService.generateImageUrl(processedFilename);
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    }
  }

  /**
   * Create article in database
   * @param {Object} articleData - Article data
   * @returns {Promise<Object>} - Created article
   */
  async createArticle(articleData) {
    // Ensure slug is unique
    let slug = articleData.slug;
    let counter = 1;
    while (await Article.findOne({ where: { slug } })) {
      slug = `${articleData.slug}-${counter}`;
      counter++;
    }
    articleData.slug = slug;

    // Set default author if not provided
    if (!articleData.authorId) {
      const defaultAuthor = await Author.findOne({ where: { isActive: true } });
      if (defaultAuthor) {
        articleData.authorId = defaultAuthor.id;
      }
    }

    // Set default category if not provided
    if (!articleData.categoryId) {
      const defaultCategory = await Category.findOne();
      if (defaultCategory) {
        articleData.categoryId = defaultCategory.id;
      }
    }

    // Ensure all Article model fields are populated
    const completeArticleData = {
      // Core content fields
      title: articleData.title,
      slug: articleData.slug,
      subtitle: articleData.subtitle || null,
      content: articleData.content,
      excerpt: articleData.excerpt,
      description: articleData.description,

      // Image fields
      featuredImage: articleData.featuredImage || null,
      imageCaption: articleData.imageCaption || null,
      imageAlt: articleData.imageAlt || null,
      gallery: articleData.gallery || [],

      // Status and workflow
      status: articleData.status || 'published',
      workflowStage: articleData.workflowStage || 'published',

      // Category and author
      categoryId: articleData.categoryId,
      subcategoryId: articleData.subcategoryId || null,
      authorId: articleData.authorId,
      coAuthors: articleData.coAuthors || [],
      authorBioOverride: articleData.authorBioOverride || null,

      // Flags
      featured: articleData.featured || false,
      heroSlider: articleData.heroSlider || false,
      trending: articleData.trending || false,
      pinned: articleData.pinned || false,
      allowComments: articleData.allowComments !== undefined ? articleData.allowComments : true,

      // Reading time and SEO
      readingTime: articleData.readingTime,
      metaTitle: articleData.metaTitle || articleData.title,
      metaDescription: articleData.metaDescription || articleData.excerpt,
      keywords: articleData.keywords || [],

      // Dates
      publishDate: articleData.publishDate || new Date(),
      scheduledPublishDate: articleData.scheduledPublishDate || null,

      // Analytics
      viewCount: articleData.viewCount || 0,
      likeCount: articleData.likeCount || 0,
      shareCount: articleData.shareCount || 0,

      // Assignment
      assignedTo: articleData.assignedTo || null,
      nextAction: articleData.nextAction || null,

      // Audit fields
      createdBy: articleData.createdBy,
      updatedBy: articleData.updatedBy || null
    };

    return await Article.create(completeArticleData);
  }

  /**
   * Generate JSON-LD structured data for article
   * @param {Object} article - Article object
   * @returns {Object} - JSON-LD structured data
   */
  generateStructuredData(article) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const articleUrl = `${baseUrl}/article/${article.id}`;

    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "description": article.excerpt || article.description || '',
      "image": article.featuredImage ? `${baseUrl}${article.featuredImage}` : undefined,
      "datePublished": article.publishDate || article.createdAt,
      "dateModified": article.updatedAt,
      "author": {
        "@type": "Person",
        "name": article.primaryAuthor?.name || 'Unknown Author',
        "jobTitle": article.primaryAuthor?.title || undefined
      },
      "publisher": {
        "@type": "Organization",
        "name": "Magazine Website",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": articleUrl
      },
      "articleSection": article.category?.name || 'General',
      "keywords": article.keywords ? article.keywords.join(', ') : '',
      "wordCount": article.content ? article.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length : 0,
      "timeRequired": "PT5M",
      "url": articleUrl
    };
  }
}

module.exports = BulkUploadService;