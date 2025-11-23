const express = require('express');
const { Cart, CartItem, Product } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();


router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.id }, include: [{ model: CartItem, include: Product }] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/items', auth, async (req, res) => {
  const { product_id, quantity, delivery_option, delivery_date, delivery_time, message_card_from, message_card_to, message_card_text } = req.body;
  try {
    let cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) cart = await Cart.create({ user_id: req.user.id });
    const item = await CartItem.create({ cart_id: cart.cart_id, product_id, quantity, delivery_option, delivery_date, delivery_time, message_card_from, message_card_to, message_card_text });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/items/:id', auth, async (req, res) => {
  try {
    const item = await CartItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/items/:id', auth, async (req, res) => {
  try {
    await CartItem.destroy({ where: { cart_item_id: req.params.id } });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;