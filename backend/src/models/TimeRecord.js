const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TimeRecord = sequelize.define('TimeRecord', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    record_type: {
      type: DataTypes.ENUM('entry', 'lunch_start', 'lunch_end', 'exit'),
      allowNull: false,
      comment: 'Tipo de marcação',
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
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
    is_within_radius: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Se estava dentro do raio permitido',
    },
    distance_meters: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Distância em metros do local de trabalho',
    },
    is_manual_adjustment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Se foi ajustado manualmente',
    },
    adjustment_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo do ajuste manual',
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      comment: 'Quem aprovou o ajuste',
    },
    confirmation_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Código único de confirmação',
    },
    device_info: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Informações do dispositivo (user agent, IP, etc)',
    },
  }, {
    tableName: 'time_records',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['employee_id', 'timestamp'],
      },
      {
        fields: ['confirmation_code'],
        unique: true,
      },
    ],
  });

  TimeRecord.associate = (models) => {
    TimeRecord.belongsTo(models.Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    });

    TimeRecord.belongsTo(models.WorkLocation, {
      foreignKey: 'work_location_id',
      as: 'workLocation',
    });

    TimeRecord.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approver',
    });
  };

  return TimeRecord;
};
