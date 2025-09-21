-- Add featured image fields to VideoArticles table
-- Run this script to add the featured image functionality to video articles

-- Add featuredImage column
ALTER TABLE "VideoArticles"
ADD COLUMN IF NOT EXISTS "featuredImage" VARCHAR(255);

-- Add imageCaption column
ALTER TABLE "VideoArticles"
ADD COLUMN IF NOT EXISTS "imageCaption" VARCHAR(255);

-- Add imageAlt column
ALTER TABLE "VideoArticles"
ADD COLUMN IF NOT EXISTS "imageAlt" VARCHAR(255);

-- Add comments for documentation
COMMENT ON COLUMN "VideoArticles"."featuredImage" IS 'Path to the featured image file';
COMMENT ON COLUMN "VideoArticles"."imageCaption" IS 'Caption for the featured image';
COMMENT ON COLUMN "VideoArticles"."imageAlt" IS 'Alt text for the featured image for SEO';

-- Verify the columns were added
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'VideoArticles'
    AND column_name IN ('featuredImage', 'imageCaption', 'imageAlt')
ORDER BY column_name;