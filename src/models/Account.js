const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * An account is a place money lives: Cash, Bank, Mobile Money, etc.
 * The stored `amount` is the live balance, kept in sync by TransactionService.
 */
const Account = sequelize.define(
    'Account',
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
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
            validate: { isDecimal: true },
        },
        // A short identifier the UI maps to an icon/emoji.
        icon: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'wallet',
        },
        // Hex colour used by the UI for accents.
        color: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '#6366f1',
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        indexes: [{ unique: true, fields: ['userId', 'title'] }],
    }
);

module.exports = Account;
