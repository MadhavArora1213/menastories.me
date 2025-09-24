const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Storage path for images - use relative path for consistency
const STORAGE_PATH = path.join(__dirname, '../storage/images');
const TEMP_UPLOAD_PATH = path.join(__dirname, '../uploads');

console.log('🗂️  Image service paths:');
console.log('📁 Storage path:', STORAGE_PATH);
console.log('📁 Temp path:', TEMP_UPLOAD_PATH);
console.log('🖥️  Platform:', process.platform);

// Ensure directories exist
if (!fs.existsSync(STORAGE_PATH)) {
  fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

if (!fs.existsSync(TEMP_UPLOAD_PATH)) {
  fs.mkdirSync(TEMP_UPLOAD_PATH, { recursive: true });
}

// Multer configuration for temporary uploads
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

class ImageUploadService {
  constructor() {
    this.storagePath = STORAGE_PATH;
    this.tempPath = TEMP_UPLOAD_PATH;
  }

  /**
   * Process and optimize uploaded image
   * @param {string} inputPath - Path to input image
   * @param {Object} options - Processing options
   * @returns {Promise<string>} - Path to processed image
   */
  async processImage(inputPath, options = {}) {
    try {
      const {
        width = 1200,
        height = null,
        quality = 80,
        format = 'webp' // Default to WebP for better compression
      } = options;

      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const filename = `${timestamp}-${randomId}.${format}`;
      const outputPath = path.join(this.storagePath, filename);

      console.log('🖼️  Image processing:');
      console.log('📁 Storage path:', this.storagePath);
      console.log('📄 Output path:', outputPath);
      console.log('📄 Filename:', filename);
      console.log('📄 Input path:', inputPath);
      console.log('🔧 Options:', { width, height, quality, format });

      let sharpInstance = sharp(inputPath);

      // Get original image metadata for optimization
      const metadata = await sharpInstance.metadata();

      // Resize image with smart defaults
      if (height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: true
        });
      } else {
        sharpInstance = sharpInstance.resize(width, null, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Apply format-specific optimizations
      if (format === 'webp') {
        // WebP offers best compression with good quality
        sharpInstance = sharpInstance.webp({
          quality,
          effort: 6, // Higher effort for better compression
          smartSubsample: true
        });
      } else if (format === 'jpeg') {
        sharpInstance = sharpInstance.jpeg({
          quality,
          mozjpeg: true, // Use mozjpeg for better compression
          progressive: true
        });
      } else if (format === 'png') {
        sharpInstance = sharpInstance.png({
          quality,
          compressionLevel: 9, // Maximum compression
          palette: metadata.width * metadata.height < 256 * 256 // Use palette for small images
        });
      }

      await sharpInstance.toFile(outputPath);

      // Clean up temp file with retry logic for Windows file locking issues
      if (fs.existsSync(inputPath)) {
        await this.safeDeleteFile(inputPath);
      }

      console.log(`✅ Image processed: ${filename} (${metadata.format} → ${format}, ${(fs.statSync(outputPath).size / 1024).toFixed(1)}KB)`);
      return filename;
    } catch (error) {
      console.error('❌ Error processing image:', error);
      throw new Error('Failed to process image');
    }
  }

  /**
    * Generate public URL for image
    * @param {string} filename - Image filename
    * @returns {string} - Public URL
    */
   generateImageUrl(filename) {
     // Use appropriate URL based on environment
     const isProduction = process.env.NODE_ENV === 'production';
     const serverUrl = isProduction
       ? (process.env.SERVER_URL || 'https://menastories.me')
       : (process.env.SERVER_URL || 'http://localhost:5000');

     const url = `${serverUrl}/storage/images/${filename}`;
     console.log('🔗 Generated image URL:', url);
     console.log('🌍 Environment:', isProduction ? 'production' : 'development');
     console.log('🔧 Server URL:', serverUrl);
     return url;
   }

  /**
   * Safely delete file with retry logic for Windows file locking issues
   * @param {string} filePath - Path to file to delete
   * @param {number} maxRetries - Maximum number of retry attempts
   * @param {number} delayMs - Delay between retries in milliseconds
   */
  async safeDeleteFile(filePath, maxRetries = 5, delayMs = 100) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ Temp file deleted: ${filePath}`);
          return true;
        }
        return true; // File doesn't exist, consider it deleted
      } catch (error) {
        if (error.code === 'EBUSY' && attempt < maxRetries) {
          console.log(`⏳ File busy, retrying delete in ${delayMs}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          delayMs *= 2; // Exponential backoff
        } else {
          console.error(`❌ Failed to delete temp file after ${maxRetries} attempts:`, error.message);
          return false;
        }
      }
    }
    return false;
  }

  /**
   * Delete image file
   * @param {string} filename - Image filename to delete
   */
  async deleteImage(filename) {
    try {
      const filePath = path.join(this.storagePath, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Get image metadata
   * @param {string} filename - Image filename
   * @returns {Promise<Object>} - Image metadata
   */
  async getImageMetadata(filename) {
    try {
      const filePath = path.join(this.storagePath, filename);
      const metadata = await sharp(filePath).metadata();
      return metadata;
    } catch (error) {
      console.error('Error getting image metadata:', error);
      return null;
    }
  }

  /**
   * Create thumbnail version of image
   * @param {string} inputPath - Path to input image
   * @param {Object} options - Thumbnail options
   * @returns {Promise<string>} - Thumbnail filename
   */
  async createThumbnail(inputPath, options = {}) {
    try {
      const {
        width = 300,
        height = 200,
        quality = 85,
        format = 'webp'
      } = options;

      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const filename = `thumb-${timestamp}-${randomId}.${format}`;
      const outputPath = path.join(this.storagePath, 'thumbnails', filename);

      // Ensure thumbnails directory exists
      const thumbDir = path.join(this.storagePath, 'thumbnails');
      if (!fs.existsSync(thumbDir)) {
        fs.mkdirSync(thumbDir, { recursive: true });
      }

      let sharpInstance = sharp(inputPath)
        .resize(width, height, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: true
        });

      // Apply format-specific optimizations
      if (format === 'webp') {
        sharpInstance = sharpInstance.webp({
          quality,
          effort: 4, // Lower effort for thumbnails
          smartSubsample: true
        });
      } else if (format === 'jpeg') {
        sharpInstance = sharpInstance.jpeg({
          quality,
          mozjpeg: true,
          progressive: true
        });
      }

      await sharpInstance.toFile(outputPath);

      // Clean up temp file with retry logic
      if (fs.existsSync(inputPath)) {
        await this.safeDeleteFile(inputPath);
      }

      console.log(`✅ Thumbnail created: ${filename} (${(fs.statSync(outputPath).size / 1024).toFixed(1)}KB)`);
      return filename;
    } catch (error) {
      console.error('❌ Error creating thumbnail:', error);
      throw new Error('Failed to create thumbnail');
    }
  }
}

module.exports = {
  ImageUploadService,
  upload
};