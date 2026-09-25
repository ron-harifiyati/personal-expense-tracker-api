const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Categories classify records as income or expense (e.g. Food, Salary).
 */
const Category = sequelize.define(
    'Category',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: true },
        },
        type: {
            type: DataTypes.ENUM('income', 'expense'),
            allowNull: false,
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'tag',
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '#22c55e',
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        indexes: [{ unique: true, fields: ['userId', 'title', 'type'] }],
    }
);

module.exports = Category;
