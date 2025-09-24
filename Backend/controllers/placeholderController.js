const sharp = require('sharp');
const path = require('path');

/**
 * Placeholder Image Controller
 * Generates placeholder images for the application
 */
class PlaceholderController {
  constructor() {
    console.log('=== PlaceholderController initialized ===');
  }

  /**
   * Generate a placeholder image
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  generatePlaceholder = async (req, res) => {
    try {
      const { width = 300, height = 300, text = 'Placeholder', bgColor = 'f3f4f6', textColor = '6b7280' } = req.params;

      // Validate dimensions
      const imgWidth = parseInt(width);
      const imgHeight = parseInt(height);

      if (isNaN(imgWidth) || isNaN(imgHeight) || imgWidth <= 0 || imgHeight <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid dimensions. Width and height must be positive numbers.'
        });
      }

      if (imgWidth > 2000 || imgHeight > 2000) {
        return res.status(400).json({
          success: false,
          message: 'Dimensions too large. Maximum allowed is 2000x2000 pixels.'
        });
      }

      console.log(`🎨 Generating placeholder image: ${imgWidth}x${imgHeight} with text "${text}"`);

      // Create SVG content for placeholder
      const svgContent = this.generateSVG({
        width: imgWidth,
        height: imgHeight,
        text: text,
        bgColor: bgColor,
        textColor: textColor
      });

      // Convert SVG to the requested format
      const format = req.query.format || 'png';
      let sharpInstance = sharp(Buffer.from(svgContent));

      // Set format based on query parameter or default to PNG
      switch (format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({ quality: 90 });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality: 90 });
          break;
        case 'png':
        default:
          sharpInstance = sharpInstance.png();
          break;
      }

      // Set appropriate headers
      const contentType = this.getContentType(format);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

      // Stream the generated image
      const buffer = await sharpInstance.toBuffer();
      res.setHeader('Content-Length', buffer.length);

      console.log(`✅ Placeholder image generated: ${imgWidth}x${imgHeight} (${buffer.length} bytes)`);
      res.send(buffer);

    } catch (error) {
      console.error('❌ Error generating placeholder image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate placeholder image',
        error: error.message
      });
    }
  }

  /**
   * Generate SVG content for placeholder image
   * @param {Object} options - Options for SVG generation
   * @returns {string} SVG content
   */
  generateSVG(options) {
    const { width, height, text, bgColor, textColor } = options;

    // Calculate font size based on dimensions (responsive)
    const fontSize = Math.min(width, height) / 12;
    const lineHeight = fontSize * 1.2;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#${this.darkenColor(bgColor)};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>

        <!-- Decorative elements -->
        <circle cx="${width * 0.2}" cy="${height * 0.2}" r="${Math.min(width, height) * 0.05}" fill="#${textColor}" opacity="0.1"/>
        <circle cx="${width * 0.8}" cy="${height * 0.8}" r="${Math.min(width, height) * 0.03}" fill="#${textColor}" opacity="0.1"/>

        <!-- Main text -->
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="600" fill="#${textColor}" text-anchor="middle" dominant-baseline="middle">
          ${this.escapeHtml(text)}
        </text>

        <!-- Border -->
        <rect x="2" y="2" width="${width-4}" height="${height-4}" fill="none" stroke="#${textColor}" stroke-width="2" opacity="0.2" rx="8"/>
      </svg>
    `;
  }

  /**
   * Get content type based on format
   * @param {string} format - Image format
   * @returns {string} Content type
   */
  getContentType(format) {
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      case 'png':
      default:
        return 'image/png';
    }
  }

  /**
   * Darken a hex color
   * @param {string} color - Hex color
   * @returns {string} Darkened hex color
   */
  darkenColor(color) {
    // Simple color darkening for gradient effect
    const num = parseInt(color, 16);
    const amt = Math.round(2.55 * 20); // 20% darker
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return ((R < 255 ? R < 1 ? 0 : R : 255) << 16 |
            (G < 255 ? G < 1 ? 0 : G : 255) << 8 |
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16);
  }

  /**
   * Escape HTML characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const htmlEscapes = {
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return text.replace(/[&<>"'\/]/g, (char) => htmlEscapes[char]);
  }

  /**
   * Health check for placeholder service
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  healthCheck = async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Placeholder image service is operational',
        timestamp: new Date().toISOString(),
        capabilities: {
          maxWidth: 2000,
          maxHeight: 2000,
          supportedFormats: ['png', 'jpeg', 'webp'],
          features: ['svg-generation', 'custom-text', 'custom-colors', 'gradients']
        }
      });
    } catch (error) {
      console.error('Placeholder health check error:', error);
      res.status(500).json({
        success: false,
        message: 'Placeholder service health check failed',
        error: error.message
      });
    }
  }
}

module.exports = new PlaceholderController();