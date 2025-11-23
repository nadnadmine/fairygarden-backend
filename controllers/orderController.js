const { sequelize, Order, OrderItem, Product, Payment, Cart, CartItem } = require('../models');

exports.createOrderManual = async (req, res) => {
    const t = await sequelize.transaction(); // Mulai transaksi database

    try {
        const { 
            userId, 
            addressSnapshot, // Object berisi: name, phone, address, city, postalCode
            items,           // Array dari frontend: [{productId, quantity, price...}]
            deliveryFee,
            totalAmount
        } = req.body;
        
        // Ambil nama file bukti transfer (jika ada diupload)
        const proofImage = req.file ? req.file.filename : null;

        // 1. Buat Order
        const newOrder = await Order.create({
            user_id: userId,
            
            // Snapshot Alamat (PENTING: Disimpan sebagai teks statis)
            shipping_recipient_name: addressSnapshot.recipientName,
            shipping_phone: addressSnapshot.phone,
            shipping_address_line: addressSnapshot.addressLine,
            shipping_province: addressSnapshot.province,
            shipping_postal_code: addressSnapshot.postalCode,
            
            total_price: totalAmount,
            delivery_fee: deliveryFee,
            status: 'DIPROSES', // Status pesanan default
            payment_status: 'Pending', // Status bayar Pending (tunggu admin cek)
            payment_method: 'QRIS'
        }, { transaction: t });

        // 2. Masukkan Item ke OrderItems
        for (const item of items) {
            // Validasi stok dulu (opsional tapi disarankan)
            const product = await Product.findByPk(item.productId, { transaction: t });
            if (!product) throw new Error(`Produk ID ${item.productId} tidak ditemukan`);
            
            if (product.stock < item.quantity) {
                throw new Error(`Stok ${product.product_name} tidak cukup`);
            }

            // Kurangi Stok
            await product.update({ stock: product.stock - item.quantity }, { transaction: t });

            // Simpan Item Order
            await OrderItem.create({
                order_id: newOrder.order_id,
                product_id: item.productId,
                product_name_snapshot: product.product_name, // Snapshot nama produk
                quantity: item.quantity,
                price_at_purchase: product.price, // Simpan harga saat ini
                delivery_option: item.deliveryOption || 'Delivery',
                delivery_date: item.deliveryDate, // "2025-12-31"
                delivery_time: item.deliveryTime,
                message_card_text: item.messageCard // Gabungan text kartu ucapan
            }, { transaction: t });
        }

        // 3. Buat Record Pembayaran
        await Payment.create({
            order_id: newOrder.order_id,
            amount: totalAmount,
            method: 'QRIS',
            status: 'Pending',
            gateway_payment_ref: proofImage // Kita simpan nama file bukti transfer di sini (Hack sedikit)
        }, { transaction: t });

        // 4. Kosongkan Keranjang (Jika beli dari cart)
        // Asumsi kita tahu ID Cart user
        await CartItem.destroy({ 
            where: { cart_id: (await Cart.findOne({ where: { user_id: userId } })).cart_id } 
        }, { transaction: t });

        // Commit transaksi (Simpan permanen)
        await t.commit();

        res.status(201).json({ 
            message: "Pesanan berhasil dibuat! Silakan tunggu konfirmasi Admin.",
            orderId: newOrder.order_id 
        });

    } catch (error) {
        await t.rollback(); // Batalkan semua perubahan jika error
        console.error(error);
        res.status(500).json({ message: "Gagal membuat pesanan", error: error.message });
    }
};