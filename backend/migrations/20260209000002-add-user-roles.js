'use strict';

module.exports = {
  up: async (queryInterface) => {
    // Adiciona novos valores ao enum de role (PostgreSQL)
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'hr';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'supervisor';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'coordinator';`
    );
  },

  down: async () => {
    // Remover valores de ENUM no Postgres Ã© complexo e arriscado.
    // Mantemos sem reversÃ£o automÃ¡tica para evitar perda de dados.
  },
};
