'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // For PostgreSQL, we need to drop and recreate constraints
    const db = queryInterface.sequelize;

    // Check if video_comments table exists and has the right structure
    try {
      // First, let's check what constraints exist
      const [results] = await db.query(`
        SELECT conname, conrelid::regclass, confrelid::regclass, confdeltype
        FROM pg_constraint
        WHERE conrelid = 'video_comments'::regclass
        AND contype = 'f';
      `);

      console.log('Existing foreign key constraints on video_comments:', results);

      // Drop existing foreign key constraints if they exist
      await db.query(`
        ALTER TABLE video_comments
        DROP CONSTRAINT IF EXISTS "video_comments_videoId_fkey",
        DROP CONSTRAINT IF EXISTS "video_comments_userId_fkey",
        DROP CONSTRAINT IF EXISTS "video_comments_parentId_fkey";
      `);

      // Add new constraints with CASCADE delete
      await db.query(`
        ALTER TABLE video_comments
        ADD CONSTRAINT "video_comments_videoId_fkey"
        FOREIGN KEY ("videoId") REFERENCES "VideoArticles"("id") ON DELETE CASCADE,

        ADD CONSTRAINT "video_comments_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE,

        ADD CONSTRAINT "video_comments_parentId_fkey"
        FOREIGN KEY ("parentId") REFERENCES "video_comments"("id") ON DELETE CASCADE;
      `);

      console.log('Successfully updated video_comments constraints');

    } catch (error) {
      console.log('video_comments table may not exist or has different structure:', error.message);
    }

    // Check and update video_article_tags table
    try {
      await db.query(`
        ALTER TABLE video_article_tags
        DROP CONSTRAINT IF EXISTS "video_article_tags_videoArticleId_fkey",
        DROP CONSTRAINT IF EXISTS "video_article_tags_tagId_fkey";
      `);

      await db.query(`
        ALTER TABLE video_article_tags
        ADD CONSTRAINT "video_article_tags_videoArticleId_fkey"
        FOREIGN KEY ("videoArticleId") REFERENCES "VideoArticles"("id") ON DELETE CASCADE,

        ADD CONSTRAINT "video_article_tags_tagId_fkey"
        FOREIGN KEY ("tagId") REFERENCES "Tags"("id") ON DELETE CASCADE;
      `);

      console.log('Successfully updated video_article_tags constraints');

    } catch (error) {
      console.log('video_article_tags table may not exist or has different structure:', error.message);
    }

    // VideoArticleViews table should already have CASCADE delete for videoArticleId
    // Let's verify and update userId constraint if needed
    try {
      await db.query(`
        ALTER TABLE "VideoArticleViews"
        DROP CONSTRAINT IF EXISTS "VideoArticleViews_userId_fkey";
      `);

      await db.query(`
        ALTER TABLE "VideoArticleViews"
        ADD CONSTRAINT "VideoArticleViews_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE;
      `);

      console.log('Successfully updated VideoArticleViews userId constraint');

    } catch (error) {
      console.log('VideoArticleViews table update failed:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    const db = queryInterface.sequelize;

    // Rollback to SET NULL constraints
    try {
      await db.query(`
        ALTER TABLE video_comments
        DROP CONSTRAINT IF EXISTS "video_comments_videoId_fkey",
        DROP CONSTRAINT IF EXISTS "video_comments_userId_fkey",
        DROP CONSTRAINT IF EXISTS "video_comments_parentId_fkey";
      `);

      await db.query(`
        ALTER TABLE video_comments
        ADD CONSTRAINT "video_comments_videoId_fkey"
        FOREIGN KEY ("videoId") REFERENCES "VideoArticles"("id") ON DELETE SET NULL,

        ADD CONSTRAINT "video_comments_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE SET NULL,

        ADD CONSTRAINT "video_comments_parentId_fkey"
        FOREIGN KEY ("parentId") REFERENCES "video_comments"("id") ON DELETE SET NULL;
      `);

    } catch (error) {
      console.log('Rollback failed for video_comments:', error.message);
    }

    try {
      await db.query(`
        ALTER TABLE video_article_tags
        DROP CONSTRAINT IF EXISTS "video_article_tags_videoArticleId_fkey",
        DROP CONSTRAINT IF EXISTS "video_article_tags_tagId_fkey";
      `);

      await db.query(`
        ALTER TABLE video_article_tags
        ADD CONSTRAINT "video_article_tags_videoArticleId_fkey"
        FOREIGN KEY ("videoArticleId") REFERENCES "VideoArticles"("id") ON DELETE SET NULL,

        ADD CONSTRAINT "video_article_tags_tagId_fkey"
        FOREIGN KEY ("tagId") REFERENCES "Tags"("id") ON DELETE SET NULL;
      `);

    } catch (error) {
      console.log('Rollback failed for video_article_tags:', error.message);
    }

    try {
      await db.query(`
        ALTER TABLE "VideoArticleViews"
        DROP CONSTRAINT IF EXISTS "VideoArticleViews_userId_fkey";
      `);

      await db.query(`
        ALTER TABLE "VideoArticleViews"
        ADD CONSTRAINT "VideoArticleViews_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE SET NULL;
      `);

    } catch (error) {
      console.log('Rollback failed for VideoArticleViews:', error.message);
    }
  }
};