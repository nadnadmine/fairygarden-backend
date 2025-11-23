const { Order, Payment, OrderStatusHistory } = require('../models');

exports.confirmPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { adminId } = req.body; // ID Admin yang login

        // 1. Update Status Order
        await Order.update(
            { payment_status: 'Berhasil' },
            { where: { order_id: orderId } }
        );

        // 2. Update Status Tabel Payment
        await Payment.update(
            { status: 'Berhasil' },
            { where: { order_id: orderId } }
        );

        // 3. Catat History (Audit Log)
        await OrderStatusHistory.create({
            order_id: orderId,
            prev_status: 'DIPROSES', // Asumsi status awal
            new_status: 'DIPROSES',  // Status order tetap diproses, cuma pembayaran yang berubah
            changed_by_admin: adminId,
            note: 'Pembayaran QRIS Dikonfirmasi Manual'
        });

        res.json({ message: "Pembayaran berhasil dikonfirmasi" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};