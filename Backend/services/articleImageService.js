const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

class ArticleImageService {
  constructor() {
    this.baseDir = path.join(__dirname, '../storage/articles');
    this.sizes = {
      thumbnail: { width: 300, height: 200, fit: 'cover' },
      medium: { width: 800, height: 600, fit: 'inside' },
      large: { width: 1200, height: 800, fit: 'inside' },
      original: { width: null, height: null, fit: 'inside' }
    };
    this.quality = 85;
    this.initializeStorage();
  }

  /**
   * Initialize storage directory structure
   */
  async initializeStorage() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (error) {
      console.error('Failed to initialize storage directory:', error);
    }
  }

  /**
   * Generate safe article directory name
   */
  generateArticleDirName(articleTitle, articleId) {
    const safeTitle = articleTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
      .substring(0, 50);

    return `${safeTitle}-${articleId}`;
  }

  /**
   * Create article-specific directory
   */
  async createArticleDirectory(articleTitle, articleId) {
    const dirName = this.generateArticleDirName(articleTitle, articleId);
    const articleDir = path.join(this.baseDir, dirName);

    try {
      await fs.mkdir(articleDir, { recursive: true });
      return { dirName, fullPath: articleDir };
    } catch (error) {
      throw new Error(`Failed to create article directory: ${error.message}`);
    }
  }

  /**
   * Generate unique filename
   */
  generateFileName(originalName, size = 'original') {
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');

    return `${nameWithoutExt}-${size}-${timestamp}-${random}.webp`;
  }

  /**
   * Optimize and convert image to WebP
   */
  async optimizeImage(inputBuffer, options = {}) {
    const { width, height, fit } = options;
    let sharpInstance = sharp(inputBuffer).webp({ quality: this.quality });

    if (width && height) {
      sharpInstance = sharpInstance.resize(width, height, { fit, withoutEnlargement: true });
    }

    return await sharpInstance.toBuffer();
  }

  /**
   * Process uploaded image for article
   */
  async processArticleImage(file, articleTitle, articleId, imageType = 'featured') {
    try {
      // Create article directory
      const { dirName, fullPath } = await this.createArticleDirectory(articleTitle, articleId);

      // Read uploaded file
      const inputBuffer = await fs.readFile(file.path);

      // Generate filenames for different sizes
      const fileNames = {};
      const imagePaths = {};

      for (const [size, options] of Object.entries(this.sizes)) {
        const fileName = this.generateFileName(file.originalname, size);
        const filePath = path.join(fullPath, fileName);

        // Optimize image
        const optimizedBuffer = await this.optimizeImage(inputBuffer, options);

        // Save optimized image
        await fs.writeFile(filePath, optimizedBuffer);

        fileNames[size] = fileName;
        imagePaths[size] = `/articles/${dirName}/${fileName}`;
      }

      // Clean up original uploaded file
      try {
        await fs.unlink(file.path);
      } catch (cleanupError) {
        console.warn('Failed to cleanup original file:', cleanupError);
      }

      return {
        success: true,
        imagePaths,
        fileNames,
        dirName,
        metadata: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          imageType,
          processedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  /**
   * Update article image (replace existing)
   */
  async updateArticleImage(file, articleTitle, articleId, oldImagePaths = null, imageType = 'featured') {
    try {
      // Process new image
      const result = await this.processArticleImage(file, articleTitle, articleId, imageType);

      // Clean up old images if they exist
      if (oldImagePaths) {
        await this.cleanupOldImages(oldImagePaths);
      }

      return result;

    } catch (error) {
      console.error('Image update error:', error);
      throw new Error(`Failed to update image: ${error.message}`);
    }
  }

  /**
   * Clean up old images
   */
  async cleanupOldImages(imagePaths) {
    if (!imagePaths || typeof imagePaths !== 'object') return;

    const cleanupPromises = [];

    for (const [size, imagePath] of Object.entries(imagePaths)) {
      if (imagePath && typeof imagePath === 'string') {
        // Convert relative path to absolute
        const fullPath = path.join(__dirname, '../storage', imagePath);

        cleanupPromises.push(
          fs.unlink(fullPath).catch(error => {
            console.warn(`Failed to delete old image ${fullPath}:`, error.message);
          })
        );
      }
    }

    await Promise.allSettled(cleanupPromises);
  }

  /**
   * Clean up all images for an article by title and ID
   */
  async cleanupArticleImages(articleTitle, articleId) {
    const articleDirName = this.generateArticleDirName(articleTitle, articleId);
    return await this.deleteArticleImages(articleDirName);
  }

  /**
   * Delete all images for an article
   */
  async deleteArticleImages(articleDirName) {
    if (!articleDirName) return;

    try {
      const articleDir = path.join(this.baseDir, articleDirName);

      // Check if directory exists
      try {
        await fs.access(articleDir);
      } catch {
        // Directory doesn't exist, nothing to clean up
        return;
      }

      // Remove entire directory and all contents
      await fs.rm(articleDir, { recursive: true, force: true });

      console.log(`Cleaned up article images: ${articleDirName}`);

    } catch (error) {
      console.error(`Failed to delete article images for ${articleDirName}:`, error);
      throw new Error(`Failed to cleanup article images: ${error.message}`);
    }
  }

  /**
   * Get image URL for serving
   */
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    return `${process.env.BASE_URL || 'http://localhost:5000'}/api/images${imagePath}`;
  }

  /**
   * Validate image file
   */
  validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 10MB.');
    }

    return true;
  }

  /**
   * Get article directory info
   */
  async getArticleDirectoryInfo(articleDirName) {
    try {
      const articleDir = path.join(this.baseDir, articleDirName);

      const files = await fs.readdir(articleDir);
      const imageFiles = files.filter(file =>
        file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
      );

      return {
        dirName: articleDirName,
        totalFiles: imageFiles.length,
        files: imageFiles
      };

    } catch (error) {
      console.error(`Failed to get directory info for ${articleDirName}:`, error);
      return null;
    }
  }

  /**
   * Clean up orphaned images (images without corresponding articles)
   */
  async cleanupOrphanedImages() {
    try {
      const directories = await fs.readdir(this.baseDir);
      const cleanupPromises = [];

      for (const dir of directories) {
        if (dir.startsWith('.')) continue; // Skip hidden files

        const dirPath = path.join(this.baseDir, dir);

        // Check if directory contains article files
        try {
          const files = await fs.readdir(dirPath);
          const hasImages = files.some(file =>
            file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.png')
          );

          if (!hasImages) {
            cleanupPromises.push(
              fs.rm(dirPath, { recursive: true, force: true }).catch(error => {
                console.warn(`Failed to remove empty directory ${dir}:`, error);
              })
            );
          }
        } catch (error) {
          console.warn(`Error checking directory ${dir}:`, error);
        }
      }

      await Promise.allSettled(cleanupPromises);
      console.log('Orphaned image cleanup completed');

    } catch (error) {
      console.error('Failed to cleanup orphaned images:', error);
    }
  }
}

module.exports = new ArticleImageService();