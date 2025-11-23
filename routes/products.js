const express = require('express');
const router = express.Router();
const { Product, Category } = require('../models');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');

// ==========================================
// 1. GET ALL PRODUCTS (PUBLIC)
// ==========================================
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        let whereClause = {};

        // Filter by Search Name
        if (search) {
            whereClause.product_name = { [Op.iLike]: `%${search}%` };
        }

        // Filter by Category
        if (category) {
            // Jika butuh filter kategori by ID, tambahkan logika di sini
            // Tapi biasanya filter kategori dilakukan di Frontend atau join tabel
        }

        const products = await Product.findAll({
            where: whereClause,
            include: [{ model: Category, attributes: ['category_name'] }],
            order: [['created_at', 'DESC']]
        });

        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal mengambil data produk.' });
    }
});

// ==========================================
// 2. GET PRODUCT DETAIL (PUBLIC)
// ==========================================
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [{ model: Category }]
        });

        if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan.' });

        res.json(product);
    } catch (err) {
        res.status(500).json({ error: 'Error mengambil detail produk.' });
    }
});

// ==========================================
// 3. CREATE PRODUCT (ADMIN ONLY)
// ==========================================
// Middleware upload dihapus, ganti jadi input URL
router.post('/', authMiddleware, async (req, res) => {
    try {
        // Cek apakah user adalah Admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak. Khusus Admin.' });
        }

        const { product_name, description, price, stock, category_id, image_url } = req.body;

        const newProduct = await Product.create({
            product_name,
            description,
            price,
            stock,
            category_id,
            image_url, // Ambil link gambar dari input text
            sold: 0
        });

        res.status(201).json({ message: 'Produk berhasil ditambahkan!', product: newProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal menambah produk.' });
    }
});

// ==========================================
// 4. UPDATE PRODUCT (ADMIN ONLY)
// ==========================================
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak.' });
        }

        const { product_name, description, price, stock, category_id, image_url } = req.body;
        const product = await Product.findByPk(req.params.id);

        if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan.' });

        // Update Field
        product.product_name = product_name || product.product_name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.stock = stock || product.stock;
        product.category_id = category_id || product.category_id;
        
        // Update Gambar jika ada link baru
        if (image_url) {
            product.image_url = image_url;
        }

        await product.save();
        res.json({ message: 'Produk berhasil diupdate!', product });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal update produk.' });
    }
});

// ==========================================
// 5. DELETE PRODUCT (ADMIN ONLY)
// ==========================================
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak.' });
        }

        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan.' });

        await product.destroy();
        res.json({ message: 'Produk berhasil dihapus.' });
    } catch (err) {
        res.status(500).json({ error: 'Gagal menghapus produk.' });
    }
});

module.exports = router;