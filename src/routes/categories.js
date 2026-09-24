const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/categoryController');

const router = express.Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post(
    '/',
    [
        body('title').trim().notEmpty().withMessage('Title is required.'),
        body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense.'),
    ],
    validate,
    ctrl.create
);
router.patch(
    '/:id',
    [
        body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
        body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense.'),
    ],
    validate,
    ctrl.update
);
router.delete('/:id', ctrl.remove);

module.exports = router;
