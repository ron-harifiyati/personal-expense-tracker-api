const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/recordController');

const router = express.Router();

// Accept either `amount` (preferred) or the legacy `amountString`.
const writeRules = [
    body('type').isIn(['income', 'expense', 'transfer']).withMessage('Type must be income, expense, or transfer.'),
    body().custom((value) => {
        const amt = value.amount ?? value.amountString;
        if (amt === undefined || amt === null || amt === '') throw new Error('Amount is required.');
        if (Number.isNaN(parseFloat(amt)) || parseFloat(amt) <= 0) throw new Error('Amount must be greater than 0.');
        return true;
    }),
];

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', writeRules, validate, ctrl.create);
router.patch('/:id', writeRules, validate, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
