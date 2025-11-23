const express = require('express');
const router = express.Router();
const { Category, Product } = require('../models');
const authMiddleware = require('../middleware/auth');
// PENTING: Middleware upload sudah dihapus

// ==========================================
// 1. GET ALL CATEGORIES (PUBLIC)
// ==========================================
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal mengambil kategori.' });
    }
});

// ==========================================
// 2. GET CATEGORY BY ID (PUBLIC)
// ==========================================
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id, {
            include: [{ model: Product }] // Tampilkan juga produk di dalamnya
        });
        if (!category) return res.status(404).json({ error: 'Kategori tidak ditemukan.' });
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil detail kategori.' });
    }
});

// ==========================================
// 3. CREATE CATEGORY (ADMIN ONLY)
// ==========================================
router.post('/', authMiddleware, async (req, res) => {
    try {
        // Cek Admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak.' });
        }

        const { category_name, description } = req.body;

        const newCategory = await Category.create({
            category_name,
            description
        });

        res.status(201).json({ message: 'Kategori berhasil dibuat!', category: newCategory });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal membuat kategori.' });
    }
});

// ==========================================
// 4. UPDATE CATEGORY (ADMIN ONLY)
// ==========================================
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak.' });
        }

        const { category_name, description } = req.body;
        const category = await Category.findByPk(req.params.id);

        if (!category) return res.status(404).json({ error: 'Kategori tidak ditemukan.' });

        category.category_name = category_name || category.category_name;
        category.description = description || category.description;

        await category.save();

        res.json({ message: 'Kategori berhasil diupdate!', category });
    } catch (err) {
        res.status(500).json({ error: 'Gagal update kategori.' });
    }
});

// ==========================================
// 5. DELETE CATEGORY (ADMIN ONLY)
// ==========================================
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak.' });
        }

        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: 'Kategori tidak ditemukan.' });

        await category.destroy();
        res.json({ message: 'Kategori berhasil dihapus.' });
    } catch (err) {
        res.status(500).json({ error: 'Gagal menghapus kategori.' });
    }
});

module.exports = router;