const { sequelize, Category, Record, Budget } = require('../models');
const TransactionService = require('../services/TransactionService');

module.exports = {
    /** GET /categories?type=income|expense */
    async list(req, res, next) {
        try {
            const where = { userId: req.user.id };
            if (req.query.type) where.type = req.query.type;
            const categories = await Category.findAll({ where, order: [['title', 'ASC']] });
            res.json(categories);
        } catch (err) {
            next(err);
        }
    },

    /** GET /categories/:id */
    async get(req, res, next) {
        try {
            const category = await Category.findOne({ where: { id: req.params.id, userId: req.user.id } });
            if (!category) return res.status(404).json({ error: 'Category not found.' });
            res.json(category);
        } catch (err) {
            next(err);
        }
    },

    /** POST /categories */
    async create(req, res, next) {
        try {
            const { title, type, icon, color } = req.body;
            const category = await Category.create({ title, type, icon, color, userId: req.user.id });
            res.status(201).json(category);
        } catch (err) {
            next(err);
        }
    },

    /** PATCH /categories/:id */
    async update(req, res, next) {
        try {
            const category = await Category.findOne({ where: { id: req.params.id, userId: req.user.id } });
            if (!category) return res.status(404).json({ error: 'Category not found.' });

            const { title, type, icon, color } = req.body;
            if (title !== undefined) category.title = title;
            if (type !== undefined) category.type = type;
            if (icon !== undefined) category.icon = icon;
            if (color !== undefined) category.color = color;
            await category.save();
            res.json(category);
        } catch (err) {
            next(err);
        }
    },

    /** DELETE /categories/:id — removes the category, its records and budgets. */
    async remove(req, res, next) {
        try {
            const category = await Category.findOne({ where: { id: req.params.id, userId: req.user.id } });
            if (!category) return res.status(404).json({ error: 'Category not found.' });

            await sequelize.transaction(async (tx) => {
                const related = await Record.findAll({
                    where: { userId: req.user.id, categoryId: category.id },
                    transaction: tx,
                });
                // Revert balance effects before removing the records.
                await TransactionService.reverseMany(related, tx);
                await Record.destroy({ where: { userId: req.user.id, categoryId: category.id }, transaction: tx });
                await Budget.destroy({ where: { userId: req.user.id, categoryId: category.id }, transaction: tx });
                await category.destroy({ transaction: tx });
            });

            res.json({ message: 'Category and related records deleted.' });
        } catch (err) {
            next(err);
        }
    },
};
