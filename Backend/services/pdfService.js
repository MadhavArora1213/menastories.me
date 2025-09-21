const fs = require('fs').promises;
const path = require('path');

class PDFService {
  constructor() {
    this.isAvailable = false;
    this.checkAvailability();
  }

  async checkAvailability() {
    try {
      // Try to use a lighter PDF generation approach
      this.isAvailable = true;
    } catch (error) {
      console.warn('PDF generation not available:', error.message);
      this.isAvailable = false;
    }
  }

  async generateArticlePDF(article, options = {}) {
    if (!this.isAvailable) {
      throw new Error('PDF generation service not available');
    }

    // For now, return a simple HTML file that can be converted to PDF
    const htmlContent = this.generateArticleHTML(article);
    
    // Create a temporary HTML file
    const tempDir = path.join(__dirname, '../temp');
    try {
      await fs.access(tempDir);
    } catch {
      await fs.mkdir(tempDir, { recursive: true });
    }
    
    const filename = `article_${article.id}_${Date.now()}.html`;
    const filepath = path.join(tempDir, filename);
    await fs.writeFile(filepath, htmlContent);
    
    // Return the HTML content as a buffer for now
    // In production, you would convert this to PDF using a service like:
    // - Puppeteer (if available)
    // - html-pdf-node
    // - External PDF service
    // - Browser print-to-PDF
    
    return Buffer.from(htmlContent, 'utf8');
  }

  async generateReportPDF(reportData, options = {}) {
    if (!this.isAvailable) {
      throw new Error('PDF generation service not available');
    }

    const htmlContent = this.generateReportHTML(reportData);
    return Buffer.from(htmlContent, 'utf8');
  }

  async generateCommentReportPDF(comments, options = {}) {
    if (!this.isAvailable) {
      throw new Error('PDF generation service not available');
    }

    const htmlContent = this.generateCommentReportHTML(comments);
    return Buffer.from(htmlContent, 'utf8');
  }

  generateArticleHTML(article) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${article.title}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2c3e50;
          }
          .meta {
            color: #7f8c8d;
            font-size: 0.9em;
            margin-bottom: 20px;
          }
          .author {
            font-weight: bold;
            color: #34495e;
          }
          .content {
            font-size: 1.1em;
            line-height: 1.8;
          }
          .content img {
            max-width: 100%;
            height: auto;
            margin: 20px 0;
            border-radius: 8px;
          }
          .content h1, .content h2, .content h3 {
            color: #2c3e50;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          .content p {
            margin-bottom: 15px;
          }
          .content blockquote {
            border-left: 4px solid #3498db;
            padding-left: 20px;
            margin: 20px 0;
            font-style: italic;
            color: #555;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${article.title}</h1>
          <div class="meta">
            <span class="author">By ${article.author?.name || 'Unknown Author'}</span> | 
            Published on ${new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        <div class="content">
          ${article.content}
        </div>
        
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
      </body>
      </html>
    `;
  }

  generateReportHTML(reportData) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportData.title || 'Report'}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2c3e50;
          }
          .subtitle {
            color: #7f8c8d;
            font-size: 1.1em;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 1.5em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          .data-table th, .data-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          .data-table th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          .data-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .stat-card {
            background: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin: 10px 0;
            text-align: center;
          }
          .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #3498db;
          }
          .stat-label {
            color: #7f8c8d;
            font-size: 0.9em;
            margin-top: 5px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${reportData.title || 'Report'}</h1>
          <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
        </div>
        
        ${reportData.sections?.map(section => `
          <div class="section">
            <h2 class="section-title">${section.title}</h2>
            ${section.content}
          </div>
        `).join('') || ''}
        
        <div class="footer">
          <p>Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
      </body>
      </html>
    `;
  }

  generateCommentReportHTML(comments) {
    const statusColors = {
      pending: '#f39c12',
      approved: '#27ae60',
      rejected: '#e74c3c',
      spam: '#9b59b6'
    };

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Comment Moderation Report</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2c3e50;
          }
          .subtitle {
            color: #7f8c8d;
            font-size: 1.1em;
          }
          .comment-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 0.9em;
          }
          .comment-table th, .comment-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            vertical-align: top;
          }
          .comment-table th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          .comment-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
          }
          .comment-content {
            max-width: 300px;
            word-wrap: break-word;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Comment Moderation Report</h1>
          <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
        </div>
        
        <table class="comment-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Author</th>
              <th>Content</th>
              <th>Article</th>
              <th>Status</th>
              <th>Created</th>
              <th>Reports</th>
            </tr>
          </thead>
          <tbody>
            ${comments.map(comment => `
              <tr>
                <td>${comment.id}</td>
                <td>${comment.author?.name || 'Anonymous'}</td>
                <td class="comment-content">${comment.content.substring(0, 100)}${comment.content.length > 100 ? '...' : ''}</td>
                <td>${comment.article?.title || 'N/A'}</td>
                <td>
                  <span class="status-badge" style="background-color: ${statusColors[comment.status]}; color: white;">
                    ${comment.status}
                  </span>
                </td>
                <td>${new Date(comment.createdAt).toLocaleDateString()}</td>
                <td>${comment.reports?.length || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>Total comments: ${comments.length}</p>
        </div>
      </body>
      </html>
    `;
  }

  async savePDFToFile(pdfBuffer, filename) {
    const uploadsDir = path.join(__dirname, '../uploads/pdfs');
    
    // Ensure directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }
    
    const filepath = path.join(uploadsDir, filename);
    await fs.writeFile(filepath, pdfBuffer);
    
    return filepath;
  }
}

module.exports = new PDFService();
