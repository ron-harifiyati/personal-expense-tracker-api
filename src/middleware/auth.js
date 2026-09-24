const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');

/**
 * Authentication guard. Verifies the Bearer token, loads the user, and
 * attaches it to `req.user`. Every protected route sits behind this.
 */
module.exports = async function authenticate(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const [scheme, token] = header.split(' ');

        if (scheme !== 'Bearer' || !token) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        let payload;
        try {
            payload = jwt.verify(token, config.jwt.secret);
        } catch (err) {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }

        const user = await User.findByPk(payload.sub);
        if (!user) {
            return res.status(401).json({ error: 'Account no longer exists.' });
        }

        req.user = user;
        return next();
    } catch (err) {
        return next(err);
    }
};
