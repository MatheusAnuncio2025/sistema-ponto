const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReprocessLog = sequelize.define(
    'ReprocessLog',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      start_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'reprocess_logs',
      timestamps: true,
      underscored: true,
    },
  );

  ReprocessLog.associate = (models) => {
    ReprocessLog.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return ReprocessLog;
};
