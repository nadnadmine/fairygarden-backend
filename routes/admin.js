const express = require('express');
const jwt = require('jsonwebtoken');
const { Admin, ActivityLog } = require('../models');
const router = express.Router();
const { Order, OrderItem, Product, sequelize } = require('../models');
const { Op } = require('sequelize');
const { User } = require('../models');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { email } });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin.admin_id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

router.get('/activity-logs', auth, adminOnly, async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({ include: Admin });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Activity Logs
router.get('/activity-logs', auth, adminOnly, async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({ 
        include: [{ model: Admin, attributes: ['name', 'email'] }],
        order: [['created_at', 'DESC']]
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Dashboard Stats (Kartu Statistik Admin)
router.get('/stats', auth, adminOnly, async (req, res) => {
    try {
        // 1. Total Pesanan
        const totalOrders = await Order.count();

        // 2. Pendapatan (Total semua order yang statusnya tidak dibatalkan)
        // Menggunakan fungsi SUM SQL
        const incomeData = await Order.findAll({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('total_price')), 'totalIncome']
            ],
            where: {
                status: { [Op.not]: 'DIBATALKAN' } // Hitung yang sukses saja
            }
        });
        const totalIncome = incomeData[0].dataValues.totalIncome || 0;

        // 3. Produk Terjual (Sum kolom 'sold' di tabel Product)
        const soldData = await Product.findAll({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('sold')), 'totalSold']
            ]
        });
        const totalSold = soldData[0].dataValues.totalSold || 0;

        res.json({
            totalOrders,
            totalIncome,
            totalSold
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET List Semua Pelanggan
router.get('/customers', auth, adminOnly, async (req, res) => {
    try {
        // PERBAIKAN: Hapus "where: { role: 'customer' }"
        // Karena semua isi tabel User adalah customer.
        const customers = await User.findAll({
            attributes: ['user_id', 'first_name', 'last_name', 'email', 'phone', 'created_at'],
            order: [['created_at', 'DESC']]
        });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;