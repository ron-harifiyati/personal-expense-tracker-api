const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const ctrl = require('../controllers/authController');

const router = express.Router();

router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required.'),
        body('email').isEmail().withMessage('A valid email is required.'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
        body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code.'),
    ],
    validate,
    ctrl.register
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('A valid email is required.'),
        body('password').notEmpty().withMessage('Password is required.'),
    ],
    validate,
    ctrl.login
);

router.get('/me', authenticate, ctrl.me);
router.patch(
    '/me',
    authenticate,
    [
        body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
        body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
        body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code.'),
    ],
    validate,
    ctrl.updateMe
);

module.exports = router;
