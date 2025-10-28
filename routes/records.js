const express = require('express');
const router = express.Router();
const TransactionService = require('../services/TransactionService');
const Account = require('../models/Account');
const Category = require('../models/Category');
const Record = require('../models/Record');

router.get('/', async (req, res) => {
    const records = await Record.findAll();
    res.json(records)
});

router.post('/', async (req, res) => {
    const { type, amountString, fromAccountId, toAccountId, categoryId, notes } = req.body;

    try {
        let result;

        const category = await Category.findByPk(categoryId);
        const fromAccount = await Account.findByPk(fromAccountId);
        const toAccount = await Account.findByPk(toAccountId)

        if (!amountString) return res.status(400).json({ success: false, message: 'Amount is required.' });

        switch (type.toLowerCase()) {
            case 'expense':
                if (!fromAccount || !category) return res.status(400).json({ success: false, message: 'Source Account and Category required for Expense.' });
                result = await TransactionService.createExpense({ fromAccount, category, amountString, notes });
                break;

            case 'income':
                if (!toAccount || !category) return res.status(400).json({ success: false, message: 'Destination Account and Category required for Income.' });
                result = await TransactionService.createIncome({ toAccount, category, amountString, notes });
                break;

            case 'transfer':
                if (!fromAccount || !toAccount) return res.status(400).json({ success: false, message: 'Source and Destination Accounts required for Transfer.' });
                result = await TransactionService.createTransfer({ fromAccount, toAccount, amountString, notes });
                break;

            default:
                return res.status(400).json({ success: false, message: 'Invalid transaction type.' });
        }

        if (result.success) {
            res.status(201).json(result);
        } else {
            // This handles insufficient funds, validation errors, etc., thrown by the service
            res.status(400).json(result);
        }

    } catch (error) {
        res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
    }
})

module.exports = router;