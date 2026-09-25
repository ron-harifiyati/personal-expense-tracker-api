const config = require('../config');

/** 404 handler for unmatched routes. */
function notFound(req, res, next) {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * Central error handler. Maps common Sequelize + tagged errors to clean
 * HTTP responses and hides stack traces outside development.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    let status = err.status || 500;
    let message = err.message || 'An unexpected server error occurred.';

    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeBadRequestError') {
        status = 400;
        message = err.errors ? err.errors.map((e) => e.message).join(', ') : message;
    } else if (err.name === 'SequelizeUniqueConstraintError') {
        status = 409;
        message = err.errors ? err.errors.map((e) => e.message).join(', ') : 'Resource already exists.';
    }

    if (status >= 500) {
        // Log server errors for debugging; never send internals to the client.
        // eslint-disable-next-line no-console
        console.error(err);
        if (config.env === 'production') message = 'An unexpected server error occurred.';
    }

    res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
