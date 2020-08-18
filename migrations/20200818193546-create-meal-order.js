'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mealOrders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      days: {
        type: Sequelize.INTEGER
      },
      protein: {
        type: Sequelize.STRING
      },
      pasta: {
        type: Sequelize.INTEGER
      },
      quinoa: {
        type: Sequelize.INTEGER
      },
      rice: {
        type: Sequelize.INTEGER
      },
      potatoes: {
        type: Sequelize.INTEGER
      },
      asparagus: {
        type: Sequelize.INTEGER
      },
      carrots: {
        type: Sequelize.INTEGER
      },
      medley: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('mealOrders');
  }
};