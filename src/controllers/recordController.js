const { Op } = require('sequelize');
const { Record, Account, Category } = require('../models');
const TransactionService = require('../services/TransactionService');

// Associations eager-loaded on every record response.
const includeRefs = [
    { model: Account, as: 'account', attributes: ['id', 'title', 'icon', 'color'] },
    { model: Account, as: 'toAccount', attributes: ['id', 'title', 'icon', 'color'] },
    { model: Category, as: 'category', attributes: ['id', 'title', 'type', 'icon', 'color'] },
];

module.exports = {
    /**
     * GET /records
     * Query params: type, accountId, categoryId, from, to, search,
     * page (1-based), limit, sort (field:dir).
     */
    async list(req, res, next) {
        try {
            const { type, accountId, categoryId, from, to, search } = req.query;
            const where = { userId: req.user.id };

            if (type) where.type = type;
            if (categoryId) where.categoryId = categoryId;
            if (accountId) {
                where[Op.or] = [{ accountId }, { toAccountId: accountId }];
            }
            if (from || to) {
                where.date = {};
                if (from) where.date[Op.gte] = new Date(from);
                if (to) where.date[Op.lte] = new Date(to);
            }
            if (search) {
                where.notes = { [Op.like]: `%${search}%` };
            }

            const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
            const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
            const offset = (page - 1) * limit;

            // Whitelist sortable columns to avoid SQL injection via order.
            const sortable = ['date', 'amount', 'createdAt', 'type'];
            let [sortField, sortDir] = (req.query.sort || 'date:desc').split(':');
            if (!sortable.includes(sortField)) sortField = 'date';
            sortDir = sortDir && sortDir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

            const { rows, count } = await Record.findAndCountAll({
                where,
                include: includeRefs,
                order: [[sortField, sortDir], ['createdAt', 'DESC']],
                limit,
                offset,
            });

            res.json({
                data: rows,
                pagination: {
                    page,
                    limit,
                    total: count,
                    totalPages: Math.ceil(count / limit),
                },
            });
        } catch (err) {
            next(err);
        }
    },

    /** GET /records/:id */
    async get(req, res, next) {
        try {
            const record = await Record.findOne({
                where: { id: req.params.id, userId: req.user.id },
                include: includeRefs,
            });
            if (!record) return res.status(404).json({ error: 'Record not found.' });
            res.json(record);
        } catch (err) {
            next(err);
        }
    },

    /** POST /records */
    async create(req, res, next) {
        try {
            const record = await TransactionService.create(req.user.id, req.body);
            const full = await Record.findByPk(record.id, { include: includeRefs });
            res.status(201).json(full);
        } catch (err) {
            next(err);
        }
    },

    /** PATCH /records/:id */
    async update(req, res, next) {
        try {
            const record = await TransactionService.update(req.user.id, req.params.id, req.body);
            const full = await Record.findByPk(record.id, { include: includeRefs });
            res.json(full);
        } catch (err) {
            next(err);
        }
    },

    /** DELETE /records/:id */
    async remove(req, res, next) {
        try {
            await TransactionService.remove(req.user.id, req.params.id);
            res.json({ message: 'Record deleted and balances updated.' });
        } catch (err) {
            next(err);
        }
    },
};
