'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to Articles table (with error handling for existing columns)
    try {
      await queryInterface.addColumn('Articles', 'nationality', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('Articles', 'age', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('Articles', 'gender', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('Articles', 'ethnicity', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('Articles', 'residency', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('Articles', 'industry', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('Articles', 'position', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('Articles', 'imageDisplayMode', {
        type: Sequelize.ENUM('single', 'multiple', 'slider'),
        defaultValue: 'single',
        allowNull: false
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('Articles', 'links', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('Articles', 'socialEmbeds', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('Articles', 'externalLinkFollow', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('Articles', 'captchaVerified', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('Articles', 'guidelinesAccepted', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    } catch (error) {
      // Column might already exist, continue
    }

    // Add new columns to VideoArticles table (with error handling for existing columns)
    try {
      await queryInterface.addColumn('VideoArticles', 'nationality', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('VideoArticles', 'age', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('VideoArticles', 'gender', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('VideoArticles', 'ethnicity', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('VideoArticles', 'residency', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('VideoArticles', 'industry', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('VideoArticles', 'position', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('VideoArticles', 'imageDisplayMode', {
        type: Sequelize.ENUM('single', 'multiple', 'slider'),
        defaultValue: 'single',
        allowNull: false
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('VideoArticles', 'links', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('VideoArticles', 'socialEmbeds', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('VideoArticles', 'externalLinkFollow', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('VideoArticles', 'captchaVerified', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    } catch (error) {
      // Column might already exist, continue
    }

    try {
      await queryInterface.addColumn('VideoArticles', 'guidelinesAccepted', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    } catch (error) {
      // Column might already exist, continue
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove columns from Articles table
    await queryInterface.removeColumn('Articles', 'nationality');
    await queryInterface.removeColumn('Articles', 'age');
    await queryInterface.removeColumn('Articles', 'gender');
    await queryInterface.removeColumn('Articles', 'ethnicity');
    await queryInterface.removeColumn('Articles', 'residency');
    await queryInterface.removeColumn('Articles', 'industry');
    await queryInterface.removeColumn('Articles', 'position');
    await queryInterface.removeColumn('Articles', 'imageDisplayMode');
    await queryInterface.removeColumn('Articles', 'links');
    await queryInterface.removeColumn('Articles', 'socialEmbeds');
    await queryInterface.removeColumn('Articles', 'externalLinkFollow');
    await queryInterface.removeColumn('Articles', 'captchaVerified');
    await queryInterface.removeColumn('Articles', 'guidelinesAccepted');

    // Remove columns from VideoArticles table
    await queryInterface.removeColumn('VideoArticles', 'nationality');
    await queryInterface.removeColumn('VideoArticles', 'age');
    await queryInterface.removeColumn('VideoArticles', 'gender');
    await queryInterface.removeColumn('VideoArticles', 'ethnicity');
    await queryInterface.removeColumn('VideoArticles', 'residency');
    await queryInterface.removeColumn('VideoArticles', 'industry');
    await queryInterface.removeColumn('VideoArticles', 'position');
    await queryInterface.removeColumn('VideoArticles', 'imageDisplayMode');
    await queryInterface.removeColumn('VideoArticles', 'links');
    await queryInterface.removeColumn('VideoArticles', 'socialEmbeds');
    await queryInterface.removeColumn('VideoArticles', 'externalLinkFollow');
    await queryInterface.removeColumn('VideoArticles', 'captchaVerified');
    await queryInterface.removeColumn('VideoArticles', 'guidelinesAccepted');
  }
};