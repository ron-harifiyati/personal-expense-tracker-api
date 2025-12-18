const express = require('express');
const Account = require('../models/Account');
const router = express.Router();
const Record = require('../models/Record')

//Get all accounts
router.get('/', async (req, res) => {
    const accounts = await Account.findAll();
    res.json(accounts)
});

//Create an account
router.post('/', async (req, res) => {
    const { title, amount, imageTitle } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    try {
        const account = await Account.create({
            title,
            amount,
            imageTitle,
        });

        res.status(201).json({ message: "Successfully created account" })
    } catch (err) {
        res.status(500).json({ message: "Unexpected server error" })
    }
});

//Update an account
router.patch('/:id', async (req, res) => {
    const { title, amount, imageTitle } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    try {
        const account = await Account.findByPk(req.params.id);
        if (!account) return res.status(404).json({ error: 'Account not found' });

        account.title = title ?? account.title;
        account.amount = amount ?? account.amount;
        account.imageTitle = imageTitle ?? account.imageTitle;
        await account.save();

        res.status(200).json({ message: "Account modified successfully" })
    } catch (err) {
        req.status(500).json({ message: "Unexpected server error" })
    }
});

//Delete an account
router.delete('/:id', async (req, res) => {
    try {
        const account = await Account.findOne({ where: { id: req.params.id } });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const accountRecords = await Record.findAll({
            where: {
                [require('sequelize').Op.or]: [
                    { accountId: req.params.id },
                    { toAccountId: req.params.id }
                ]
            }
        });

        if (accountRecords > 0) {
            for (const record of accountRecords) {
                await record.destroy()
            }
        };

        await account.destroy();
        res.json({ message: 'Deleted account successfully' })
    } catch (err) {
        res.status(500).json({ message: "Unexpected server error" })
    }
});

module.exports = router;