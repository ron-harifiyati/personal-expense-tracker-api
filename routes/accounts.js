const express = require('express');
const Account = require('../models/Account');
const router = express.Router();

//Get all accounts
router.get('/', async (req, res) => {
    const accounts = await Account.findAll();
    res.json(accounts) 
});

//Create an account
router.post('/', async (req, res) => {
    const { title, amount, imageTitle } = req.body;
    if (!title) return res.status(400).json({error: 'Title is required'});

    const account = await Account.create({
        title,
        amount,
        imageTitle,
    });

    res.status(201).json(account)
});

//Update an account
router.patch('/:id', async (req, res) => {
    const { title, amount, imageTitle } = req.body;
    const account = await Account.findOne({ where: {id: req.params.id}})

    if (!account) return res.status(404).json({error: 'Account not found'});

    account.title = title ?? account.title;
    account.amount = amount ?? account.amount;
    account.imageTitle = imageTitle ?? account.imageTitle;
    await account.save();

    res.json(account)
});

//Delete an account
router.delete('/:id', async (req, res) => {
    const account = await Account.findOne({where: {id: req.params.id}});

    if (!account) return res.status(404).json({error: 'Account not found'});

    await account.destroy();
    res.json({message: 'Deleted account successfully'})
});

module.exports = router;