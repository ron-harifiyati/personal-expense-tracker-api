const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security headers.
app.use(helmet());

// CORS — allow the configured origin(s) or any when set to "*".
const origins = config.corsOrigin === '*' ? '*' : config.corsOrigin.split(',').map((s) => s.trim());
app.use(cors({ origin: origins }));

app.use(express.json());

if (config.env !== 'test') {
    app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
}

// Basic rate limiting to blunt brute-force/abuse.
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: config.env === 'test' ? 100000 : 300,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

app.get('/', (req, res) => {
    res.json({ name: 'Personal Expense Tracker API', version: '2.0.0', docs: '/api/health' });
});

app.use('/api', routes);
// Backwards-compatible unprefixed routes.
app.use('/', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
