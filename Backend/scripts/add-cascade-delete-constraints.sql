-- Add CASCADE DELETE constraints to video article related tables
-- Run this script directly in PostgreSQL to fix the delete functionality

-- First, drop existing foreign key constraints if they exist
ALTER TABLE video_comments
DROP CONSTRAINT IF EXISTS video_comments_videoId_fkey,
DROP CONSTRAINT IF EXISTS video_comments_userId_fkey,
DROP CONSTRAINT IF EXISTS video_comments_parentId_fkey;

ALTER TABLE video_article_tags
DROP CONSTRAINT IF EXISTS video_article_tags_videoArticleId_fkey,
DROP CONSTRAINT IF EXISTS video_article_tags_tagId_fkey;

ALTER TABLE "VideoArticleViews"
DROP CONSTRAINT IF EXISTS "VideoArticleViews_userId_fkey";

-- Add new constraints with CASCADE DELETE
ALTER TABLE video_comments
ADD CONSTRAINT video_comments_videoId_fkey
FOREIGN KEY ("videoId") REFERENCES "VideoArticles"("id") ON DELETE CASCADE,

ADD CONSTRAINT video_comments_userId_fkey
FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE,

ADD CONSTRAINT video_comments_parentId_fkey
FOREIGN KEY ("parentId") REFERENCES video_comments("id") ON DELETE CASCADE;

ALTER TABLE video_article_tags
ADD CONSTRAINT video_article_tags_videoArticleId_fkey
FOREIGN KEY ("videoArticleId") REFERENCES "VideoArticles"("id") ON DELETE CASCADE,

ADD CONSTRAINT video_article_tags_tagId_fkey
FOREIGN KEY ("tagId") REFERENCES "Tags"("id") ON DELETE CASCADE;

ALTER TABLE "VideoArticleViews"
ADD CONSTRAINT "VideoArticleViews_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE;

-- Verify the constraints were added
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
LEFT JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name IN ('video_comments', 'video_article_tags', 'VideoArticleViews')
AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;