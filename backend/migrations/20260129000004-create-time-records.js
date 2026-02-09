'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('time_records', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      employee_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      record_type: {
        type: Sequelize.ENUM('entry', 'lunch_start', 'lunch_end', 'exit'),
        allowNull: false,
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      work_location_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'work_locations',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      is_within_radius: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      distance_meters: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      is_manual_adjustment: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      adjustment_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      approved_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      confirmation_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      device_info: {
        type: Sequelize.JSONB,
        allowNull: true,
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

    // Índices
    await queryInterface.addIndex('time_records', ['employee_id']);
    await queryInterface.addIndex('time_records', ['timestamp']);
    await queryInterface.addIndex('time_records', ['employee_id', 'timestamp']);
    await queryInterface.addIndex('time_records', ['confirmation_code'], { unique: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('time_records');
  },
};
