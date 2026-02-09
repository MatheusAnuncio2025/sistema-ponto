const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Employee = sequelize.define('Employee', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    employee_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hire_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    work_schedule_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'work_schedules',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    work_location_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'work_locations',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    lunch_start: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Horário de saída para almoço (override por funcionário)',
    },
    lunch_end: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Horário de retorno do almoço (override por funcionário)',
    },
    punch_override_until: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Permite bater ponto fora da janela até esta data/hora',
    },
    punch_override_by: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Usuário que liberou o ponto fora da janela',
    },
    punch_override_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo da liberação para ponto fora da janela',
    },
    is_hybrid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Se true, permite trabalho remoto',
    },
    hours_balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Banco de horas (positivo ou negativo)',
    },
  }, {
    tableName: 'employees',
    timestamps: true,
    underscored: true,
  });

  Employee.associate = (models) => {
    Employee.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    Employee.belongsTo(models.WorkSchedule, {
      foreignKey: 'work_schedule_id',
      as: 'workSchedule',
    });

    Employee.belongsTo(models.WorkLocation, {
      foreignKey: 'work_location_id',
      as: 'workLocation',
    });

    Employee.hasMany(models.TimeRecord, {
      foreignKey: 'employee_id',
      as: 'timeRecords',
    });
  };

  return Employee;
};
