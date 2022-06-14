'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("user", {

      id:
      {
          type: Sequelize.INTEGER,
          primaryKey : true,
          allowNull: false,
          autoIncrement: true
      },
  
      firstName:
      {
          type: Sequelize.STRING,
          allowNull: false,
      },
  
      lastName:
      {
          type: Sequelize.STRING,
          allowNull: false,
      },
  
      email:
      {
          type: Sequelize.STRING,
          allowNull: false,
      },
  
      password:
      {
          type: Sequelize.STRING,
          allowNull: false,
      }
    });
  },

  async down (queryInterface, Sequelize) {
   
    await queryInterface.dropTable("user");

  }
};
