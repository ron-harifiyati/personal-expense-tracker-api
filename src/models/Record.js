const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * A record is a single ledger entry: an expense, income, or transfer.
 *
 *  - expense:  money leaves `accountId` (categorised)
 *  - income:   money enters `toAccountId` (categorised)
 *  - transfer: money moves from `accountId` to `toAccountId` (no category)
 */
const Record = sequelize.define('Record', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM('income', 'expense', 'transfer'),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { isDecimal: true, min: 0.01 },
    },
    notes: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    accountId: {
        // Source account (expense / transfer origin).
        type: DataTypes.UUID,
        allowNull: true,
    },
    toAccountId: {
        // Destination account (income / transfer target).
        type: DataTypes.UUID,
        allowNull: true,
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
});

module.exports = Record;
