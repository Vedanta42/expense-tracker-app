'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Adds the 'note' column to the 'Expenses' table
    await queryInterface.addColumn('Expenses', 'note', {
      type: Sequelize.STRING,
      allowNull: true, // true because old expenses won't have a note
    });
  },

  async down (queryInterface, Sequelize) {
    // Removes the 'note' column if we need to rollback
    await queryInterface.removeColumn('Expenses', 'note');
  }
};