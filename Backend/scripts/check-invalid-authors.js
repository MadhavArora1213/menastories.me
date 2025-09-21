const { sequelize } = require('../models');

async function checkInvalidAuthors() {
  try {
    console.log('Checking for articles with invalid authorIds...');

    // Get all articles with their authorIds
    const [articles] = await sequelize.query(`
      SELECT id, "authorId", title FROM "Articles" WHERE "authorId" IS NOT NULL;
    `);

    console.log(`Found ${articles.length} articles with authorIds`);

    // Get all valid author IDs
    const [authors] = await sequelize.query(`
      SELECT id, name FROM "Authors";
    `);

    console.log(`Found ${authors.length} authors in database`);

    const validAuthorIds = new Set(authors.map(a => a.id));
    const invalidArticles = articles.filter(article => !validAuthorIds.has(article.authorId));

    console.log(`Found ${invalidArticles.length} articles with invalid authorIds:`);

    invalidArticles.forEach(article => {
      console.log(`- Article ID: ${article.id}`);
      console.log(`  Title: ${article.title}`);
      console.log(`  Invalid authorId: ${article.authorId}`);
    });

    if (invalidArticles.length > 0) {
      console.log('\nOptions to fix:');
      console.log('1. Set invalid authorIds to NULL');
      console.log('2. Delete articles with invalid authorIds');
      console.log('3. Create missing authors (if you have the data)');
    }

  } catch (error) {
    console.error('❌ Error checking invalid authors:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the check
checkInvalidAuthors().then(() => {
  console.log('Check completed.');
  process.exit(0);
});