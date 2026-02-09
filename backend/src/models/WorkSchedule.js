const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WorkSchedule = sequelize.define('WorkSchedule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Ex: Escala 5x2, Escala 6x1, Sábados Alternados',
    },
    type: {
      type: DataTypes.ENUM('5x2', '6x1', 'custom'),
      allowNull: false,
    },
    work_days: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false,
      comment: 'Array de dias da semana: 0=Domingo, 1=Segunda, ... 6=Sábado',
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'Horário de entrada',
    },
    lunch_start: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Horário de saída para almoço',
    },
    lunch_end: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Horário de retorno do almoço',
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'Horário de saída',
    },
    tolerance_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      comment: 'Tolerância de atraso em minutos',
    },
    weekly_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: 'Horas semanais previstas',
    },
    has_alternating_saturdays: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Se true, trabalha sábados alternados',
    },
  }, {
    tableName: 'work_schedules',
    timestamps: true,
    underscored: true,
  });

  WorkSchedule.associate = (models) => {
    WorkSchedule.hasMany(models.Employee, {
      foreignKey: 'work_schedule_id',
      as: 'employees',
    });
  };

  return WorkSchedule;
};
