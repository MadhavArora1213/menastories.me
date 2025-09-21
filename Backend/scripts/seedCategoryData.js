const sequelize = require('../config/db');
const Category = require('../models/Category');

const sampleCategories = [
  {
    name: "People & Profiles",
    slug: "people-profiles",
    description: "Comprehensive personality coverage spanning entertainment figures to business innovators.",
    design: "design1",
    status: "active",
    featureImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1200&h=400&fit=crop",
    order: 1
  },
  {
    name: "Entertainment",
    slug: "entertainment",
    description: "Complete entertainment industry coverage from film and television to music and celebrity culture.",
    design: "design2",
    status: "active",
    featureImage: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&h=400&fit=crop",
    order: 2
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    description: "Diverse lifestyle content covering personal interests from fashion trends to family guidance.",
    design: "design3",
    status: "active",
    featureImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop",
    order: 3
  },
  {
    name: "Culture & Society",
    slug: "culture-society",
    description: "Cultural exploration encompassing artistic expression, social commentary, and contemporary trends.",
    design: "design1",
    status: "active",
    featureImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=400&fit=crop",
    order: 4
  },
  {
    name: "Business & Leadership",
    slug: "business-leadership",
    description: "Professional focus on business innovation, leadership development, and financial guidance.",
    design: "design2",
    status: "active",
    featureImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop",
    order: 5
  },
  {
    name: "Regional Focus",
    slug: "regional-focus",
    description: "Local emphasis on UAE-specific content including community leaders and regional developments.",
    design: "design3",
    status: "active",
    featureImage: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=400&fit=crop",
    order: 6
  },
  {
    name: "Special Sections",
    slug: "special-sections",
    description: "Curated recognition content highlighting influential personalities across various sectors.",
    design: "design1",
    status: "active",
    featureImage: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&h=400&fit=crop",
    order: 7
  }
];

async function seedCategoryData() {
  try {
    console.log('Starting category data seeding...');
    
    // Sync the database to ensure tables exist
    await sequelize.sync({ force: false });
    
    // Check if categories already exist
    const existingCategories = await Category.count();
    if (existingCategories > 0) {
      console.log(`Found ${existingCategories} existing categories. Skipping seeding.`);
      return;
    }
    
    // Create categories
    for (const categoryData of sampleCategories) {
      await Category.create(categoryData);
      console.log(`Created category: ${categoryData.name}`);
    }
    
    console.log('Category data seeding completed successfully!');
    console.log(`Created ${sampleCategories.length} categories`);
    
  } catch (error) {
    console.error('Error seeding category data:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the seeding
seedCategoryData();
