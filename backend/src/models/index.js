const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Inicializar Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    timezone: dbConfig.timezone,
    define: dbConfig.define,
    pool: dbConfig.pool || {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Objeto para armazenar os modelos
const db = {};

// Importar todos os modelos
db.User = require('./User')(sequelize);
db.Employee = require('./Employee')(sequelize);
db.WorkSchedule = require('./WorkSchedule')(sequelize);
db.WorkLocation = require('./WorkLocation')(sequelize);
db.TimeRecord = require('./TimeRecord')(sequelize);
db.Holiday = require('./Holiday')(sequelize);

// Configurar associações (relacionamentos)
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
