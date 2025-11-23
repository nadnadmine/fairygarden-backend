const express = require('express');
const router = express.Router();
const { Order, User, Product, OrderItem } = require('../models');
const authMiddleware = require('../middleware/auth'); 
// Middleware upload dihapus karena Admin tidak upload gambar di sini

// ==========================================
// 1. GET DASHBOARD STATS (ADMIN)
// ==========================================
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Akses ditolak" });

        const totalOrders = await Order.count();
        const totalUsers = await User.count({ where: { role: 'customer' } });
        const totalProducts = await Product.count();
        
        // Hitung Pendapatan (Total Price dari order yang statusnya tidak 'BATAL')
        const orders = await Order.findAll();
        let revenue = 0;
        orders.forEach(o => {
            revenue += parseFloat(o.total_price || 0);
        });

        res.json({
            totalOrders,
            totalUsers,
            totalProducts,
            revenue
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal ambil stats" });
    }
});

// ==========================================
// 2. GET ALL ORDERS (ADMIN)
// ==========================================
router.get('/orders', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Akses ditolak" });

        const orders = await Order.findAll({
            include: [
                { model: User, attributes: ['first_name', 'email'] },
                { model: OrderItem }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "Gagal ambil data order" });
    }
});

// ==========================================
// 3. UPDATE ORDER STATUS (ADMIN)
// ==========================================
router.put('/orders/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Akses ditolak" });

        const { status, payment_status } = req.body;
        const order = await Order.findByPk(req.params.id);

        if (!order) return res.status(404).json({ error: "Order tidak ditemukan" });

        if (status) order.status = status;
        if (payment_status) order.payment_status = payment_status;

        await order.save();
        res.json({ message: "Status order diperbarui", order });

    } catch (err) {
        res.status(500).json({ error: "Gagal update order" });
    }
});

module.exports = router;