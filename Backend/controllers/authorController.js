const { Author, Article } = require('../models');

// Get all authors
const getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.findAll({
      include: [
        {
          model: Article,
          as: 'articles',
          through: { attributes: [] },
          attributes: ['id', 'title']
        }
      ],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      authors,
      totalCount: authors.length
    });
  } catch (error) {
    console.error('Get all authors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get author by ID
const getAuthorById = async (req, res) => {
  try {
    const { id } = req.params;
    const author = await Author.findByPk(id, {
      include: [
        {
          model: Article,
          as: 'articles',
          through: { attributes: [] },
          attributes: ['id', 'title', 'status', 'publishDate']
        }
      ]
    });

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    res.status(200).json({ author });
  } catch (error) {
    console.error('Get author by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new author
const createAuthor = async (req, res) => {
  try {
    const { name, email, bio, image, title, experience, education, socialLinks } = req.body;

    const author = await Author.create({
      name,
      email,
      bio,
      image,
      title,
      experience,
      education,
      socialLinks: socialLinks || {}
    });

    res.status(201).json({
      message: 'Author created successfully',
      author
    });
  } catch (error) {
    console.error('Create author error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update author
const updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, bio, image, title, experience, education, socialLinks, isActive } = req.body;

    const author = await Author.findByPk(id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    await author.update({
      name,
      email,
      bio,
      image,
      title,
      experience,
      education,
      socialLinks: socialLinks || author.socialLinks,
      isActive
    });

    res.status(200).json({
      message: 'Author updated successfully',
      author
    });
  } catch (error) {
    console.error('Update author error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete author
const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;

    const author = await Author.findByPk(id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // Check if author has articles
    const articleCount = await Article.count({
      include: [
        {
          model: Author,
          as: 'authors',
          where: { id },
          through: { attributes: [] },
          required: true
        }
      ]
    });

    if (articleCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete author with existing articles. Remove author from articles first.'
      });
    }

    await author.destroy();

    res.status(200).json({ message: 'Author deleted successfully' });
  } catch (error) {
    console.error('Delete author error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor
};