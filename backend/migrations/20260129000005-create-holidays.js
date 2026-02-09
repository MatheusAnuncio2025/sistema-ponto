'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('holidays', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('national', 'state', 'municipal', 'company'),
        allowNull: false,
        defaultValue: 'national',
      },
      is_recurring: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      applies_to_all: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Índice na data para buscas rápidas
    await queryInterface.addIndex('holidays', ['date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('holidays');
  },
};
