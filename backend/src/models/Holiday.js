const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Holiday = sequelize.define('Holiday', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Ex: Natal, Ano Novo, Carnaval',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('national', 'state', 'municipal', 'company'),
      allowNull: false,
      defaultValue: 'national',
    },
    is_recurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Se repete todo ano',
    },
    applies_to_all: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Se aplica a todos os funcionários',
    },
  }, {
    tableName: 'holidays',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['date'],
      },
    ],
  });

  return Holiday;
};
