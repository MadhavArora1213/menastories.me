-- Seed Categories and Subcategories Data
-- This script populates the Categories table with main categories and their subcategories

-- First, insert main categories (parent categories)
INSERT INTO "Categories" ("id", "name", "slug", "description", "design", "status", "featureImage", "parentId", "order", "isActive", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440001', 'PEOPLE & PROFILES', 'people-profiles', 'Comprehensive personality coverage spanning entertainment figures to business innovators', 'design1', 'active', NULL, NULL, 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'ENTERTAINMENT', 'entertainment', 'Complete entertainment industry coverage from film and television to music and celebrity culture', 'design1', 'active', NULL, NULL, 2, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'LIFESTYLE', 'lifestyle', 'Diverse lifestyle content covering personal interests from fashion trends to family guidance', 'design1', 'active', NULL, NULL, 3, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'CULTURE & SOCIETY', 'culture-society', 'Cultural exploration encompassing artistic expression, social commentary, and contemporary trends', 'design1', 'active', NULL, NULL, 4, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'BUSINESS & LEADERSHIP', 'business-leadership', 'Professional focus on business innovation, leadership development, and financial guidance', 'design1', 'active', NULL, NULL, 5, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'REGIONAL FOCUS', 'regional-focus', 'Local emphasis on UAE-specific content including community leaders and regional developments', 'design1', 'active', NULL, NULL, 6, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'SPECIAL SECTIONS', 'special-sections', 'Curated recognition content highlighting influential personalities across various sectors', 'design1', 'active', NULL, NULL, 7, true, NOW(), NOW());

-- Now insert subcategories for PEOPLE & PROFILES
INSERT INTO "Categories" ("id", "name", "slug", "description", "design", "status", "featureImage", "parentId", "order", "isActive", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Celebrity Spotlight', 'celebrity-spotlight', 'In-depth profiles of entertainment celebrities and their impact', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440001', 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'Influencer Stories', 'influencer-stories', 'Digital influencers and their journey to success', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440001', 2, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'Business Leaders', 'business-leaders', 'Profiles of successful entrepreneurs and executives', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440001', 3, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'Rising Stars', 'rising-stars', 'Emerging talents making their mark in various fields', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440001', 4, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440015', 'Local Personalities', 'local-personalities', 'Community leaders and local influencers', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440001', 5, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440016', 'International Icons', 'international-icons', 'Global figures shaping world events', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440001', 6, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440017', 'Changemakers', 'changemakers', 'Individuals driving positive social change', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440001', 7, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440018', 'Entrepreneurs', 'entrepreneurs', 'Innovative business creators and founders', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440001', 8, true, NOW(), NOW());

-- Subcategories for ENTERTAINMENT
INSERT INTO "Categories" ("id", "name", "slug", "description", "design", "status", "featureImage", "parentId", "order", "isActive", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440021', 'Bollywood News', 'bollywood-news', 'Latest updates from the Indian film industry', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440002', 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', 'Hollywood Updates', 'hollywood-updates', 'American film industry news and developments', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440002', 2, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440023', 'TV Shows & Series', 'tv-shows-series', 'Television programming and streaming content', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440002', 3, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440024', 'Music & Artists', 'music-artists', 'Music industry news and artist profiles', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440002', 4, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440025', 'Movie Reviews', 'movie-reviews', 'Film critiques and analysis', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440002', 5, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440026', 'Red Carpet Events', 'red-carpet-events', 'Award shows and premieres coverage', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440002', 6, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440027', 'Award Shows', 'award-shows', 'Major entertainment awards and ceremonies', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440002', 7, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440028', 'Celebrity Interviews', 'celebrity-interviews', 'Exclusive conversations with entertainment figures', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440002', 8, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440029', 'Behind the Scenes', 'behind-the-scenes', 'Production insights and making-of content', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440002', 9, true, NOW(), NOW());

-- Subcategories for LIFESTYLE
INSERT INTO "Categories" ("id", "name", "slug", "description", "design", "status", "featureImage", "parentId", "order", "isActive", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440031', 'Fashion & Style', 'fashion-style', 'Latest fashion trends and style guides', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440003', 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440032', 'Beauty & Skincare', 'beauty-skincare', 'Beauty tips and skincare routines', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440003', 2, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440033', 'Health & Wellness', 'health-wellness', 'Health tips and wellness practices', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440003', 3, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440034', 'Food & Recipes', 'food-recipes', 'Culinary delights and cooking guides', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440003', 4, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440035', 'Travel & Destinations', 'travel-destinations', 'Travel guides and destination reviews', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440003', 5, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440036', 'Home & Decor', 'home-decor', 'Interior design and home improvement', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440003', 6, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440037', 'Relationships & Dating', 'relationships-dating', 'Relationship advice and dating tips', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440003', 7, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440038', 'Parenting & Family', 'parenting-family', 'Family life and parenting guidance', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440003', 8, true, NOW(), NOW());

-- Subcategories for CULTURE & SOCIETY
INSERT INTO "Categories" ("id", "name", "slug", "description", "design", "status", "featureImage", "parentId", "order", "isActive", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440041', 'Art & Photography', 'art-photography', 'Visual arts and photography showcases', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440004', 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440042', 'Books & Literature', 'books-literature', 'Literary reviews and author spotlights', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440004', 2, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440043', 'Social Issues', 'social-issues', 'Important social topics and discussions', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440004', 3, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440044', 'Cultural Events', 'cultural-events', 'Cultural festivals and community events', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440004', 4, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440045', 'Heritage & Traditions', 'heritage-traditions', 'Cultural heritage and traditional practices', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440004', 5, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440046', 'Pop Culture', 'pop-culture', 'Popular culture trends and phenomena', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440004', 6, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440047', 'Digital Trends', 'digital-trends', 'Technology and digital culture insights', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440004', 7, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440048', 'Youth Culture', 'youth-culture', 'Young people and contemporary youth trends', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440004', 8, true, NOW(), NOW());

-- Subcategories for BUSINESS & LEADERSHIP
INSERT INTO "Categories" ("id", "name", "slug", "description", "design", "status", "featureImage", "parentId", "order", "isActive", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440051', 'Industry Leaders', 'industry-leaders', 'Profiles of business and industry leaders', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440005', 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440052', 'Startup Stories', 'startup-stories', 'Entrepreneurial journeys and startup success', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440005', 2, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440053', 'Women in Business', 'women-in-business', 'Female entrepreneurs and business leaders', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440005', 3, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440054', 'Corporate News', 'corporate-news', 'Corporate developments and business news', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440005', 4, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440055', 'Economic Trends', 'economic-trends', 'Economic analysis and market insights', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440005', 5, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440056', 'Leadership Insights', 'leadership-insights', 'Leadership strategies and management tips', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440005', 6, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440057', 'Career Advice', 'career-advice', 'Professional development and career guidance', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440005', 7, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440058', 'Money & Finance', 'money-finance', 'Financial planning and investment advice', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440005', 8, true, NOW(), NOW());

-- Subcategories for REGIONAL FOCUS
INSERT INTO "Categories" ("id", "name", "slug", "description", "design", "status", "featureImage", "parentId", "order", "isActive", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440061', 'UAE Spotlight', 'uae-spotlight', 'UAE news and developments', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440006', 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440062', 'Local Events', 'local-events', 'Community events and local happenings', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440006', 2, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440063', 'Community Heroes', 'community-heroes', 'Local heroes and community leaders', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440006', 3, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440064', 'Government News', 'government-news', 'Government initiatives and policies', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440006', 4, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440065', 'Cultural Festivals', 'cultural-festivals', 'Traditional and cultural celebrations', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440006', 5, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440066', 'Business Hub', 'business-hub', 'Business developments and opportunities', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440006', 6, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440067', 'Tourism & Attractions', 'tourism-attractions', 'Tourist destinations and attractions', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440006', 7, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440068', 'Local Personalities', 'local-personalities', 'Prominent local figures and influencers', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440006', 8, true, NOW(), NOW());

-- Subcategories for SPECIAL SECTIONS
INSERT INTO "Categories" ("id", "name", "slug", "description", "design", "status", "featureImage", "parentId", "order", "isActive", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440071', 'Power Lists (30 Under 30, 40 Under 40)', 'power-lists', 'Young leaders and influential personalities', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440007', 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440072', 'Annual Awards', 'annual-awards', 'Recognition and achievement celebrations', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440007', 2, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440073', 'Top Doctors', 'top-doctors', 'Medical professionals and healthcare leaders', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440007', 3, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440074', 'Women Leaders', 'women-leaders', 'Influential women in various fields', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440007', 4, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440075', 'Most Influential', 'most-influential', 'People with significant impact and influence', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440007', 5, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440076', 'Rising Entrepreneurs', 'rising-entrepreneurs', 'Emerging business leaders and innovators', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440007', 6, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440077', 'Social Impact Leaders', 'social-impact-leaders', 'Individuals driving positive social change', 'design1', 'active', NULL, '550e8400-e29b-41d4-a716-446655440007', 7, true, NOW(), NOW());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "categories_parent_id_idx" ON "Categories" ("parentId");
CREATE INDEX IF NOT EXISTS "categories_status_idx" ON "Categories" ("status");
CREATE INDEX IF NOT EXISTS "categories_order_idx" ON "Categories" ("order");
CREATE INDEX IF NOT EXISTS "categories_slug_idx" ON "Categories" ("slug");

-- Optional: Add a comment to document the data structure
COMMENT ON TABLE "Categories" IS 'Magazine categories with hierarchical structure - main categories have parentId=NULL, subcategories reference their parent category ID';