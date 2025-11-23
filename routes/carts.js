const express = require('express');
const router = express.Router();
const { Cart, CartItem, Product } = require('../models');
const authMiddleware = require('../middleware/auth'); 
// PENTING: Import authMiddleware harus langsung seperti di atas

// ==========================================
// 1. GET USER CART (GET /api/carts)
// ==========================================
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Cari Cart milik user
        let cart = await Cart.findOne({
            where: { user_id: userId },
            include: [
                {
                    model: CartItem,
                    include: [
                        {
                            model: Product,
                            attributes: ['product_id', 'product_name', 'price', 'image_url', 'stock']
                        }
                    ]
                }
            ]
        });

        // Jika belum punya cart, buatkan satu (kosong)
        if (!cart) {
            cart = await Cart.create({ user_id: userId });
            cart.CartItems = []; // Set array kosong biar gak error di frontend
        }

        res.json(cart);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal mengambil keranjang.' });
    }
});

// ==========================================
// 2. ADD ITEM TO CART (POST /api/carts/items)
// ==========================================
router.post('/items', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { product_id, quantity } = req.body;

        // 1. Pastikan Cart Ada
        let cart = await Cart.findOne({ where: { user_id: userId } });
        if (!cart) {
            cart = await Cart.create({ user_id: userId });
        }

        // 2. Cek apakah produk sudah ada di cart ini?
        const existingItem = await CartItem.findOne({
            where: {
                cart_id: cart.cart_id,
                product_id: product_id
            }
        });

        if (existingItem) {
            // Update Quantity
            existingItem.quantity += parseInt(quantity);
            await existingItem.save();
        } else {
            // Tambah Item Baru
            await CartItem.create({
                cart_id: cart.cart_id,
                product_id: product_id,
                quantity: parseInt(quantity)
            });
        }

        res.json({ message: 'Produk masuk keranjang!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal menambah item.' });
    }
});

// ==========================================
// 3. UPDATE ITEM QUANTITY (PUT /api/carts/items/:itemId)
// ==========================================
router.put('/items/:itemId', authMiddleware, async (req, res) => {
    try {
        const { quantity } = req.body;
        const cartItem = await CartItem.findByPk(req.params.itemId);

        if (!cartItem) {
            return res.status(404).json({ error: 'Item tidak ditemukan.' });
        }

        if (quantity < 1) {
            // Jika qty 0, hapus saja
            await cartItem.destroy();
        } else {
            cartItem.quantity = quantity;
            await cartItem.save();
        }

        res.json({ message: 'Keranjang diupdate.' });

    } catch (err) {
        res.status(500).json({ error: 'Gagal update keranjang.' });
    }
});

// ==========================================
// 4. REMOVE ITEM (DELETE /api/carts/items/:itemId)
// ==========================================
router.delete('/items/:itemId', authMiddleware, async (req, res) => {
    try {
        const cartItem = await CartItem.findByPk(req.params.itemId);
        
        if (!cartItem) {
            return res.status(404).json({ error: 'Item tidak ditemukan.' });
        }

        await cartItem.destroy();
        res.json({ message: 'Item dihapus dari keranjang.' });

    } catch (err) {
        res.status(500).json({ error: 'Gagal menghapus item.' });
    }
});

// ==========================================
// 5. CLEAR CART (DELETE /api/carts)
// ==========================================
router.delete('/', authMiddleware, async (req, res) => {
    try {
        const cart = await Cart.findOne({ where: { user_id: req.user.userId } });
        if (cart) {
            await CartItem.destroy({ where: { cart_id: cart.cart_id } });
        }
        res.json({ message: 'Keranjang dikosongkan.' });
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengosongkan keranjang.' });
    }
});

module.exports = router;