-- SQL Script to Update Taxonomy
-- This script replaces the JavaScript update-taxonomy.js with pure SQL

-- Start transaction
BEGIN;

-- Step 1: Clear existing references to avoid foreign key constraints
UPDATE "Tags" SET "categoryId" = NULL WHERE "categoryId" IS NOT NULL;
UPDATE "Articles" SET "categoryId" = NULL WHERE "categoryId" IS NOT NULL;
DELETE FROM "VideoArticles";

-- Step 2: Force delete all existing categories (including subcategories)
TRUNCATE TABLE "Categories" CASCADE;

-- Step 3: Insert new categories and subcategories
-- Function to generate slug (equivalent to the JavaScript generateSlug function)
-- Note: This uses PostgreSQL string functions

-- Insert Category 1: News
INSERT INTO "Categories" (id, name, slug, description, design, status, "parentId", "order", "isActive", "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), 'News', regexp_replace(lower(regexp_replace('News', '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'), 'News articles, reporting, and editorial content', 'design1', 'active', NULL, 1, true, NOW(), NOW());

-- Get the ID of the News category for subcategories
-- Note: In a real script, you'd store this in a variable, but for simplicity, we'll use subqueries

-- Insert subcategories for News
INSERT INTO "Categories" (id, name, slug, description, design, status, "parentId", "order", "isActive", "createdAt", "updatedAt")
SELECT
gen_random_uuid(),
unnest(ARRAY['Hard News', 'Soft News', 'Investigative Reporting', 'Feature Articles', 'Analysis & Commentary', 'Opinion Pieces', 'Commentary', 'Columns', 'Letters to Editor', 'Market Reports', 'Earnings Coverage', 'Economic Analysis', 'Industry Reports', 'Executive Profiles', 'Company News', 'Video Content', 'Audio Content', 'Visual Content', 'Interactive Content', 'Social Media Content', 'Newsletter Content', 'Mobile-Specific', 'Emerging Formats']),
regexp_replace(lower(regexp_replace(unnest(ARRAY['Hard News', 'Soft News', 'Investigative Reporting', 'Feature Articles', 'Analysis & Commentary', 'Opinion Pieces', 'Commentary', 'Columns', 'Letters to Editor', 'Market Reports', 'Earnings Coverage', 'Economic Analysis', 'Industry Reports', 'Executive Profiles', 'Company News', 'Video Content', 'Audio Content', 'Visual Content', 'Interactive Content', 'Social Media Content', 'Newsletter Content', 'Mobile-Specific', 'Emerging Formats']), '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'),
unnest(ARRAY['Hard News content', 'Soft News content', 'Investigative Reporting content', 'Feature Articles content', 'Analysis & Commentary content', 'Opinion Pieces content', 'Commentary content', 'Columns content', 'Letters to Editor content', 'Market Reports content', 'Earnings Coverage content', 'Economic Analysis content', 'Industry Reports content', 'Executive Profiles content', 'Company News content', 'Video Content content', 'Audio Content content', 'Visual Content content', 'Interactive Content content', 'Social Media Content content', 'Newsletter Content content', 'Mobile-Specific content', 'Emerging Formats content']),
'design1', 'active', c.id, generate_series(1, 23), true, NOW(), NOW()
FROM "Categories" c WHERE c.name = 'News';

-- Insert Category 2: Geographic Coverage
INSERT INTO "Categories" (id, name, slug, description, design, status, "parentId", "order", "isActive", "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), 'Geographic Coverage', regexp_replace(lower(regexp_replace('Geographic Coverage', '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'), 'Regional and country-specific content location', 'design1', 'active', NULL, 2, true, NOW(), NOW());

-- Insert subcategories for Geographic Coverage
INSERT INTO "Categories" (id, name, slug, description, design, status, "parentId", "order", "isActive", "createdAt", "updatedAt")
SELECT
gen_random_uuid(),
unnest(ARRAY['Global', 'East Asia and Pacific', 'Europe and Central Asia', 'Latin America and Caribbean', 'Middle East, North Africa, Afghanistan and Pakistan', 'North America', 'South Asia', 'Sub-Saharan Africa', 'Northeast Asia', 'Southeast Asia (ASEAN)', 'Oceania', 'Western Europe', 'Eastern Europe', 'Balkans', 'Central Asia', 'South America', 'Central America', 'Caribbean', 'Gulf Cooperation Council (GCC)', 'Middle East', 'North Africa', 'Extended Region', 'West Africa', 'East Africa', 'Central Africa', 'Southern Africa']),
regexp_replace(lower(regexp_replace(unnest(ARRAY['Global', 'East Asia and Pacific', 'Europe and Central Asia', 'Latin America and Caribbean', 'Middle East, North Africa, Afghanistan and Pakistan', 'North America', 'South Asia', 'Sub-Saharan Africa', 'Northeast Asia', 'Southeast Asia (ASEAN)', 'Oceania', 'Western Europe', 'Eastern Europe', 'Balkans', 'Central Asia', 'South America', 'Central America', 'Caribbean', 'Gulf Cooperation Council (GCC)', 'Middle East', 'North Africa', 'Extended Region', 'West Africa', 'East Africa', 'Central Africa', 'Southern Africa']), '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'),
unnest(ARRAY['Global content', 'East Asia and Pacific content', 'Europe and Central Asia content', 'Latin America and Caribbean content', 'Middle East, North Africa, Afghanistan and Pakistan content', 'North America content', 'South Asia content', 'Sub-Saharan Africa content', 'Northeast Asia content', 'Southeast Asia (ASEAN) content', 'Oceania content', 'Western Europe content', 'Eastern Europe content', 'Balkans content', 'Central Asia content', 'South America content', 'Central America content', 'Caribbean content', 'Gulf Cooperation Council (GCC) content', 'Middle East content', 'North Africa content', 'Extended Region content', 'West Africa content', 'East Africa content', 'Central Africa content', 'Southern Africa content']),
'design1', 'active', c.id, generate_series(24, 49), true, NOW(), NOW()
FROM "Categories" c WHERE c.name = 'Geographic Coverage';

-- Insert Category 3: Real Estate
INSERT INTO "Categories" (id, name, slug, description, design, status, "parentId", "order", "isActive", "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), 'Real Estate', regexp_replace(lower(regexp_replace('Real Estate', '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'), 'Real estate sectors and property-related classifications', 'design1', 'active', NULL, 3, true, NOW(), NOW());

-- Insert subcategories for Real Estate
INSERT INTO "Categories" (id, name, slug, description, design, status, "parentId", "order", "isActive", "createdAt", "updatedAt")
SELECT
gen_random_uuid(),
unnest(ARRAY['Residential Real Estate', 'Commercial Real Estate', 'Industrial Real Estate', 'Retail Properties', 'Real Estate Investment Trusts (REITs)', 'Property Management', 'Real Estate Development', 'PropTech']),
regexp_replace(lower(regexp_replace(unnest(ARRAY['Residential Real Estate', 'Commercial Real Estate', 'Industrial Real Estate', 'Retail Properties', 'Real Estate Investment Trusts (REITs)', 'Property Management', 'Real Estate Development', 'PropTech']), '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'),
unnest(ARRAY['Residential Real Estate content', 'Commercial Real Estate content', 'Industrial Real Estate content', 'Retail Properties content', 'Real Estate Investment Trusts (REITs) content', 'Property Management content', 'Real Estate Development content', 'PropTech content']),
'design1', 'active', c.id, generate_series(50, 57), true, NOW(), NOW()
FROM "Categories" c WHERE c.name = 'Real Estate';

-- Insert Category 4: Industries
INSERT INTO "Categories" (id, name, slug, description, design, status, "parentId", "order", "isActive", "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), 'Industries', regexp_replace(lower(regexp_replace('Industries', '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'), 'Business sectors and industry verticals', 'design1', 'active', NULL, 4, true, NOW(), NOW());

-- Insert subcategories for Industries (this is a large array, so we'll do it in parts)
INSERT INTO "Categories" (id, name, slug, description, design, status, "parentId", "order", "isActive", "createdAt", "updatedAt")
SELECT
gen_random_uuid(),
unnest(ARRAY['Technology & Digital', 'Financial Services', 'Healthcare & Life Sciences', 'Energy & Utilities', 'Manufacturing & Industrial', 'Consumer Goods & Retail', 'Real Estate & Construction', 'Media & Entertainment', 'Education', 'Agriculture & Food', 'Software & Services', 'Hardware & Equipment', 'Internet & Digital Media', 'Fintech', 'Web3 & Blockchain', 'Banking', 'Insurance', 'Investment Management', 'Capital Markets', 'Pharmaceuticals', 'Medical Devices', 'Healthcare Services', 'Digital Health', 'Oil & Gas', 'Renewable Energy', 'Electric Utilities', 'Clean Technology', 'Automotive', 'Aerospace & Defense', 'Industrial Equipment', 'Materials', 'Consumer Products', 'Fashion & Apparel', 'Retail', 'Hospitality', 'Residential Real Estate', 'Commercial Real Estate', 'Construction', 'Property Technology (PropTech)', 'Traditional Media', 'Digital Media', 'Entertainment', 'Advertising', 'Higher Education', 'K-12 Education', 'EdTech', 'Professional Training', 'Crop Production', 'Livestock', 'Food Processing', 'Agricultural Technology']),
regexp_replace(lower(regexp_replace(unnest(ARRAY['Technology & Digital', 'Financial Services', 'Healthcare & Life Sciences', 'Energy & Utilities', 'Manufacturing & Industrial', 'Consumer Goods & Retail', 'Real Estate & Construction', 'Media & Entertainment', 'Education', 'Agriculture & Food', 'Software & Services', 'Hardware & Equipment', 'Internet & Digital Media', 'Fintech', 'Web3 & Blockchain', 'Banking', 'Insurance', 'Investment Management', 'Capital Markets', 'Pharmaceuticals', 'Medical Devices', 'Healthcare Services', 'Digital Health', 'Oil & Gas', 'Renewable Energy', 'Electric Utilities', 'Clean Technology', 'Automotive', 'Aerospace & Defense', 'Industrial Equipment', 'Materials', 'Consumer Products', 'Fashion & Apparel', 'Retail', 'Hospitality', 'Residential Real Estate', 'Commercial Real Estate', 'Construction', 'Property Technology (PropTech)', 'Traditional Media', 'Digital Media', 'Entertainment', 'Advertising', 'Higher Education', 'K-12 Education', 'EdTech', 'Professional Training', 'Crop Production', 'Livestock', 'Food Processing', 'Agricultural Technology']), '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'),
unnest(ARRAY['Technology & Digital content', 'Financial Services content', 'Healthcare & Life Sciences content', 'Energy & Utilities content', 'Manufacturing & Industrial content', 'Consumer Goods & Retail content', 'Real Estate & Construction content', 'Media & Entertainment content', 'Education content', 'Agriculture & Food content', 'Software & Services content', 'Hardware & Equipment content', 'Internet & Digital Media content', 'Fintech content', 'Web3 & Blockchain content', 'Banking content', 'Insurance content', 'Investment Management content', 'Capital Markets content', 'Pharmaceuticals content', 'Medical Devices content', 'Healthcare Services content', 'Digital Health content', 'Oil & Gas content', 'Renewable Energy content', 'Electric Utilities content', 'Clean Technology content', 'Automotive content', 'Aerospace & Defense content', 'Industrial Equipment content', 'Materials content', 'Consumer Products content', 'Fashion & Apparel content', 'Retail content', 'Hospitality content', 'Residential Real Estate content', 'Commercial Real Estate content', 'Construction content', 'Property Technology (PropTech) content', 'Traditional Media content', 'Digital Media content', 'Entertainment content', 'Advertising content', 'Higher Education content', 'K-12 Education content', 'EdTech content', 'Professional Training content', 'Crop Production content', 'Livestock content', 'Food Processing content', 'Agricultural Technology content']),
'design1', 'active', c.id, generate_series(57, 108), true, NOW(), NOW()
FROM "Categories" c WHERE c.name = 'Industries';

-- Insert Category 5: Finance
INSERT INTO "Categories" (id, name, slug, description, design, status, "parentId", "order", "isActive", "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), 'Finance', regexp_replace(lower(regexp_replace('Finance', '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'), 'Company size, maturity, funding, and financial classifications', 'design1', 'active', NULL, 5, true, NOW(), NOW());

-- Insert subcategories for Finance
INSERT INTO "Categories" (id, name, slug, description, design, status, "parentId", "order", "isActive", "createdAt", "updatedAt")
SELECT
gen_random_uuid(),
unnest(ARRAY['Banking', 'Insurance', 'Investment Management', 'Capital Markets', 'Fintech', 'Private Equity', 'Venture Capital', 'Hedge Funds', 'Pre-Seed Funding', 'Seed Funding', 'Series A', 'Series B', 'Series C+', 'IPO/Exit']),
regexp_replace(lower(regexp_replace(unnest(ARRAY['Banking', 'Insurance', 'Investment Management', 'Capital Markets', 'Fintech', 'Private Equity', 'Venture Capital', 'Hedge Funds', 'Pre-Seed Funding', 'Seed Funding', 'Series A', 'Series B', 'Series C+', 'IPO/Exit']), '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'),
unnest(ARRAY['Banking content', 'Insurance content', 'Investment Management content', 'Capital Markets content', 'Fintech content', 'Private Equity content', 'Venture Capital content', 'Hedge Funds content', 'Pre-Seed Funding content', 'Seed Funding content', 'Series A content', 'Series B content', 'Series C+ content', 'IPO/Exit content']),
'design1', 'active', c.id, generate_series(108, 121), true, NOW(), NOW()
FROM "Categories" c WHERE c.name = 'Finance';

-- Insert Category 6: Consumer
INSERT INTO "Categories" (id, name, slug, description, design, status, "parentId", "order", "isActive", "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), 'Consumer', regexp_replace(lower(regexp_replace('Consumer', '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'), 'Lifestyle segments and consumer behavior patterns', 'design1', 'active', NULL, 6, true, NOW(), NOW());

-- Insert subcategories for Consumer
INSERT INTO "Categories" (id, name, slug, description, design, status, "parentId", "order", "isActive", "createdAt", "updatedAt")
SELECT
gen_random_uuid(),
unnest(ARRAY['Innovators', 'Thinkers', 'Achievers', 'Experiencers', 'Believers', 'Strivers', 'Makers', 'Survivors', 'Health & Fitness', 'Technology', 'Luxury & Premium', 'Environmental', 'Young Adults (18-30)', 'Young Families (30-45)', 'Established Families (35-55)', 'Empty Nesters (50-70)', 'Retirees (65+)']),
regexp_replace(lower(regexp_replace(unnest(ARRAY['Innovators', 'Thinkers', 'Achievers', 'Experiencers', 'Believers', 'Strivers', 'Makers', 'Survivors', 'Health & Fitness', 'Technology', 'Luxury & Premium', 'Environmental', 'Young Adults (18-30)', 'Young Families (30-45)', 'Established Families (35-55)', 'Empty Nesters (50-70)', 'Retirees (65+)']), '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'),
unnest(ARRAY['Innovators content', 'Thinkers content', 'Achievers content', 'Experiencers content', 'Believers content', 'Strivers content', 'Makers content', 'Survivors content', 'Health & Fitness content', 'Technology content', 'Luxury & Premium content', 'Environmental content', 'Young Adults (18-30) content', 'Young Families (30-45) content', 'Established Families (35-55) content', 'Empty Nesters (50-70) content', 'Retirees (65+) content']),
'design1', 'active', c.id, generate_series(122, 138), true, NOW(), NOW()
FROM "Categories" c WHERE c.name = 'Consumer';

-- Insert Category 7: Web3
INSERT INTO "Categories" (id, name, slug, description, design, status, "parentId", "order", "isActive", "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), 'Web3', regexp_replace(lower(regexp_replace('Web3', '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'), 'Blockchain, crypto, and decentralized technologies', 'design1', 'active', NULL, 7, true, NOW(), NOW());

-- Insert subcategories for Web3
INSERT INTO "Categories" (id, name, slug, description, design, status, "parentId", "order", "isActive", "createdAt", "updatedAt")
SELECT
gen_random_uuid(),
unnest(ARRAY['Blockchain', 'Cryptocurrencies', 'Non-Fungible Tokens (NFTs)', 'Decentralized Finance (DeFi)', 'Decentralized Applications (dApps)', 'DAOs (Decentralized Autonomous Organizations)', 'Smart Contracts', 'Web3 Gaming', 'Metaverse', 'Tokenization', 'Layer 1 Protocols', 'Layer 2 Solutions']),
regexp_replace(lower(regexp_replace(unnest(ARRAY['Blockchain', 'Cryptocurrencies', 'Non-Fungible Tokens (NFTs)', 'Decentralized Finance (DeFi)', 'Decentralized Applications (dApps)', 'DAOs (Decentralized Autonomous Organizations)', 'Smart Contracts', 'Web3 Gaming', 'Metaverse', 'Tokenization', 'Layer 1 Protocols', 'Layer 2 Solutions']), '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'),
unnest(ARRAY['Blockchain content', 'Cryptocurrencies content', 'Non-Fungible Tokens (NFTs) content', 'Decentralized Finance (DeFi) content', 'Decentralized Applications (dApps) content', 'DAOs (Decentralized Autonomous Organizations) content', 'Smart Contracts content', 'Web3 Gaming content', 'Metaverse content', 'Tokenization content', 'Layer 1 Protocols content', 'Layer 2 Solutions content']),
'design1', 'active', c.id, generate_series(139, 150), true, NOW(), NOW()
FROM "Categories" c WHERE c.name = 'Web3';

-- Insert Category 8: Hospitality
INSERT INTO "Categories" (id, name, slug, description, design, status, "parentId", "order", "isActive", "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), 'Hospitality', regexp_replace(lower(regexp_replace('Hospitality', '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'), 'Hospitality, tourism, and accommodation industry', 'design1', 'active', NULL, 8, true, NOW(), NOW());

-- Insert subcategories for Hospitality
INSERT INTO "Categories" (id, name, slug, description, design, status, "parentId", "order", "isActive", "createdAt", "updatedAt")
SELECT
gen_random_uuid(),
unnest(ARRAY['Hotels & Accommodations', 'Restaurants & Food Service', 'Travel & Tourism', 'Luxury Hotels', 'Budget Accommodations', 'Resort Management', 'Event Management', 'Cruise Industry', 'Airlines', 'Food & Beverage', 'Hotel Technology', 'Tourism Boards', 'Hospitality Management', 'Guest Services', 'Hospitality Innovation']),
regexp_replace(lower(regexp_replace(unnest(ARRAY['Hotels & Accommodations', 'Restaurants & Food Service', 'Travel & Tourism', 'Luxury Hotels', 'Budget Accommodations', 'Resort Management', 'Event Management', 'Cruise Industry', 'Airlines', 'Food & Beverage', 'Hotel Technology', 'Tourism Boards', 'Hospitality Management', 'Guest Services', 'Hospitality Innovation']), '[^a-zA-Z0-9\s-]', '', 'g')), '\s+', '-', 'g'),
unnest(ARRAY['Hotels & Accommodations content', 'Restaurants & Food Service content', 'Travel & Tourism content', 'Luxury Hotels content', 'Budget Accommodations content', 'Resort Management content', 'Event Management content', 'Cruise Industry content', 'Airlines content', 'Food & Beverage content', 'Hotel Technology content', 'Tourism Boards content', 'Hospitality Management content', 'Guest Services content', 'Hospitality Innovation content']),
'design1', 'active', c.id, generate_series(179, 193), true, NOW(), NOW()
FROM "Categories" c WHERE c.name = 'Hospitality';

-- Commit the transaction
COMMIT;

-- Display summary
SELECT
    (SELECT COUNT(*) FROM "Categories" WHERE "parentId" IS NULL) as main_categories,
    (SELECT COUNT(*) FROM "Categories" WHERE "parentId" IS NOT NULL) as subcategories,
    (SELECT COUNT(*) FROM "Categories") as total_categories;