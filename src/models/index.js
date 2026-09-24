const sequelize = require('../config/database');
const User = require('./User');
const Account = require('./Account');
const Category = require('./Category');
const Record = require('./Record');
const Budget = require('./Budget');

/* ------------------------------------------------------------------ *
 * Associations
 * ------------------------------------------------------------------ */

// A user owns everything. Deleting a user cascades to all their data.
User.hasMany(Account, { foreignKey: 'userId', onDelete: 'CASCADE' });
Account.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Category, { foreignKey: 'userId', onDelete: 'CASCADE' });
Category.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Record, { foreignKey: 'userId', onDelete: 'CASCADE' });
Record.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Budget, { foreignKey: 'userId', onDelete: 'CASCADE' });
Budget.belongsTo(User, { foreignKey: 'userId' });

// Records reference a source account, a destination account, and a category.
Account.hasMany(Record, { as: 'outgoing', foreignKey: 'accountId' });
Record.belongsTo(Account, { as: 'account', foreignKey: 'accountId' });

Account.hasMany(Record, { as: 'incoming', foreignKey: 'toAccountId' });
Record.belongsTo(Account, { as: 'toAccount', foreignKey: 'toAccountId' });

Category.hasMany(Record, { foreignKey: 'categoryId' });
Record.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });

Category.hasMany(Budget, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
Budget.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });

module.exports = { sequelize, User, Account, Category, Record, Budget };
