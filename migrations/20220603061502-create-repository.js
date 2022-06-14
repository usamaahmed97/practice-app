'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("repository", {

      id:
      {
          type: Sequelize.INTEGER,
          primaryKey : true,
          allowNull: false,
          autoIncrement: true
          
      },
  
      repositoryName:
      {
          type: Sequelize.STRING,
          allowNull: false,
      },
  
      repositoryDescription:
      {
          type: Sequelize.STRING,
          allowNull: false,
      }
  
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("repository")
  }
};
