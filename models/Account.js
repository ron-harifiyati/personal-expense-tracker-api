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

Account.prototype.transfer = async function (amount, toAccount) {
    if (this.amount < amount) {
        throw new Error(`Ensufficient funds in ${this.title}, Required ${amount}, Available ${this.amount}`);
    };

    this.amount = (parseFloat(this.amount) - amount).toFixed(2);
    toAccount.amount = (parseFloat(toAccount.amount) - amount).toFixed(2);

    await Promise.all([this.save(), toAccount.save()])
};

Account.prototype.spend = async function (amount) {
    if (this.amount < amount) {
        throw new Error(`Insufficient funds in ${this.title} for spending ${amount}.`)
    }

    this.amount = (parseFloat(this.amount) - amount).toFixed(2)
    await this.save()
};

Account.prototype.receive = async function (amount) {
    this.amount = (parseFloat(this.amount) + amount).toFixed(2)
    await this.save()
}

module.exports = Account;