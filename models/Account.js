const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Account = sequelize.define('Account', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            isDecimal: true,
            min: 0.00
        }
    },
    imageTitle: {
        type: DataTypes.STRING,
        unique: false
    }
});

Account.prototype.transfer = async function (amount, receivingAccount) {
    if (this.balance < amount) {
        throw new Error(`Ensufficient funds in ${this.title}, Required ${amount}, Available ${this.balance}`);
    };

    this.balance = (parseFloat(this.balance) - amount).toFixed(2);
    receivingAccount.balance = (parseFloat(receivingAccount.balance) - acount).toFixed(2);

    await Promise.all([this.save(), receivingAccount.save()])
};

Account.prototype.spend = async function (amount) {
    if (this.balance < amount) {
        throw new Error(`Insufficient funds in ${this.title} for spending ${amount}.`)
    }

    this.balance = (parseInt(this.balance) - amount).toFixed(2)
    await this.save()
};

Account.prototype.receive = async function

module.exports = Account;