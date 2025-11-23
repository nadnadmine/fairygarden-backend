const express = require('express');
const router = express.Router();
const { Cart, CartItem, Product } = require('../models');
const authMiddleware = require('../middleware/auth'); 

// ==========================================
// 1. GET USER CART
// ==========================================
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;

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

        if (!cart) {
            cart = await Cart.create({ user_id: userId });
            cart.CartItems = [];
        }

        res.json(cart);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal mengambil keranjang.' });
    }
});

// ==========================================
// 2. ADD ITEM TO CART
// ==========================================
router.post('/items', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        // HANYA AMBIL product_id DAN quantity. JANGAN AMBIL delivery_option LAGI.
        const { product_id, quantity } = req.body; 

        let cart = await Cart.findOne({ where: { user_id: userId } });
        if (!cart) {
            cart = await Cart.create({ user_id: userId });
        }

        const existingItem = await CartItem.findOne({
            where: {
                cart_id: cart.cart_id,
                product_id: product_id
            }
        });

        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
            await existingItem.save();
        } else {
            // Create baru TANPA delivery_option
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
// 3. UPDATE QUANTITY
// ==========================================
router.put('/items/:itemId', authMiddleware, async (req, res) => {
    try {
        const { quantity } = req.body;
        const cartItem = await CartItem.findByPk(req.params.itemId);

        if (!cartItem) return res.status(404).json({ error: 'Item tidak ditemukan.' });

        if (quantity < 1) {
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
// 4. REMOVE ITEM
// ==========================================
router.delete('/items/:itemId', authMiddleware, async (req, res) => {
    try {
        const cartItem = await CartItem.findByPk(req.params.itemId);
        if (!cartItem) return res.status(404).json({ error: 'Item tidak ditemukan.' });

        await cartItem.destroy();
        res.json({ message: 'Item dihapus dari keranjang.' });
    } catch (err) {
        res.status(500).json({ error: 'Gagal menghapus item.' });
    }
});

// ==========================================
// 5. CLEAR CART
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