const express = require('express');
const { Address } = require('../models');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const addresses = await Address.findAll({ where: { user_id: req.user.id } });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { recipient_name, recipient_phone, address_line, province, postal_code } = req.body;
  try {
    const address = await Address.create({ 
        user_id: req.user.id, 
        recipient_name, 
        recipient_phone, 
        address_line, 
        province, 
        postal_code 
    });
    res.status(201).json(address);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findByPk(req.params.id);
    if (!address) return res.status(404).json({ error: 'Address not found' });
    if (address.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    
    await address.update(req.body);
    res.json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findByPk(req.params.id);
    if (!address) return res.status(404).json({ error: 'Address not found' });
    if (address.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    
    await address.destroy();
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;