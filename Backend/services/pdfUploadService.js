const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { optimizeSpecificPDF } = require('../optimize-pdf');

class PDFUploadService {
  constructor() {
    this.storagePath = path.join(__dirname, '../storage/pdfs');
    this.ensureStoragePath();
  }

  async ensureStoragePath() {
    try {
      await fs.access(this.storagePath);
    } catch (error) {
      await fs.mkdir(this.storagePath, { recursive: true });
    }
  }

  getMulterStorage() {
    return multer.diskStorage({
      destination: async (req, file, cb) => {
        await this.ensureStoragePath();
        cb(null, this.storagePath);
      },
      filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const basename = path.basename(file.originalname, extension);
        cb(null, `${basename}-${uniqueSuffix}${extension}`);
      }
    });
  }

  getFileFilter() {
    return (req, file, cb) => {
      // Check if file is a PDF
      if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed!'), false);
      }
    };
  }

  async processPDF(inputPath, options = {}) {
    try {
      console.log('Processing PDF:', inputPath);

      // Check if input file exists
      await fs.access(inputPath);
      console.log('✅ Input file exists and is accessible');

      const parsedPath = path.parse(inputPath);
      const optimizedFilename = `${parsedPath.name}-optimized${parsedPath.ext}`;
      const outputPath = path.join(this.storagePath, optimizedFilename);

      console.log('Output path:', outputPath);

      // Ensure output directory exists
      await this.ensureStoragePath();

      // Try to optimize the PDF
      try {
        await optimizeSpecificPDF(inputPath, outputPath);
        console.log('✅ PDF optimization completed');
      } catch (optimizeError) {
        console.warn('PDF optimization failed, copying original file:', optimizeError.message);

        // If optimization fails, just copy the original file
        await fs.copyFile(inputPath, outputPath);
        console.log('✅ Original file copied as fallback');
      }

      // Get file stats
      const stats = await fs.stat(outputPath);
      console.log('✅ Output file stats:', { size: stats.size, path: outputPath });

      return {
        originalFilename: path.basename(inputPath),
        optimizedFilename,
        size: stats.size,
        path: outputPath
      };
    } catch (error) {
      console.error('❌ Error processing PDF:', error);
      throw new Error(`PDF processing failed: ${error.message}`);
    }
  }

  generatePDFUrl(filename) {
    return `/api/uploads/pdfs/${filename}`;
  }

  async deletePDF(filename) {
    try {
      const filePath = path.join(this.storagePath, filename);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting PDF:', error);
      return false;
    }
  }

  async getPDFMetadata(filename) {
    try {
      const filePath = path.join(this.storagePath, filename);
      const stats = await fs.stat(filePath);

      return {
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        url: this.generatePDFUrl(filename)
      };
    } catch (error) {
      console.error('Error getting PDF metadata:', error);
      return null;
    }
  }
}

// Create multer upload instance for PDFs
const pdfUploadService = new PDFUploadService();
const upload = multer({
  storage: pdfUploadService.getMulterStorage(),
  fileFilter: pdfUploadService.getFileFilter(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for PDFs
  }
});

module.exports = { PDFUploadService, pdfUploadService, upload };