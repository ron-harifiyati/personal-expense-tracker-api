const { Sequelize } = require('sequelize');

const sequelise = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

module.exports = sequelise;