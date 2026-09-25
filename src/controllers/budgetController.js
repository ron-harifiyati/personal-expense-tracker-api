const { Op } = require('sequelize');
const { Budget, Category, Record } = require('../models');
const { round2, toNumber } = require('../utils/money');

/** Compute the start of the current window for a budget period. */
function periodStart(period, ref = new Date()) {
    if (period === 'weekly') {
        const d = new Date(ref);
        const day = (d.getDay() + 6) % 7; // Monday = 0
        d.setDate(d.getDate() - day);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    if (period === 'yearly') return new Date(ref.getFullYear(), 0, 1);
    return new Date(ref.getFullYear(), ref.getMonth(), 1); // monthly
}

/** Attach live "spent" figures to a budget row. */
async function withProgress(budget, userId) {
    const start = periodStart(budget.period);
    const spent = round2(
        (
            await Record.findAll({
                where: {
                    userId,
                    categoryId: budget.categoryId,
                    type: 'expense',
                    date: { [Op.gte]: start },
                },
            })
        ).reduce((sum, r) => sum + toNumber(r.amount), 0)
    );

    const limit = toNumber(budget.limit);
    const remaining = round2(limit - spent);
    return {
        ...budget.toJSON(),
        spent,
        remaining,
        percentUsed: limit > 0 ? round2((spent / limit) * 100) : 0,
        overBudget: spent > limit,
        periodStart: start,
    };
}

module.exports = {
    /** GET /budgets — every budget with live progress. */
    async list(req, res, next) {
        try {
            const budgets = await Budget.findAll({
                where: { userId: req.user.id },
                include: [{ model: Category, as: 'category' }],
            });
            const withStats = await Promise.all(budgets.map((b) => withProgress(b, req.user.id)));
            res.json(withStats);
        } catch (err) {
            next(err);
        }
    },

    /** POST /budgets */
    async create(req, res, next) {
        try {
            const { categoryId, limit, period } = req.body;

            const category = await Category.findOne({ where: { id: categoryId, userId: req.user.id } });
            if (!category) return res.status(404).json({ error: 'Category not found.' });
            if (category.type !== 'expense') {
                return res.status(400).json({ error: 'Budgets can only be set on expense categories.' });
            }

            const existing = await Budget.findOne({ where: { userId: req.user.id, categoryId } });
            if (existing) return res.status(409).json({ error: 'A budget already exists for this category.' });

            const budget = await Budget.create({
                categoryId,
                limit,
                period: period || 'monthly',
                userId: req.user.id,
            });
            const reloaded = await Budget.findByPk(budget.id, { include: [{ model: Category, as: 'category' }] });
            res.status(201).json(await withProgress(reloaded, req.user.id));
        } catch (err) {
            next(err);
        }
    },

    /** PATCH /budgets/:id */
    async update(req, res, next) {
        try {
            const budget = await Budget.findOne({ where: { id: req.params.id, userId: req.user.id } });
            if (!budget) return res.status(404).json({ error: 'Budget not found.' });

            const { limit, period } = req.body;
            if (limit !== undefined) budget.limit = limit;
            if (period !== undefined) budget.period = period;
            await budget.save();

            const reloaded = await Budget.findByPk(budget.id, { include: [{ model: Category, as: 'category' }] });
            res.json(await withProgress(reloaded, req.user.id));
        } catch (err) {
            next(err);
        }
    },

    /** DELETE /budgets/:id */
    async remove(req, res, next) {
        try {
            const budget = await Budget.findOne({ where: { id: req.params.id, userId: req.user.id } });
            if (!budget) return res.status(404).json({ error: 'Budget not found.' });
            await budget.destroy();
            res.json({ message: 'Budget deleted.' });
        } catch (err) {
            next(err);
        }
    },
};
