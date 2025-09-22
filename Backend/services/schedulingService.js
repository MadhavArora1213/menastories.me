const cron = require('node-cron');
const { Op } = require('sequelize');

class SchedulingService {
  constructor() {
    this.isInitialized = false;
    this.cronJob = null;
    this.initializeScheduler();
  }

  initializeScheduler() {
    // Run every minute to check for articles to publish
    this.cronJob = cron.schedule('* * * * *', async () => {
      await this.checkScheduledArticles();
    });

    console.log('Article scheduler initialized');
  }

  async checkScheduledArticles() {
    try {
      // Import models dynamically to avoid initialization issues
      const models = require('../models');
      
      // Check if models are available
      if (!models || !models.Article) {
        if (!this.isInitialized) {
          console.log('Models not available yet, skipping scheduled articles check');
        }
        return;
      }

      const { Article } = models;
      
      // Additional safety check
      if (!Article.findAll || typeof Article.findAll !== 'function') {
        console.error('Article.findAll method not available');
        return;
      }

      // Mark as initialized after first successful model access
      if (!this.isInitialized) {
        this.isInitialized = true;
        console.log('✅ Scheduling service models initialized');
      }

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

      if (articlesToPublish.length > 0) {
        console.log(`📅 Found ${articlesToPublish.length} articles ready to publish`);
      }

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

      console.log(`✅ Article "${article.title}" published automatically`);

      // Here you can add additional actions like:
      // - Send notifications
      // - Update social media
      // - Add to newsletter queue
      // - Update analytics

    } catch (error) {
      console.error(`❌ Error publishing scheduled article ${article.id}:`, error);
      
      // Mark as failed or retry later
      try {
        await article.update({
          status: 'approved', // Revert to approved status
          review_notes: `Auto-publish failed: ${error.message}`
        });
      } catch (updateError) {
        console.error('Failed to update article status after error:', updateError);
      }
    }
  }

  async addTagsToDatabase(tags, categoryId) {
    try {
      const models = require('../models');
      const { Tag } = models;

      if (!Tag) {
        console.error('Tag model not available');
        return;
      }

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
      const models = require('../models');
      const { Article } = models;

      if (!Article) {
        throw new Error('Article model not available');
      }

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

  // Method to stop the scheduler
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('🛑 Article scheduler stopped');
    }
  }

  // Method to restart the scheduler
  restart() {
    this.stop();
    this.initializeScheduler();
  }
}

module.exports = new SchedulingService();