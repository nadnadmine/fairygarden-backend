const express = require('express');
const { Payment, Order, OrderStatusHistory } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload'); // Jika user mau upload ulang bukti
const router = express.Router();

// User: Upload/Re-upload Bukti Transfer (Jika lupa pas checkout)
router.post('/:orderId/upload-proof', auth, upload.single('proofOfPayment'), async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (order.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

        // Cek apakah payment record sudah ada
        let payment = await Payment.findOne({ where: { order_id: orderId } });
        
        if (payment) {
            // Update bukti
            payment.gateway_payment_ref = req.file.filename;
            payment.status = 'Pending'; // Reset status biar admin cek lagi
            await payment.save();
        } else {
            // Buat baru
            payment = await Payment.create({
                order_id: orderId,
                amount: order.total_price,
                method: 'QRIS',
                status: 'Pending',
                gateway_payment_ref: req.file.filename
            });
        }
        
        res.json({ message: 'Bukti transfer berhasil diupload', payment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN: Konfirmasi Pembayaran
router.put('/:paymentId/confirm', auth, adminOnly, async (req, res) => {
    const { status } = req.body; // 'Berhasil' atau 'Gagal'
    
    try {
        const payment = await Payment.findByPk(req.params.paymentId);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });

        // Update Payment
        payment.status = status;
        await payment.save();

        // Update Order Status juga
        const order = await Order.findByPk(payment.order_id);
        order.payment_status = status;
        if (status === 'Berhasil') {
            order.status = 'DIPROSES'; // Atau lanjut ke pengemasan
        }
        await order.save();

        // Catat Log History Order
        await OrderStatusHistory.create({
            order_id: order.order_id,
            prev_status: order.status,
            new_status: order.status,
            changed_by_admin: req.user.id,
            note: `Pembayaran dikonfirmasi: ${status}`
        });

        res.json({ message: 'Status pembayaran diupdate', payment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;