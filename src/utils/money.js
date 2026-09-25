/**
 * Money helpers.
 *
 * Balances are stored as DECIMAL(12,2) but Sequelize returns them as strings.
 * All arithmetic funnels through these helpers so rounding is consistent and
 * we never accumulate floating point drift in stored balances.
 */

/** Convert any stored/string amount to a Number, defaulting to 0. */
function toNumber(value) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
}

/** Round to 2 decimal places, returning a Number. */
function round2(value) {
    return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
}

/**
 * Parse a user supplied amount, enforcing that it is a positive number.
 * Throws a tagged error the route layer maps to HTTP 400.
 */
function parsePositiveAmount(input) {
    const amount = parseFloat(input);
    if (!Number.isFinite(amount) || amount <= 0) {
        const err = new Error('Amount must be a number greater than 0.');
        err.status = 400;
        throw err;
    }
    return round2(amount);
}

module.exports = { toNumber, round2, parsePositiveAmount };
