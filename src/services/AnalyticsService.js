const { Op } = require('sequelize');
const { Account, Category, Record } = require('../models');
const { round2, toNumber } = require('../utils/money');

/** Start/end of the month containing `ref`. */
function monthRange(ref = new Date()) {
    const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
    return { start, end };
}

const AnalyticsService = {
    /**
     * High level dashboard summary: net worth plus income/expense/savings
     * totals for the requested window (defaults to the current month).
     */
    async summary(userId, { from, to } = {}) {
        const accounts = await Account.findAll({ where: { userId } });
        const netWorth = round2(accounts.reduce((sum, a) => sum + toNumber(a.amount), 0));

        const range = from || to
            ? { start: from ? new Date(from) : new Date(0), end: to ? new Date(to) : new Date() }
            : monthRange();

        const records = await Record.findAll({
            where: { userId, date: { [Op.gte]: range.start, [Op.lt]: range.end } },
        });

        let income = 0;
        let expense = 0;
        for (const r of records) {
            if (r.type === 'income') income += toNumber(r.amount);
            else if (r.type === 'expense') expense += toNumber(r.amount);
        }
        income = round2(income);
        expense = round2(expense);

        return {
            netWorth,
            accountsCount: accounts.length,
            period: { from: range.start, to: range.end },
            income,
            expense,
            net: round2(income - expense),
            savingsRate: income > 0 ? round2(((income - expense) / income) * 100) : 0,
        };
    },

    /** Spending (or income) grouped by category for a window. */
    async byCategory(userId, { type = 'expense', from, to } = {}) {
        const range = from || to
            ? { start: from ? new Date(from) : new Date(0), end: to ? new Date(to) : new Date() }
            : monthRange();

        const records = await Record.findAll({
            where: { userId, type, date: { [Op.gte]: range.start, [Op.lt]: range.end } },
            include: [{ model: Category, as: 'category' }],
        });

        const totals = new Map();
        for (const r of records) {
            const cat = r.category;
            const key = cat ? cat.id : 'uncategorised';
            const existing = totals.get(key) || {
                categoryId: cat ? cat.id : null,
                title: cat ? cat.title : 'Uncategorised',
                icon: cat ? cat.icon : 'tag',
                color: cat ? cat.color : '#94a3b8',
                total: 0,
                count: 0,
            };
            existing.total += toNumber(r.amount);
            existing.count += 1;
            totals.set(key, existing);
        }

        const grandTotal = [...totals.values()].reduce((s, t) => s + t.total, 0);
        return [...totals.values()]
            .map((t) => ({
                ...t,
                total: round2(t.total),
                percentage: grandTotal > 0 ? round2((t.total / grandTotal) * 100) : 0,
            }))
            .sort((a, b) => b.total - a.total);
    },

    /** Monthly income/expense trend over the last `months` months. */
    async trend(userId, { months = 6 } = {}) {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

        const records = await Record.findAll({
            where: {
                userId,
                type: { [Op.in]: ['income', 'expense'] },
                date: { [Op.gte]: start },
            },
        });

        const buckets = [];
        for (let i = 0; i < months; i += 1) {
            const d = new Date(now.getFullYear(), now.getMonth() - (months - 1) + i, 1);
            buckets.push({
                month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
                income: 0,
                expense: 0,
            });
        }

        const indexOf = new Map(buckets.map((b, i) => [b.month, i]));
        for (const r of records) {
            const d = new Date(r.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const idx = indexOf.get(key);
            if (idx === undefined) continue;
            if (r.type === 'income') buckets[idx].income += toNumber(r.amount);
            else buckets[idx].expense += toNumber(r.amount);
        }

        return buckets.map((b) => ({
            ...b,
            income: round2(b.income),
            expense: round2(b.expense),
            net: round2(b.income - b.expense),
        }));
    },

    monthRange,
};

module.exports = AnalyticsService;
