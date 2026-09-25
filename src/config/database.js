const { Sequelize } = require('sequelize');
const config = require('./index');

/**
 * Single shared Sequelize instance backed by SQLite.
 */
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.databaseStorage,
    logging: config.env === 'development' ? false : false,
});

module.exports = sequelize;
