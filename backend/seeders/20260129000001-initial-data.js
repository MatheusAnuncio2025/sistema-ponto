'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Hash da senha padrão: Admin@123
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    // 1. Criar usuário admin
    const adminId = uuidv4();
    await queryInterface.bulkInsert('users', [
      {
        id: adminId,
        name: 'Administrador',
        email: 'admin@empresa.com',
        password: passwordHash,
        role: 'admin',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    // 2. Criar escalas de trabalho padrão
    const escala5x2Id = uuidv4();
    const escala6x1Id = uuidv4();

    await queryInterface.bulkInsert('work_schedules', [
      {
        id: escala5x2Id,
        name: 'Escala 5x2 (Segunda a Sexta)',
        type: '5x2',
        work_days: [1, 2, 3, 4, 5], // Segunda a Sexta
        start_time: '08:00:00',
        lunch_start: '12:00:00',
        lunch_end: '13:00:00',
        end_time: '17:00:00',
        tolerance_minutes: 10,
        weekly_hours: 40.00,
        has_alternating_saturdays: false,
        created_at: now,
        updated_at: now,
      },
      {
        id: escala6x1Id,
        name: 'Escala 6x1 (Segunda a Sábado)',
        type: '6x1',
        work_days: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
        start_time: '08:00:00',
        lunch_start: '12:00:00',
        lunch_end: '13:00:00',
        end_time: '17:00:00',
        tolerance_minutes: 10,
        weekly_hours: 44.00,
        has_alternating_saturdays: false,
        created_at: now,
        updated_at: now,
      },
    ]);

    // 3. Criar local de trabalho padrão (exemplo: Mogi das Cruzes)
    const localId = uuidv4();
    await queryInterface.bulkInsert('work_locations', [
      {
        id: localId,
        name: 'Sede Principal',
        address: 'Mogi das Cruzes, São Paulo, BR',
        latitude: -23.5225,  // Coordenadas aproximadas de Mogi das Cruzes
        longitude: -46.1883,
        radius: 100, // 100 metros
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    // 4. Criar funcionário para o admin
    await queryInterface.bulkInsert('employees', [
      {
        id: uuidv4(),
        user_id: adminId,
        employee_code: 'ADM001',
        department: 'Administração',
        position: 'Administrador do Sistema',
        hire_date: now,
        work_schedule_id: escala5x2Id,
        work_location_id: localId,
        is_hybrid: true, // Admin pode trabalhar remotamente
        hours_balance: 0.00,
        created_at: now,
        updated_at: now,
      },
    ]);

    // 5. Adicionar feriados nacionais brasileiros de 2026
    const feriados2026 = [
      { name: 'Ano Novo', date: '2026-01-01' },
      { name: 'Carnaval', date: '2026-02-16' },
      { name: 'Carnaval', date: '2026-02-17' },
      { name: 'Sexta-feira Santa', date: '2026-04-03' },
      { name: 'Tiradentes', date: '2026-04-21' },
      { name: 'Dia do Trabalho', date: '2026-05-01' },
      { name: 'Corpus Christi', date: '2026-06-04' },
      { name: 'Independência do Brasil', date: '2026-09-07' },
      { name: 'Nossa Senhora Aparecida', date: '2026-10-12' },
      { name: 'Finados', date: '2026-11-02' },
      { name: 'Proclamação da República', date: '2026-11-15' },
      { name: 'Consciência Negra', date: '2026-11-20' },
      { name: 'Natal', date: '2026-12-25' },
    ];

    const feriadosInsert = feriados2026.map(f => ({
      id: uuidv4(),
      name: f.name,
      date: f.date,
      type: 'national',
      is_recurring: true,
      applies_to_all: true,
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert('holidays', feriadosInsert);

    console.log('✅ Dados iniciais criados com sucesso!');
    console.log('📧 Login: admin@empresa.com');
    console.log('🔑 Senha: Admin@123');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('employees', null, {});
    await queryInterface.bulkDelete('work_locations', null, {});
    await queryInterface.bulkDelete('work_schedules', null, {});
    await queryInterface.bulkDelete('holidays', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
