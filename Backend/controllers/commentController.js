const { Comment, User, Article, CommentReport, CommentVote } = require('../models');
const { Op } = require('sequelize');

// Get all comments with filtering and pagination for admin
const getCommentsForAdmin = async (req, res) => {
  try {
    const { 
      status, 
      search, 
      page = 1, 
      limit = 20 
    } = req.query;

    let whereClause = {};
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (search) {
      whereClause[Op.or] = [
        { content: { [Op.like]: `%${search}%` } },
        { '$author.name$': { [Op.like]: `%${search}%` } },
        { '$article.title$': { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Comment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar', 'isEmailVerified'],
          required: false
        },
        {
          model: Article,
          as: 'article',
          attributes: ['id', 'title', 'slug'],
          required: false
        },
        {
          model: CommentReport,
          as: 'reports',
          include: [{
            model: User,
            as: 'reporter',
            attributes: ['id', 'name']
          }],
          required: false
        },
        {
          model: Comment,
          as: 'replies',
          attributes: ['id'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      comments: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });

  } catch (error) {
    console.error('Error fetching comments for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
};

// Get comment statistics for admin dashboard
const getCommentStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      Comment.count(),
      Comment.count({ where: { status: 'pending' } }),
      Comment.count({ where: { status: 'approved' } }),
      Comment.count({ where: { status: 'rejected' } }),
      Comment.count({ where: { status: 'spam' } })
    ]);

    res.json({
      success: true,
      stats: {
        total: stats[0],
        pending: stats[1],
        approved: stats[2],
        rejected: stats[3],
        spam: stats[4]
      }
    });

  } catch (error) {
    console.error('Error fetching comment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comment statistics'
    });
  }
};

// Moderate a single comment
const moderateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const adminId = req.admin?.id || req.user?.id;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    let newStatus;
    switch (action) {
      case 'approve':
        newStatus = 'approved';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'spam':
        newStatus = 'spam';
        break;
      case 'pending':
        newStatus = 'pending';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    await comment.update({
      status: newStatus,
      moderatedBy: adminId,
      moderatedAt: new Date()
    });

    res.json({
      success: true,
      message: `Comment ${action}d successfully`
    });

  } catch (error) {
    console.error('Error moderating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate comment'
    });
  }
};

// Bulk moderate comments
const bulkModerateComments = async (req, res) => {
  try {
    const { commentIds, action } = req.body;
    const adminId = req.admin?.id || req.user?.id;

    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment IDs are required'
      });
    }

    let newStatus;
    switch (action) {
      case 'approve':
        newStatus = 'approved';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'spam':
        newStatus = 'spam';
        break;
      case 'pending':
        newStatus = 'pending';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    await Comment.update(
      {
        status: newStatus,
        moderatedBy: adminId,
        moderatedAt: new Date()
      },
      {
        where: {
          id: {
            [Op.in]: commentIds
          }
        }
      }
    );

    res.json({
      success: true,
      message: `${commentIds.length} comments ${action}d successfully`
    });

  } catch (error) {
    console.error('Error bulk moderating comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk moderate comments'
    });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Delete associated reports and votes first
    await CommentReport.destroy({ where: { commentId: id } });
    await CommentVote.destroy({ where: { commentId: id } });

    // Delete replies first
    await Comment.destroy({ where: { parentId: id } });

    // Delete the main comment
    await comment.destroy();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    });
  }
};

// Get comment details with reports
const getCommentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'avatar', 'isEmailVerified']
        },
        {
          model: Article,
          as: 'article',
          attributes: ['id', 'title', 'slug']
        },
        {
          model: CommentReport,
          as: 'reports',
          include: [{
            model: User,
            as: 'reporter',
            attributes: ['id', 'name']
          }]
        },
        {
          model: Comment,
          as: 'replies',
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'avatar', 'isEmailVerified']
          }]
        },
        {
          model: User,
          as: 'moderator',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    res.json({
      success: true,
      comment
    });

  } catch (error) {
    console.error('Error fetching comment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comment details'
    });
  }
};

// Get recent comment reports
const getRecentReports = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const { count, rows } = await CommentReport.findAndCountAll({
      include: [
        {
          model: Comment,
          as: 'comment',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name']
            },
            {
              model: Article,
              as: 'article',
              attributes: ['id', 'title']
            }
          ]
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'name']
        }
      ],
      where: {
        status: 'pending'
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      reports: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
};

module.exports = {
  getCommentsForAdmin,
  getCommentStats,
  moderateComment,
  bulkModerateComments,
  deleteComment,
  getCommentDetails,
  getRecentReports
};