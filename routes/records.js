const express = require('express');
const router = express.Router();
const TransactionService = require('../services/TransactionService');
const Account = require('../models/Account');
const Category = require('../models/Category');
const Record = require('../models/Record');

// Get all records
router.get('/', async (req, res) => {
    const records = await Record.findAll();
    res.json(records)
});

// Get transfer records
router.get('/transfer', async (req, res) => {
    const records = await Record.findAll({ where: { type: "transfer" } });
    res.json(records)
});

// Get income records
router.get('/income', async (req, res) => {
    const records = await Record.findAll({ where: { type: "income" } });
    res.json(records)
});

// Get expense records
router.get('/expense', async (req, res) => {
    const records = await Record.findAll({ where: { type: "expense" } });
    res.json(records)
});

// Create a new record
router.post('/', async (req, res) => {
    const { type, amountString, fromAccountId, toAccountId, categoryId, notes } = req.body;
    if (!type) return res.status(400).json({ message: "Type is required" });
    if (!amountString) return res.status(400).json({ message: "Amount is required" });

    try {
        let result;

        const category = await Category.findByPk(categoryId);
        const fromAccount = await Account.findByPk(fromAccountId);
        const toAccount = await Account.findByPk(toAccountId);

        switch (type.toLowerCase()) {
            case 'expense':
                if (!fromAccount || !category) return res.status(400).json({ message: 'Source Account and Category required for Expense.' });
                result = await TransactionService.createExpense({ fromAccount, category, amountString, notes });
                break;

            case 'income':
                if (!toAccount || !category) return res.status(400).json({ message: 'Destination Account and Category required for Income.' });
                result = await TransactionService.createIncome({ toAccount, category, amountString, notes });
                break;

            case 'transfer':
                if (!fromAccount || !toAccount) return res.status(400).json({ message: 'Source and Destination Accounts required for Transfer.' });
                result = await TransactionService.createTransfer({ fromAccount, toAccount, amountString, notes });
                break;

            default:
                return res.status(400).json({ message: "Invalid transaction type." });
        }

        if (result.success) {
            res.status(201).json(result);
        } else {
            // This handles insufficient funds, validation errors, etc., thrown by the service
            res.status(400).json(result);
        }

    } catch (error) {
        res.status(500).json({ message: 'An unexpected server error occurred.' });
    }
})

// Update an existinf=g record
router.patch('/:id', async (req, res) => {
    const { type, amountString, fromAccountId, toAccountId, categoryId, notes } = req.body;
    const id = req.params.id

    if (!type) return res.status(400).json({ message: "Type is required" });
    if (!amountString) return res.status(400).json({ message: "Amount is required" });
    if (!amountString) return res.status(400).json({ message: 'Amount is required.' });

    try {
        let result;

        const existingRecord = await Record.findByPk(id);
        if (!existingRecord) return res.status(404).json({ message: 'Record not found' });

        await TransactionService.reverseTransaction(id)

        const category = await Category.findByPk(categoryId);
        const fromAccount = await Account.findByPk(fromAccountId);
        const toAccount = await Account.findByPk(toAccountId);

        switch (type.toLowerCase()) {
            case 'expense':
                if (!fromAccount || !category) return res.status(400).json({ message: 'Source Account and Category required for Expense.' });
                result = await TransactionService.createExpense({ id, fromAccount, category, amountString, notes });
                break;

            case 'income':
                if (!toAccount || !category) return res.status(400).json({ message: 'Destination Account and Category required for Income.' });
                result = await TransactionService.createIncome({ id, toAccount, category, amountString, notes });
                break;

            case 'transfer':
                if (!fromAccount || !toAccount) return res.status(400).json({ message: 'Source and Destination Accounts required for Transfer.' });
                result = await TransactionService.createTransfer({ id, fromAccount, toAccount, amountString, notes });
                break;

            default:
                return res.status(400).json({ message: 'Invalid transaction type.' });
        }

        if (result.success) {
            res.json({ message: 'Successfully edited record' });
        } else {
            // This handles insufficient funds, validation errors, etc., thrown by the service
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ message: 'An unexpected server error occurred.' });
    }
})

// Delete an exising account
router.delete('/:id', async (req, res) => {
    const id = req.params.id

    try {
        const result = await TransactionService.reverseTransaction(id)

        if (result.success) {
            res.json({ success: true, message: 'Successfully deleted record' });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ message: 'An unexpected server error occurred.' });
    }
})

module.exports = router;