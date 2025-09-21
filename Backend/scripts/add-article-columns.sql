-- Add new columns to Articles table
ALTER TABLE "Articles" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Articles" ADD COLUMN IF NOT EXISTS "categoryId" UUID REFERENCES "Categories"("id") ON DELETE SET NULL;
ALTER TABLE "Articles" ADD COLUMN IF NOT EXISTS "heroSlider" BOOLEAN DEFAULT FALSE;

-- Update subcategoryId reference to point to Subcategories instead of Tags
ALTER TABLE "Articles" DROP CONSTRAINT IF EXISTS "Articles_subcategoryId_fkey";
ALTER TABLE "Articles" ADD CONSTRAINT "Articles_subcategoryId_fkey"
    FOREIGN KEY ("subcategoryId") REFERENCES "Subcategories"("id") ON DELETE SET NULL;