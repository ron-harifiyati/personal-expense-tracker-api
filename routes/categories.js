const express = require('express');
const Category = require('../models/Category');
const router = express.Router();
const Record = require('../models/Record')

router.get('/', async (req, res) => {
    let categories = await Category.findAll();
    res.json(categories)
});

router.post('/', async (req, res) => {
    const { title, type, imageTitle } = req.body;
    if (!title) return res.status(400).json({message: 'Title is required'});

    let category = await Category.create({
        title,
        type,
        imageTitle
    });

    res.status(201).json({category})
});

router.patch('/:id', async (req, res) => {
    const { title, type, imageTitle } = req.body;
    let category = await Category.findOne({where: {id: req.params.id}});

    if (!category) return res.status(400).json({message: 'Category not found'});

    category.title = title ?? category.title;
    category.type = type ?? category.type;
    category.imageName = imageTitle ?? category.imageTitle;
    await category.save();

    res.json({category})
});

router.delete('/:id', async (req, res) => {
    let category = await Category.findOne({where: {id: req.params.id}});
    if (!category) return res.status(404).json({messege: 'Category not found'})

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
    res.json({message: {message: 'Category deleted successfully'}})
});

module.exports = router