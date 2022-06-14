const Sequelize = require("sequelize");
const sequelize = require("../database/connection");
const User = require("./User");


const Repository = sequelize.define("repository", {

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
    },

    userId:{
        type: Sequelize.INTEGER,
        reference: {
          model: 'User', 
          key: 'id'
        }
    }

    
});

User.hasMany(Repository);
Repository.belongsTo(User);

module.exports = Repository;