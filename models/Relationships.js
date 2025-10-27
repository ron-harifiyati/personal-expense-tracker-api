const Account = require('./Account');
const Category = require('./Category');
const Record = require('./Record');

Account.hasManny(Record, {
    as: 'sourceRecords',
    foreignKey: 'accountId'
});

Account.hasMany(Record, {
    as: 'destination',
    foreignKey: 'receivingAccountId'
});

Record.belongsTo(Account, {
    as: 'account',
    foreignKey: 'accountId'
});

Record.belongsTo(Account, {
    as: 'toAccount',
    foreignKey: 'receivingAccountId'
});

Category.hasMany(Record, {
    as: 'records',
    foreignKey: 'categoryId'
});

Record.belongsTo(Category, {
    as: 'category',
    foreignKey: 'categoryId'
});

module.exports = { Account, Category, Record }