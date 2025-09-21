const { Article } = require('../models');

const syncArticleSchema = async () => {
  try {
    console.log('Starting Article schema synchronization...');

    // Sync the Article model with alter: true to add new columns
    await Article.sync({ alter: true });

    console.log('✅ Article schema synchronized successfully with Neon database');
    console.log('New fields added:');
    console.log('- workflowStage (enum)');
    console.log('- assignedTo (UUID, references Users)');
    console.log('- nextAction (string)');
    console.log('- featuredVideo (string)');
    console.log('- subcategoryId (UUID, references Tags)');
    console.log('- authorBioOverride (text)');
    console.log('- authorSocialLinks (JSON)');
    console.log('- promotional (boolean)');
    console.log('- allowComments (boolean, replaces disableComments)');

  } catch (error) {
    console.error('❌ Error synchronizing Article schema:', error);
    process.exit(1);
  }
};

// Run the sync
syncArticleSchema().then(() => {
  console.log('Article schema sync completed.');
  process.exit(0);
});