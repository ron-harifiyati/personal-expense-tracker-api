const express = require('express');
const ctrl = require('../controllers/analyticsController');

const router = express.Router();

router.get('/summary', ctrl.summary);
router.get('/by-category', ctrl.byCategory);
router.get('/trend', ctrl.trend);

module.exports = router;
