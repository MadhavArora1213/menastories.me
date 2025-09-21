const cron = require('node-cron');
const { Article, Tag } = require('../models');
const { Op } = require('sequelize');

class SchedulingService {
  constructor() {
    this.initializeScheduler();
  }

  initializeScheduler() {
    // Run every minute to check for articles to publish
    cron.schedule('* * * * *', async () => {
      await this.checkScheduledArticles();
    });

    console.log('Article scheduler initialized');
  }

  async checkScheduledArticles() {
    try {
      const now = new Date();
      
      // Find articles that are scheduled and ready to publish
      const articlesToPublish = await Article.findAll({
        where: {
          status: 'scheduled',
          scheduled_publish_date: {
            [Op.lte]: now
          }
        }
      });

      for (const article of articlesToPublish) {
        await this.publishScheduledArticle(article);
      }
    } catch (error) {
      console.error('Error checking scheduled articles:', error);
    }
  }

  async publishScheduledArticle(article) {
    try {
      // Update article status
      await article.update({
        status: 'published',
        publish_date: new Date()
      });

      // Add tags to database if they don't exist
      if (article.tags && article.tags.length > 0) {
        await this.addTagsToDatabase(article.tags, article.category_id);
      }

      console.log(`Article "${article.title}" published automatically`);

      // Here you can add additional actions like:
      // - Send notifications
      // - Update social media
      // - Add to newsletter queue
      // - Update analytics

    } catch (error) {
      console.error(`Error publishing scheduled article ${article.id}:`, error);
      
      // Mark as failed or retry later
      await article.update({
        status: 'approved', // Revert to approved status
        review_notes: `Auto-publish failed: ${error.message}`
      });
    }
  }

  async addTagsToDatabase(tags, categoryId) {
    try {
      for (const tagName of tags) {
        await Tag.findOrCreate({
          where: { 
            name: tagName.toLowerCase().trim(),
            category_id: categoryId 
          },
          defaults: { 
            name: tagName.toLowerCase().trim(),
            category_id: categoryId,
            description: `Auto-generated tag from article publication`
          }
        });
      }
    } catch (error) {
      console.error('Error adding tags to database:', error);
    }
  }

  async scheduleArticle(articleId, publishDate) {
    try {
      const article = await Article.findByPk(articleId);
      if (!article) {
        throw new Error('Article not found');
      }

      if (new Date(publishDate) <= new Date()) {
        throw new Error('Publish date must be in the future');
      }

      await article.update({
        status: 'scheduled',
        scheduled_publish_date: publishDate
      });

      return { success: true, message: 'Article scheduled successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new SchedulingService();