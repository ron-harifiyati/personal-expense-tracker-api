const { validationResult } = require('express-validator');

/**
 * Collects express-validator results and returns a 400 with the first
 * message per field when validation fails.
 */
module.exports = function validate(req, res, next) {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return res.status(400).json({ error: details[0].message, details });
};
