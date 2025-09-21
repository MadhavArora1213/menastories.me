'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('MediaKits', 'pdfFile', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Path to the uploaded and optimized PDF file'
    });

    await queryInterface.addColumn('MediaKits', 'pdfOriginalName', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Original filename of the uploaded PDF'
    });

    await queryInterface.addColumn('MediaKits', 'pdfSize', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Size of the PDF file in bytes'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('MediaKits', 'pdfFile');
    await queryInterface.removeColumn('MediaKits', 'pdfOriginalName');
    await queryInterface.removeColumn('MediaKits', 'pdfSize');
  }
};
