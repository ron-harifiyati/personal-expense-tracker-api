const express = require('express');
const authenticate = require('../middleware/auth');

const authRoutes = require('./auth');
const accountRoutes = require('./accounts');
const categoryRoutes = require('./categories');
const recordRoutes = require('./records');
const budgetRoutes = require('./budgets');
const analyticsRoutes = require('./analytics');

const router = express.Router();

// Public
router.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
router.use('/auth', authRoutes);

// Everything below requires a valid token.
router.use('/accounts', authenticate, accountRoutes);
router.use('/categories', authenticate, categoryRoutes);
router.use('/records', authenticate, recordRoutes);
router.use('/budgets', authenticate, budgetRoutes);
router.use('/analytics', authenticate, analyticsRoutes);

module.exports = router;
