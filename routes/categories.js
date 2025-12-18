const express = require('express');
const Category = require('../models/Category');
const router = express.Router();
const Record = require('../models/Record')

// Get all categories
router.get('/', async (req, res) => {
    let categories = await Category.findAll();
    res.json(categories)
});

// Get all expense categories
router.get('/expense', async (req, res) => {
    let categories = await Category.findAll({ where: { type: 'expense' } });
    res.json(categories)
});

// Get all income categories
router.get('/income', async (req, res) => {
    let categories = await Category.findAll({ where: { type: 'income' } });
    res.json(categories)
});

// Create a new category
router.post('/', async (req, res) => {
    const { title, type, imageTitle } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    if (!type) return res.status(400).json({ message: 'Type is required' });

    try {
        let category = await Category.create({
            title,
            type,
            imageTitle
        });

        res.status(201).json({ message: "Category created successfully" })
    } catch (err) {
        req.status(500).json({ message: "Unexpexted server error" })
    }
});

// Modify an existing category
router.patch('/:id', async (req, res) => {
    const { title, type, imageTitle } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    if (!type) return res.status(400).json({ message: 'Type is required' });

    try {
        let category = await Category.findOne({ where: { id: req.params.id } });

        if (!category) return res.status(400).json({ message: 'Category not found' });

        category.title = title ?? category.title;
        category.type = type ?? category.type;
        category.imageName = imageTitle ?? category.imageTitle;
        await category.save();

        res.status(200).json({ messege: "Category modified successfully" })
    } catch (err) {
        req.status(500).json({ message: "Unexpexted server error" })
    }
});

// Delete an existing category
router.delete('/:id', async (req, res) => {
    try {
        let category = await Category.findOne({ where: { id: req.params.id } });
        if (!category) return res.status(404).json({ messege: 'Category not found' })

        const categoryRecords = await Record.findAll({
            where: {
                categoryId: category.id
            }
        })

        if (categoryRecords.length > 0) {
            for (const record of categoryRecords) {
                await record.destroy()
            }
        }

        await category.destroy();
        res.status(200).json({ message: { message: 'Category deleted successfully' } })
    } catch (err) {
        req.status(500).json({ message: "Unexpexted server error" })
    }
});

module.exports = router