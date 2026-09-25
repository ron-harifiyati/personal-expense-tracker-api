const { sequelize, Account, Record } = require('../models');
const { Op } = require('sequelize');
const { round2 } = require('../utils/money');
const TransactionService = require('../services/TransactionService');

module.exports = {
    /** GET /accounts */
    async list(req, res, next) {
        try {
            const accounts = await Account.findAll({
                where: { userId: req.user.id },
                order: [['createdAt', 'ASC']],
            });
            res.json(accounts);
        } catch (err) {
            next(err);
        }
    },

    /** GET /accounts/:id */
    async get(req, res, next) {
        try {
            const account = await Account.findOne({ where: { id: req.params.id, userId: req.user.id } });
            if (!account) return res.status(404).json({ error: 'Account not found.' });
            res.json(account);
        } catch (err) {
            next(err);
        }
    },

    /** POST /accounts */
    async create(req, res, next) {
        try {
            const { title, amount, icon, color } = req.body;
            const account = await Account.create({
                title,
                amount: amount !== undefined ? round2(amount) : 0,
                icon,
                color,
                userId: req.user.id,
            });
            res.status(201).json(account);
        } catch (err) {
            next(err);
        }
    },

    /** PATCH /accounts/:id */
    async update(req, res, next) {
        try {
            const account = await Account.findOne({ where: { id: req.params.id, userId: req.user.id } });
            if (!account) return res.status(404).json({ error: 'Account not found.' });

            const { title, amount, icon, color } = req.body;
            if (title !== undefined) account.title = title;
            if (amount !== undefined) account.amount = round2(amount);
            if (icon !== undefined) account.icon = icon;
            if (color !== undefined) account.color = color;
            await account.save();
            res.json(account);
        } catch (err) {
            next(err);
        }
    },

    /** DELETE /accounts/:id — removes the account and every record touching it. */
    async remove(req, res, next) {
        try {
            const account = await Account.findOne({ where: { id: req.params.id, userId: req.user.id } });
            if (!account) return res.status(404).json({ error: 'Account not found.' });

            await sequelize.transaction(async (tx) => {
                const related = await Record.findAll({
                    where: {
                        userId: req.user.id,
                        [Op.or]: [{ accountId: account.id }, { toAccountId: account.id }],
                    },
                    transaction: tx,
                });
                // Revert balance effects so the *other* accounts (e.g. the far
                // side of a transfer) stay accurate after the cascade.
                await TransactionService.reverseMany(related, tx);
                await Record.destroy({
                    where: {
                        userId: req.user.id,
                        [Op.or]: [{ accountId: account.id }, { toAccountId: account.id }],
                    },
                    transaction: tx,
                });
                await account.destroy({ transaction: tx });
            });

            res.json({ message: 'Account and related records deleted.' });
        } catch (err) {
            next(err);
        }
    },
};
