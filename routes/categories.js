const express = require('express');
const { Category } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, adminOnly, async (req, res) => {
  const { name, description } = req.body;
  try {
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    await category.update(req.body);
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Category.destroy({ where: { category_id: req.params.id } });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;