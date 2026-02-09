'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('work_schedules', 'day_rules', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Regras por dia da semana: {1: {start_time, end_time, lunch_start, lunch_end}, ...}',
    });

    await queryInterface.addColumn('employees', 'lunch_start', {
      type: Sequelize.TIME,
      allowNull: true,
      comment: 'Horário de saída para almoço (override por funcionário)',
    });

    await queryInterface.addColumn('employees', 'lunch_end', {
      type: Sequelize.TIME,
      allowNull: true,
      comment: 'Horário de retorno do almoço (override por funcionário)',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('employees', 'lunch_end');
    await queryInterface.removeColumn('employees', 'lunch_start');
    await queryInterface.removeColumn('work_schedules', 'day_rules');
  },
};
