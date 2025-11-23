const express = require('express');
const router = express.Router();
const { Order, User, Product, OrderItem, Category } = require('../models');
const authMiddleware = require('../middleware/auth'); 

// ==========================================
// 1. GET DASHBOARD STATS (ADMIN)
// ==========================================
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Akses ditolak" });

        const totalOrders = await Order.count();
        const totalUsers = await User.count({ where: { role: 'customer' } });
        const totalProducts = await Product.count();
        
        const orders = await Order.findAll();
        let revenue = 0;
        orders.forEach(o => {
            if (o.status !== 'BATAL') revenue += parseFloat(o.total_price || 0);
        });

        res.json({ totalOrders, totalUsers, totalProducts, revenue });
    } catch (err) {
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
// 3. GET ALL CUSTOMERS (ADMIN) - FITUR BARU!
// ==========================================
router.get('/users', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Akses ditolak" });

        const users = await User.findAll({
            where: { role: 'customer' },
            attributes: ['user_id', 'first_name', 'last_name', 'email', 'phone', 'created_at'],
            order: [['created_at', 'DESC']]
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Gagal ambil data user" });
    }
});

// ==========================================
// 4. UPDATE ORDER STATUS (ADMIN)
// ==========================================
router.put('/orders/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Akses ditolak" });
        const { status } = req.body;
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: "Order tidak ditemukan" });
        
        order.status = status;
        await order.save();
        res.json({ message: "Status diperbarui", order });
    } catch (err) {
        res.status(500).json({ error: "Gagal update order" });
    }
});

// ==========================================
// 5. DELETE CUSTOMER (ADMIN ONLY) - FITUR BARU!
// ==========================================
router.delete('/users/:id', authMiddleware, async (req, res) => {
    try {
        // Cek Admin
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Akses ditolak" });

        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: "User tidak ditemukan" });
        }

        // SAFETY: Jangan biarkan Admin menghapus sesama Admin lewat menu ini
        if (user.role === 'admin') {
            return res.status(400).json({ error: "Tidak bisa menghapus sesama Admin!" });
        }

        await user.destroy();
        res.json({ message: "User berhasil dihapus." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal menghapus user." });
    }
});

module.exports = router;