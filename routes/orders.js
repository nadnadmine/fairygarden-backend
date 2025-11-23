const express = require('express');
const router = express.Router();
const { Order, OrderItem, Cart, CartItem, Product } = require('../models');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload'); // Middleware upload gambar

// CHECKOUT (POST /api/orders/checkout)
// CHECKOUT (VERSI SIMPLE: TANPA UPLOAD BUKTI)
// Kita hapus middleware 'upload.single', jadi API menerima JSON biasa.
router.post('/checkout', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;

        // 1. Ambil data JSON dari Body
        const {
            recipient_name, recipient_phone, sender_phone,
            address_line, province, postal_code,
            delivery_date, delivery_time, message_card,
            delivery_type 
        } = req.body;

        // 2. Ambil Keranjang User
        const cart = await Cart.findOne({
            where: { user_id: userId },
            include: [{ model: CartItem, include: [Product] }]
        });

        if (!cart || cart.CartItems.length === 0) {
            return res.status(400).json({ error: "Keranjang kosong" });
        }

        // 3. Hitung Total
        let itemsTotal = 0;
        cart.CartItems.forEach(item => {
            itemsTotal += parseFloat(item.Product.price) * item.quantity;
        });

        const deliveryFee = delivery_type === 'Pick Up' ? 0 : 25000;
        const handlingFee = 1000;
        const finalTotal = itemsTotal + deliveryFee + handlingFee;

        // 4. Buat Order Baru (Tanpa Proof of Payment)
        const newOrder = await Order.create({
            user_id: userId,
            recipient_name,
            recipient_phone,
            sender_phone: sender_phone || "-", 
            address_line,
            province: province || "DKI Jakarta",
            postal_code: postal_code || "00000",
            delivery_type: delivery_type || 'Delivery',
            delivery_date: delivery_date || new Date(), 
            delivery_time: delivery_time || "09:00 - 15:00",
            message_card: message_card || "-",
            total_price: finalTotal,
            delivery_fee: deliveryFee,
            handling_fee: handlingFee,
            proof_of_payment: null, // Kita set NULL karena tidak ada upload
            status: 'DIPROSES',
            payment_status: 'Paid', // ANGGAP LANGSUNG LUNAS SAAT KLIK PAY NOW
            payment_method: 'QRIS'
        });

        // 5. Pindahkan Item Keranjang
        const orderItemsArray = cart.CartItems.map(item => ({
            order_id: newOrder.order_id,
            product_id: item.product_id,
            product_name_snapshot: item.Product.product_name,
            quantity: item.quantity,
            price: item.Product.price
        }));
        await OrderItem.bulkCreate(orderItemsArray);

        // 6. Hapus Keranjang
        await CartItem.destroy({ where: { cart_id: cart.cart_id } });

        res.status(201).json({ message: "Order berhasil dibuat!", order_id: newOrder.order_id });

    } catch (error) {
        console.error("Checkout Error:", error);
        res.status(500).json({ error: "Gagal memproses order." });
    }
});

// GET HISTORY (GET /api/orders)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { user_id: req.user.userId },
            include: [OrderItem],
            order: [['created_at', 'DESC']]
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "Gagal ambil data order" });
    }
});

module.exports = router;