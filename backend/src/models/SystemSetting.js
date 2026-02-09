const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SystemSetting = sequelize.define('SystemSetting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    allow_admin_out_of_schedule: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    allow_hr_out_of_schedule: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    allow_supervisor_out_of_schedule: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    allow_coordinator_out_of_schedule: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    allow_manager_out_of_schedule: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'system_settings',
    timestamps: true,
    underscored: true,
  });

  return SystemSetting;
};
