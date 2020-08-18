'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sOsOrders', {
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
      cheesecakeFlavor: {
        type: Sequelize.STRING
      },
      slice: {
        type: Sequelize.INTEGER
      },
      eight: {
        type: Sequelize.INTEGER
      },
      ten: {
        type: Sequelize.INTEGER
      },
      twelve: {
        type: Sequelize.INTEGER
      },
      granola: {
        type: Sequelize.INTEGER
      },
      yogurt: {
        type: Sequelize.INTEGER
      },
      bbq: {
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
    await queryInterface.dropTable('sOsOrders');
  }
};