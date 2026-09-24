const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/accountController');

const router = express.Router();

const writeRules = [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
    body('amount').optional().isFloat().withMessage('Amount must be a number.'),
];

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post(
    '/',
    [body('title').trim().notEmpty().withMessage('Title is required.'), ...writeRules],
    validate,
    ctrl.create
);
router.patch('/:id', writeRules, validate, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
