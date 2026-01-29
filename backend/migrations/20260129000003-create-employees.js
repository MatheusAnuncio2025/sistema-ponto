'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('employees', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      employee_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      department: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      position: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      hire_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      work_schedule_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'work_schedules',
          key: 'id',
        },
        onDelete: 'SET NULL',
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
      is_hybrid: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      hours_balance: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
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
    await queryInterface.addIndex('employees', ['user_id']);
    await queryInterface.addIndex('employees', ['employee_code'], { unique: true });
    await queryInterface.addIndex('employees', ['work_schedule_id']);
    await queryInterface.addIndex('employees', ['work_location_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('employees');
  },
};
