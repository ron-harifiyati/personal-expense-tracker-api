const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * A monthly spending limit for a category. The "spent" figure is computed
 * on demand from records rather than stored, so it is always accurate.
 */
const Budget = sequelize.define(
    'Budget',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        limit: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            validate: { isDecimal: true, min: 0.01 },
        },
        // Recurrence window the limit applies to.
        period: {
            type: DataTypes.ENUM('monthly', 'weekly', 'yearly'),
            allowNull: false,
            defaultValue: 'monthly',
        },
        categoryId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        // One budget per category per user.
        indexes: [{ unique: true, fields: ['userId', 'categoryId'] }],
    }
);

module.exports = Budget;
