const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Record = sequelize.define('Record', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('income', 'expense', 'transfer'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0.01
        }
    },
    notes: {
        type: DataTypes.STRING,
        allowNull: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    accountId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    toAccountId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: true
    }
})

module.exports = Record