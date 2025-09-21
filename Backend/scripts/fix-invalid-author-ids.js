const { sequelize } = require('../models');

async function fixInvalidAuthorIds() {
  try {
    console.log('Fixing invalid authorIds in articles...');

    // Get all valid author IDs
    const [authors] = await sequelize.query(`
      SELECT id, name FROM "Authors";
    `);

    console.log(`Found ${authors.length} valid authors:`);
    authors.forEach(author => {
      console.log(`- ${author.id}: ${author.name}`);
    });

    if (authors.length === 0) {
      console.log('❌ No valid authors found. Cannot fix authorIds.');
      return;
    }

    // Use the first valid author as the default
    const defaultAuthorId = authors[0].id;
    console.log(`Using default author: ${defaultAuthorId} (${authors[0].name})`);

    const validAuthorIds = authors.map(a => `'${a.id}'`).join(', ');

    // Update invalid authorIds to the default valid author
    const [updateResult] = await sequelize.query(`
      UPDATE "Articles"
      SET "authorId" = '${defaultAuthorId}'
      WHERE "authorId" IS NOT NULL
      AND "authorId" NOT IN (${validAuthorIds});
    `);

    console.log(`✅ Updated ${updateResult.rowCount} articles with invalid authorIds`);

    // Verify the fix
    const [remainingInvalid] = await sequelize.query(`
      SELECT COUNT(*) as count FROM "Articles"
      WHERE "authorId" IS NOT NULL
      AND "authorId" NOT IN (SELECT id FROM "Authors");
    `);

    console.log(`Remaining invalid authorIds: ${remainingInvalid[0].count}`);

  } catch (error) {
    console.error('❌ Error fixing invalid authorIds:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixInvalidAuthorIds().then(() => {
  console.log('Invalid authorIds fix completed.');
  process.exit(0);
});