const { Account, Category } = require('../models');

/**
 * Sensible starter data created for every new user so the app is useful
 * immediately instead of showing an empty shell.
 */
const DEFAULT_CATEGORIES = [
    { title: 'Salary', type: 'income', icon: 'briefcase', color: '#22c55e' },
    { title: 'Freelance', type: 'income', icon: 'laptop', color: '#10b981' },
    { title: 'Gifts', type: 'income', icon: 'gift', color: '#14b8a6' },
    { title: 'Food & Drink', type: 'expense', icon: 'utensils', color: '#f97316' },
    { title: 'Groceries', type: 'expense', icon: 'cart', color: '#f59e0b' },
    { title: 'Transport', type: 'expense', icon: 'car', color: '#3b82f6' },
    { title: 'Housing', type: 'expense', icon: 'home', color: '#8b5cf6' },
    { title: 'Utilities', type: 'expense', icon: 'bolt', color: '#eab308' },
    { title: 'Entertainment', type: 'expense', icon: 'film', color: '#ec4899' },
    { title: 'Health', type: 'expense', icon: 'heart', color: '#ef4444' },
    { title: 'Shopping', type: 'expense', icon: 'bag', color: '#a855f7' },
];

const DEFAULT_ACCOUNTS = [
    { title: 'Cash', amount: 0, icon: 'cash', color: '#22c55e' },
    { title: 'Bank', amount: 0, icon: 'bank', color: '#6366f1' },
];

async function seedForUser(userId, transaction) {
    await Category.bulkCreate(
        DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })),
        { transaction }
    );
    await Account.bulkCreate(
        DEFAULT_ACCOUNTS.map((a) => ({ ...a, userId })),
        { transaction }
    );
}

module.exports = { seedForUser, DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS };
