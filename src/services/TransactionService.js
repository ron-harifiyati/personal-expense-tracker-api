const { sequelize, Account, Category, Record } = require('../models');
const { toNumber, round2, parsePositiveAmount } = require('../utils/money');

/** Build a tagged HTTP error. */
function httpError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

/** Load an account that must belong to the user, or throw 400/404. */
async function requireAccount(id, userId, label, tx) {
    if (!id) throw httpError(400, `${label} is required.`);
    const account = await Account.findOne({ where: { id, userId }, transaction: tx });
    if (!account) throw httpError(404, `${label} not found.`);
    return account;
}

/** Load a category that must belong to the user, or throw 400/404. */
async function requireCategory(id, userId, tx) {
    if (!id) throw httpError(400, 'Category is required.');
    const category = await Category.findOne({ where: { id, userId }, transaction: tx });
    if (!category) throw httpError(404, 'Category not found.');
    return category;
}

/** Apply the balance change of a record to the relevant account(s). */
async function applyEffect(record, tx) {
    const amount = toNumber(record.amount);

    if (record.type === 'expense') {
        const acc = await Account.findByPk(record.accountId, { transaction: tx });
        acc.amount = round2(toNumber(acc.amount) - amount);
        await acc.save({ transaction: tx });
    } else if (record.type === 'income') {
        const acc = await Account.findByPk(record.toAccountId, { transaction: tx });
        acc.amount = round2(toNumber(acc.amount) + amount);
        await acc.save({ transaction: tx });
    } else if (record.type === 'transfer') {
        const from = await Account.findByPk(record.accountId, { transaction: tx });
        const to = await Account.findByPk(record.toAccountId, { transaction: tx });
        from.amount = round2(toNumber(from.amount) - amount);
        to.amount = round2(toNumber(to.amount) + amount);
        await Promise.all([from.save({ transaction: tx }), to.save({ transaction: tx })]);
    }
}

/** Reverse the balance change a record previously made. */
async function reverseEffect(record, tx) {
    const amount = toNumber(record.amount);

    if (record.type === 'expense' && record.accountId) {
        const acc = await Account.findByPk(record.accountId, { transaction: tx });
        if (acc) {
            acc.amount = round2(toNumber(acc.amount) + amount);
            await acc.save({ transaction: tx });
        }
    } else if (record.type === 'income' && record.toAccountId) {
        const acc = await Account.findByPk(record.toAccountId, { transaction: tx });
        if (acc) {
            acc.amount = round2(toNumber(acc.amount) - amount);
            await acc.save({ transaction: tx });
        }
    } else if (record.type === 'transfer') {
        const from = record.accountId && (await Account.findByPk(record.accountId, { transaction: tx }));
        const to = record.toAccountId && (await Account.findByPk(record.toAccountId, { transaction: tx }));
        if (from) {
            from.amount = round2(toNumber(from.amount) + amount);
            await from.save({ transaction: tx });
        }
        if (to) {
            to.amount = round2(toNumber(to.amount) - amount);
            await to.save({ transaction: tx });
        }
    }
}

/**
 * Resolve and validate the accounts/category for a payload, returning the
 * normalised field set to persist on a record.
 */
async function resolveFields(userId, payload, tx) {
    const { type, fromAccountId, toAccountId, categoryId } = payload;
    const amount = parsePositiveAmount(payload.amount ?? payload.amountString);
    const notes = payload.notes ?? null;
    const date = payload.date ? new Date(payload.date) : new Date();

    switch ((type || '').toLowerCase()) {
        case 'expense': {
            const account = await requireAccount(fromAccountId, userId, 'Source account', tx);
            const category = await requireCategory(categoryId, userId, tx);
            if (category.type !== 'expense') throw httpError(400, 'Category must be an expense category.');
            return { type: 'expense', amount, notes, date, accountId: account.id, toAccountId: null, categoryId: category.id };
        }
        case 'income': {
            const account = await requireAccount(toAccountId, userId, 'Destination account', tx);
            const category = await requireCategory(categoryId, userId, tx);
            if (category.type !== 'income') throw httpError(400, 'Category must be an income category.');
            return { type: 'income', amount, notes, date, accountId: null, toAccountId: account.id, categoryId: category.id };
        }
        case 'transfer': {
            const from = await requireAccount(fromAccountId, userId, 'Source account', tx);
            const to = await requireAccount(toAccountId, userId, 'Destination account', tx);
            if (from.id === to.id) throw httpError(400, 'Cannot transfer to the same account.');
            return { type: 'transfer', amount, notes, date, accountId: from.id, toAccountId: to.id, categoryId: null };
        }
        default:
            throw httpError(400, 'Invalid transaction type. Use income, expense, or transfer.');
    }
}

const TransactionService = {
    /** Create a record and update balances atomically. */
    async create(userId, payload) {
        return sequelize.transaction(async (tx) => {
            const fields = await resolveFields(userId, payload, tx);
            const record = await Record.create({ ...fields, userId }, { transaction: tx });
            await applyEffect(record, tx);
            return record;
        });
    },

    /** Replace a record's details, reconciling balances atomically. */
    async update(userId, id, payload) {
        return sequelize.transaction(async (tx) => {
            const existing = await Record.findOne({ where: { id, userId }, transaction: tx });
            if (!existing) throw httpError(404, 'Record not found.');

            await reverseEffect(existing, tx);
            const fields = await resolveFields(userId, payload, tx);
            await existing.update(fields, { transaction: tx });
            await applyEffect(existing, tx);
            return existing;
        });
    },

    /** Delete a record and revert its balance effect atomically. */
    async remove(userId, id) {
        return sequelize.transaction(async (tx) => {
            const record = await Record.findOne({ where: { id, userId }, transaction: tx });
            if (!record) throw httpError(404, 'Record not found.');
            await reverseEffect(record, tx);
            await record.destroy({ transaction: tx });
        });
    },

    /**
     * Revert the balance effects of many records (used when cascading a
     * category/account delete) so surviving accounts stay accurate.
     */
    async reverseMany(records, tx) {
        for (const record of records) {
            // eslint-disable-next-line no-await-in-loop
            await reverseEffect(record, tx);
        }
    },
};

module.exports = TransactionService;
