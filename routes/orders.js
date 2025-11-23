const express = require('express');
const { sequelize, Order, OrderItem, Cart, CartItem, Product, Address, Payment, OrderStatusHistory } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Get User Orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.findAll({ 
        where: { user_id: req.user.id }, 
        include: [OrderItem, Payment], 
        order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Detail Order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: [OrderItem, Payment] });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Checkout (Create Order + Upload Bukti Bayar)
router.post('/checkout', auth, upload.single('proofOfPayment'), async (req, res) => {
  const t = await sequelize.transaction(); // Mulai transaksi
  
  try {
    const { address_id } = req.body;
    const proofFile = req.file;

    // 1. Ambil Data Cart
    const cart = await Cart.findOne({ 
        where: { user_id: req.user.id }, 
        include: [{ model: CartItem, include: Product }] 
    });

    if (!cart || cart.CartItems.length === 0) {
        await t.rollback();
        return res.status(400).json({ error: 'Cart is empty' });
    }

    // 2. Ambil Alamat
    const address = await Address.findByPk(address_id);
    if (!address) {
        await t.rollback();
        return res.status(404).json({ error: 'Address not found' });
    }

    // 3. Proses Items (Satu Loop Saja!)
    let itemsTotal = 0;
    const orderItemsData = [];

    for (const item of cart.CartItems) {
        // Cek Stok
        if (item.Product.stock < item.quantity) {
            throw new Error(`Stok ${item.Product.product_name} tidak cukup.`);
        }

        // Kurangi Stok
        await item.Product.update({ stock: item.Product.stock - item.quantity }, { transaction: t });
        
        // Tambah Sold Counter
        await item.Product.increment('sold', { by: item.quantity, transaction: t });

        // Hitung Harga
        const itemPrice = parseFloat(item.Product.price); // Pastikan jadi angka
        itemsTotal += item.quantity * itemPrice;
        
        // Debugging: Cek di terminal VS Code apakah harga muncul
        console.log(`Processing: ${item.Product.product_name}, Price: ${itemPrice}`);

        orderItemsData.push({
            product_id: item.product_id,
            product_name_snapshot: item.Product.product_name, 
            quantity: item.quantity,
            
            // Pastikan field ini bernama 'price' sesuai model OrderItem.js
            price: itemPrice, 
            
            delivery_option: item.delivery_option,
            delivery_date: item.delivery_date,
            delivery_time: item.delivery_time,
            message_card: `From: ${item.message_card_from || '-'} | To: ${item.message_card_to || '-'} | Msg: ${item.message_card_text || '-'}`
        });
    }
    
    // 4. Buat Order Header
    const deliveryFee = 15000;
    const handlingFee = 1000;
    const finalTotal = itemsTotal + deliveryFee + handlingFee;

    const newOrder = await Order.create({
      user_id: req.user.id,
      address_id: address.address_id, 
      
      // Snapshot Alamat
      shipping_recipient_name: address.recipient_name,
      shipping_phone: address.recipient_phone,
      shipping_address_line: address.address_line,
      shipping_province: address.province,
      shipping_postal_code: address.postal_code,

      total_price: finalTotal,
      delivery_fee: deliveryFee,
      handling_fee: handlingFee,
      status: 'DIPROSES',
      payment_status: proofFile ? 'Pending' : 'Pending',
      payment_method: 'QRIS'
    }, { transaction: t });

    // 5. Simpan Order Items
    // Map ulang ID order ke data items
    const itemsWithOrderId = orderItemsData.map(item => ({ ...item, order_id: newOrder.order_id }));
    
    // Bulk Create
    await OrderItem.bulkCreate(itemsWithOrderId, { transaction: t });

    // 6. Simpan Pembayaran
    if (proofFile) {
        await Payment.create({
            order_id: newOrder.order_id,
            amount: finalTotal,
            method: 'QRIS',
            status: 'Pending',
            gateway_payment_ref: proofFile.filename
        }, { transaction: t });
    }

    // 7. Hapus Keranjang
    await CartItem.destroy({ where: { cart_id: cart.cart_id }, transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Order created', order: newOrder });

  } catch (err) {
    await t.rollback();
    console.error("Checkout Error:", err); // Lihat error lengkap di terminal
    res.status(500).json({ error: err.message });
  }
});

// --- TAMBAHAN: ADMIN UPDATE STATUS ---

// Admin: Update Status Pesanan
router.put('/:id/status', auth, adminOnly, async (req, res) => {
  const { status, note } = req.body;
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const prevStatus = order.status;
    
    // Update status (Pastikan uppercase agar sesuai ENUM database: 'DIPROSES', 'DIKIRIM', dll)
    order.status = status.toUpperCase(); 
    await order.save();

    // Catat History Perubahan (Audit Log)
    await OrderStatusHistory.create({
      order_id: order.order_id,
      prev_status: prevStatus,
      new_status: order.status,
      changed_by_admin: req.user.id,
      note: note
    });

    res.json({ message: 'Order status updated successfully', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;