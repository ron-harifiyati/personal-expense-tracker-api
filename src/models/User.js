const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const config = require('../config');

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: true },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
            set(value) {
                // Normalise so "A@B.com" and "a@b.com" are the same account.
                this.setDataValue('email', String(value).trim().toLowerCase());
            },
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        currency: {
            // ISO 4217 code used purely for display on the client.
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'USD',
        },
    },
    {
        defaultScope: {
            // Never leak the password hash by default.
            attributes: { exclude: ['passwordHash'] },
        },
        scopes: {
            withPassword: { attributes: {} },
        },
    }
);

/** Hash and store a plaintext password. */
User.prototype.setPassword = async function setPassword(plain) {
    this.passwordHash = await bcrypt.hash(plain, config.bcryptRounds);
};

/** Compare a plaintext password against the stored hash. */
User.prototype.verifyPassword = function verifyPassword(plain) {
    return bcrypt.compare(plain, this.passwordHash);
};

module.exports = User;
