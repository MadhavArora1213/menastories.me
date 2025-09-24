const express = require('express');
const multer = require('multer');
const { ImageUploadService, upload } = require('../services/imageUploadService');
const { PDFUploadService, pdfUploadService, upload: pdfUpload } = require('../services/pdfUploadService');
const { Category, Subcategory, MediaKit } = require('../models');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const imageService = new ImageUploadService();

// Middleware to handle multer errors
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 5MB.'
      });
    }
  }

  if (error.message === 'Not an image! Please upload only images.') {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  next(error);
};

// Test route to verify upload routes are mounted correctly
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Upload routes are working correctly',
    timestamp: new Date().toISOString()
  });
});

// Serve static images
router.use('/images', express.static(imageService.storagePath));

// Also serve thumbnails
router.use('/images/thumbnails', express.static(path.join(imageService.storagePath, 'thumbnails')));

// Serve static PDFs
router.use('/pdfs', express.static(pdfUploadService.storagePath));

// Upload category image
router.post('/category/:categoryId/image', upload.single('image'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const { categoryId } = req.params;

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      // Clean up uploaded file
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Process the image with WebP optimization
    const processedFilename = await imageService.processImage(req.file.path, {
      width: 1200,
      quality: 80,
      format: 'webp'
    });

    // Generate URL
    const imageUrl = imageService.generateImageUrl(processedFilename);

    // Update category with new image URL
    await category.update({ featureImage: imageUrl });

    // Delete old image if exists
    if (category.featureImage) {
      const oldFilename = path.basename(category.featureImage);
      await imageService.deleteImage(oldFilename);
    }

    res.json({
      success: true,
      message: 'Category image uploaded successfully',
      data: {
        imageUrl,
        filename: processedFilename,
        categoryId
      }
    });

  } catch (error) {
    console.error('Error uploading category image:', error);

    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload category image'
    });
  }
});

// Upload subcategory image
router.post('/subcategory/:subcategoryId/image', upload.single('image'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const { subcategoryId } = req.params;

    // Check if subcategory exists
    const subcategory = await Subcategory.findByPk(subcategoryId);
    if (!subcategory) {
      // Clean up uploaded file
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        error: 'Subcategory not found'
      });
    }

    // Process the image with WebP optimization
    const processedFilename = await imageService.processImage(req.file.path, {
      width: 1200,
      quality: 80,
      format: 'webp'
    });

    // Generate URL
    const imageUrl = imageService.generateImageUrl(processedFilename);

    // Update subcategory with new image URL
    await subcategory.update({ featureImage: imageUrl });

    // Delete old image if exists
    if (subcategory.featureImage) {
      const oldFilename = path.basename(subcategory.featureImage);
      await imageService.deleteImage(oldFilename);
    }

    res.json({
      success: true,
      message: 'Subcategory image uploaded successfully',
      data: {
        imageUrl,
        filename: processedFilename,
        subcategoryId
      }
    });

  } catch (error) {
    console.error('Error uploading subcategory image:', error);

    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload subcategory image'
    });
  }
});

// General image upload (for events, articles, etc.)
router.post('/image', upload.single('image'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Process the image with WebP optimization
    const processedFilename = await imageService.processImage(req.file.path, {
      width: 1200,
      quality: 80,
      format: 'webp'
    });

    // Generate URL
    const imageUrl = imageService.generateImageUrl(processedFilename);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl,
        filename: processedFilename
      }
    });

  } catch (error) {
    console.error('Error uploading image:', error);

    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

// General file upload endpoint (for articles, etc.)
router.post('/files/upload', upload.single('image'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Process the image with WebP optimization
    const processedFilename = await imageService.processImage(req.file.path, {
      width: 1200,
      quality: 80,
      format: 'webp'
    });

    // Generate URL
    const imageUrl = imageService.generateImageUrl(processedFilename);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: processedFilename,
        url: imageUrl
      }
    });

  } catch (error) {
    console.error('Error uploading file:', error);

    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload file'
    });
  }
});

// Delete image
router.delete('/image/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    const deleted = await imageService.deleteImage(filename);

    if (deleted) {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
});

// Get image metadata
router.get('/image/:filename/metadata', async (req, res) => {
  try {
    const { filename } = req.params;

    const metadata = await imageService.getImageMetadata(filename);

    if (metadata) {
      res.json({
        success: true,
        data: metadata
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Image not found or unable to read metadata'
      });
    }

  } catch (error) {
    console.error('Error getting image metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get image metadata'
    });
  }
});

// PDF Upload Routes

// Middleware to handle PDF multer errors
const handlePDFMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 50MB for PDFs.'
      });
    }
  }

  if (error.message === 'Only PDF files are allowed!') {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  next(error);
};

// Upload PDF for Media Kit
router.post('/pdf', pdfUpload.single('pdf'), handlePDFMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file provided'
      });
    }

    // Process the PDF with optimization
    const processedResult = await pdfUploadService.processPDF(req.file.path, {
      optimize: true
    });

    // Generate URL
    const pdfUrl = pdfUploadService.generatePDFUrl(processedResult.optimizedFilename);

    // Clean up the original uploaded file
    try {
      await fs.unlink(req.file.path);
    } catch (cleanupError) {
      console.warn('Failed to clean up original PDF file:', cleanupError);
    }

    res.json({
      success: true,
      message: 'PDF uploaded and optimized successfully',
      data: {
        pdfUrl,
        filename: processedResult.optimizedFilename,
        originalName: processedResult.originalFilename,
        size: processedResult.size
      }
    });

  } catch (error) {
    console.error('Error uploading PDF:', error);

    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload and optimize PDF'
    });
  }
});

// Upload PDF for specific Media Kit
router.post('/mediakit/:mediaKitId/pdf', pdfUpload.single('pdf'), handlePDFMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file provided'
      });
    }

    const { mediaKitId } = req.params;

    // Check if Media Kit exists
    const mediaKit = await MediaKit.findByPk(mediaKitId);
    if (!mediaKit) {
      // Clean up uploaded file
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        error: 'Media Kit not found'
      });
    }

    // Process the PDF with optimization
    const processedResult = await pdfUploadService.processPDF(req.file.path, {
      optimize: true
    });

    // Generate URL
    const pdfUrl = pdfUploadService.generatePDFUrl(processedResult.optimizedFilename);

    // Update Media Kit with new PDF info
    await mediaKit.update({
      pdfFile: processedResult.optimizedFilename,
      pdfOriginalName: processedResult.originalFilename,
      pdfSize: processedResult.size
    });

    // Delete old PDF if exists
    if (mediaKit.pdfFile) {
      const oldFilename = mediaKit.pdfFile;
      await pdfUploadService.deletePDF(oldFilename);
    }

    // Clean up the original uploaded file
    try {
      await fs.unlink(req.file.path);
    } catch (cleanupError) {
      console.warn('Failed to clean up original PDF file:', cleanupError);
    }

    res.json({
      success: true,
      message: 'PDF uploaded and optimized successfully',
      data: {
        pdfUrl,
        filename: processedResult.optimizedFilename,
        originalName: processedResult.originalFilename,
        size: processedResult.size,
        mediaKitId
      }
    });

  } catch (error) {
    console.error('Error uploading PDF for Media Kit:', error);

    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload and optimize PDF'
    });
  }
});

// Delete PDF
router.delete('/pdf/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    const deleted = await pdfUploadService.deletePDF(filename);

    if (deleted) {
      res.json({
        success: true,
        message: 'PDF deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'PDF not found'
      });
    }

  } catch (error) {
    console.error('Error deleting PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete PDF'
    });
  }
});

// Get PDF metadata
router.get('/pdf/:filename/metadata', async (req, res) => {
  try {
    const { filename } = req.params;

    const metadata = await pdfUploadService.getPDFMetadata(filename);

    if (metadata) {
      res.json({
        success: true,
        data: metadata
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'PDF not found or unable to read metadata'
      });
    }

  } catch (error) {
    console.error('Error getting PDF metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get PDF metadata'
    });
  }
});

module.exports = router;