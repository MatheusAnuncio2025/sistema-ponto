const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WorkLocation = sequelize.define('WorkLocation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Ex: Sede Principal, Filial SP, Matriz',
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      comment: 'Latitude para geolocalização',
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      comment: 'Longitude para geolocalização',
    },
    radius: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      comment: 'Raio permitido em metros',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'work_locations',
    timestamps: true,
    underscored: true,
  });

  WorkLocation.associate = (models) => {
    WorkLocation.hasMany(models.Employee, {
      foreignKey: 'work_location_id',
      as: 'employees',
    });

    WorkLocation.hasMany(models.TimeRecord, {
      foreignKey: 'work_location_id',
      as: 'timeRecords',
    });
  };

  return WorkLocation;
};
