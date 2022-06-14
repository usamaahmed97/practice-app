const Sequelize = require("sequelize");
const sequelize = require("../database/connection");

const User = sequelize.define("user", {

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

module.exports = User;