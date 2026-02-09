'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('employees', 'punch_override_until', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Permite bater ponto fora da janela atÃ© esta data/hora',
    });

    await queryInterface.addColumn('employees', 'punch_override_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      comment: 'UsuÃ¡rio que liberou o ponto fora da janela',
    });

    await queryInterface.addColumn('employees', 'punch_override_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Motivo da liberaÃ§Ã£o para ponto fora da janela',
    });

    await queryInterface.addColumn('time_records', 'is_schedule_override', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'MarcaÃ§Ã£o feita fora da janela de horÃ¡rio com liberaÃ§Ã£o',
    });

    await queryInterface.addColumn('time_records', 'schedule_override_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      comment: 'UsuÃ¡rio que liberou a marcaÃ§Ã£o fora da janela',
    });

    await queryInterface.addColumn('time_records', 'schedule_override_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Motivo da liberaÃ§Ã£o para marcaÃ§Ã£o fora da janela',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('time_records', 'schedule_override_reason');
    await queryInterface.removeColumn('time_records', 'schedule_override_by');
    await queryInterface.removeColumn('time_records', 'is_schedule_override');
    await queryInterface.removeColumn('employees', 'punch_override_reason');
    await queryInterface.removeColumn('employees', 'punch_override_by');
    await queryInterface.removeColumn('employees', 'punch_override_until');
  },
};
