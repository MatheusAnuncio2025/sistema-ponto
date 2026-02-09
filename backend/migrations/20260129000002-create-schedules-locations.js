'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Criar tabela work_schedules
    await queryInterface.createTable('work_schedules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('5x2', '6x1', 'custom'),
        allowNull: false,
      },
      work_days: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      lunch_start: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      lunch_end: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      tolerance_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      weekly_hours: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      has_alternating_saturdays: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

    // Criar tabela work_locations
    await queryInterface.createTable('work_locations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
      },
      radius: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      is_active: {
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('work_locations');
    await queryInterface.dropTable('work_schedules');
  },
};
