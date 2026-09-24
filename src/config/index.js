require('dotenv').config({ quiet: true });

/**
 * Centralised application configuration.
 * All environment access happens here so the rest of the code base
 * never reaches into `process.env` directly.
 */
const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,

    // Database file. In-memory for the test suite so runs stay isolated.
    databaseStorage:
        process.env.NODE_ENV === 'test'
            ? ':memory:'
            : process.env.DATABASE_STORAGE || './database.sqlite',

    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-change-me-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },

    // Comma separated list of allowed origins for CORS. "*" allows any.
    corsOrigin: process.env.CORS_ORIGIN || '*',

    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
};

if (config.env === 'production' && config.jwt.secret === 'dev-secret-change-me-in-production') {
    // Fail loudly rather than silently shipping an insecure secret.
    throw new Error('JWT_SECRET must be set to a strong value in production.');
}

module.exports = config;
