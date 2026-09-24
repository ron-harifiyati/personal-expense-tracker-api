const jwt = require('jsonwebtoken');
const config = require('../config');
const { sequelize, User } = require('../models');
const { seedForUser } = require('../services/seed');

/** Issue a signed JWT for a user. */
function signToken(user) {
    return jwt.sign({ sub: user.id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

/** Shape a user for API responses (no password hash). */
function publicUser(user) {
    return { id: user.id, name: user.name, email: user.email, currency: user.currency };
}

module.exports = {
    /** POST /auth/register */
    async register(req, res, next) {
        try {
            const { name, email, password, currency } = req.body;

            const existing = await User.findOne({ where: { email: String(email).toLowerCase() } });
            if (existing) return res.status(409).json({ error: 'An account with that email already exists.' });

            const user = await sequelize.transaction(async (tx) => {
                const created = User.build({ name, email, currency: currency || 'USD' });
                await created.setPassword(password);
                await created.save({ transaction: tx });
                await seedForUser(created.id, tx);
                return created;
            });

            return res.status(201).json({ token: signToken(user), user: publicUser(user) });
        } catch (err) {
            return next(err);
        }
    },

    /** POST /auth/login */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await User.scope('withPassword').findOne({
                where: { email: String(email).toLowerCase() },
            });

            // Constant-ish response regardless of which half failed.
            if (!user || !(await user.verifyPassword(password))) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }

            return res.json({ token: signToken(user), user: publicUser(user) });
        } catch (err) {
            return next(err);
        }
    },

    /** GET /auth/me */
    async me(req, res) {
        return res.json({ user: publicUser(req.user) });
    },

    /** PATCH /auth/me */
    async updateMe(req, res, next) {
        try {
            const { name, currency, password } = req.body;
            if (name !== undefined) req.user.name = name;
            if (currency !== undefined) req.user.currency = currency;
            if (password) await req.user.setPassword(password);
            await req.user.save();
            return res.json({ user: publicUser(req.user) });
        } catch (err) {
            return next(err);
        }
    },
};
