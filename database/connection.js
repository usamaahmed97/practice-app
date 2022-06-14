const Sequelize = require("sequelize");

const sequelize = new Sequelize('crud-app', 'postgres', 'root', {
    host: 'localhost',
    dialect:'postgres',
    define: {timestamps: false,  freezeTableName: true}
  });

  module.exports = sequelize;
  global.sequelize = sequelize;