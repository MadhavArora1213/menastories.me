const pdfService = require('../services/pdfService');
const { Article, Comment, User } = require('../models');
const { Op } = require('sequelize');

// Generate PDF for a specific article
const generateArticlePDF = async (req, res) => {
  try {
    const { articleId } = req.body;
    const { format = 'A4' } = req.body;

    // Fetch the article with author information
    const article = await Article.findByPk(articleId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Generate PDF
    const pdfBuffer = await pdfService.generateArticlePDF(article, { format });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating article PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF'
    });
  }
};

// Generate PDF report for comments
const generateCommentReportPDF = async (req, res) => {
  try {
    const { 
      status, 
      startDate, 
      endDate, 
      format = 'A4' 
    } = req.body;

    // Build where clause for filtering
    let whereClause = {};
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Fetch comments with related data
    const comments = await Comment.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Article,
          as: 'article',
          attributes: ['id', 'title', 'slug']
        },
        {
          model: Comment,
          as: 'reports',
          attributes: ['id']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Generate PDF
    const pdfBuffer = await pdfService.generateCommentReportPDF(comments, { format });

    // Set response headers for PDF download
    const filename = `comment_report_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating comment report PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report'
    });
  }
};

// Generate custom report PDF
const generateCustomReportPDF = async (req, res) => {
  try {
    const { title, sections, format = 'A4' } = req.body;

    const reportData = {
      title,
      sections,
      generatedAt: new Date()
    };

    // Generate PDF
    const pdfBuffer = await pdfService.generateReportPDF(reportData, { format });

    // Set response headers for PDF download
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating custom report PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate custom PDF report'
    });
  }
};

// Generate analytics report PDF
const generateAnalyticsReportPDF = async (req, res) => {
  try {
    const { startDate, endDate, format = 'A4' } = req.body;

    // Fetch analytics data
    const analyticsData = await getAnalyticsData(startDate, endDate);

    const reportData = {
      title: 'Analytics Report',
      sections: [
        {
          title: 'Overview',
          content: `
            <div class="stat-card">
              <div class="stat-number">${analyticsData.totalArticles}</div>
              <div class="stat-label">Total Articles</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${analyticsData.totalComments}</div>
              <div class="stat-label">Total Comments</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${analyticsData.totalUsers}</div>
              <div class="stat-label">Total Users</div>
            </div>
          `
        },
        {
          title: 'Comment Statistics',
          content: `
            <table class="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(analyticsData.commentStats).map(([status, count]) => `
                  <tr>
                    <td>${status}</td>
                    <td>${count}</td>
                    <td>${((count / analyticsData.totalComments) * 100).toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `
        }
      ]
    };

    // Generate PDF
    const pdfBuffer = await pdfService.generateReportPDF(reportData, { format });

    // Set response headers for PDF download
    const filename = `analytics_report_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating analytics report PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate analytics PDF report'
    });
  }
};

// Helper function to get analytics data
const getAnalyticsData = async (startDate, endDate) => {
  const whereClause = {};
  
  if (startDate && endDate) {
    whereClause.createdAt = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  }

  const [totalArticles, totalComments, totalUsers] = await Promise.all([
    Article.count({ where: whereClause }),
    Comment.count({ where: whereClause }),
    User.count({ where: whereClause })
  ]);

  const commentStats = await Comment.findAll({
    where: whereClause,
    attributes: [
      'status',
      [Comment.sequelize.fn('COUNT', Comment.sequelize.col('id')), 'count']
    ],
    group: ['status']
  });

  const stats = {};
  commentStats.forEach(stat => {
    stats[stat.status] = parseInt(stat.dataValues.count);
  });

  return {
    totalArticles,
    totalComments,
    totalUsers,
    commentStats: stats
  };
};

module.exports = {
  generateArticlePDF,
  generateCommentReportPDF,
  generateCustomReportPDF,
  generateAnalyticsReportPDF
};
