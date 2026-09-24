const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/budgetController');

const router = express.Router();

router.get('/', ctrl.list);
router.post(
    '/',
    [
        body('categoryId').notEmpty().withMessage('Category is required.'),
        body('limit').isFloat({ gt: 0 }).withMessage('Limit must be greater than 0.'),
        body('period').optional().isIn(['monthly', 'weekly', 'yearly']).withMessage('Invalid period.'),
    ],
    validate,
    ctrl.create
);
router.patch(
    '/:id',
    [
        body('limit').optional().isFloat({ gt: 0 }).withMessage('Limit must be greater than 0.'),
        body('period').optional().isIn(['monthly', 'weekly', 'yearly']).withMessage('Invalid period.'),
    ],
    validate,
    ctrl.update
);
router.delete('/:id', ctrl.remove);

module.exports = router;
