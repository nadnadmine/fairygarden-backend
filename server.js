const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os'); // Tambahkan OS untuk path Vercel
const dotenv = require('dotenv');
const { sequelize } = require('./models');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- KONFIGURASI FOLDER UPLOADS (PENTING UNTUK VERCEL) ---
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
    // Di Vercel, arahkan endpoint /uploads ke folder sementara (/tmp)
    app.use('/uploads', express.static(os.tmpdir()));
} else {
    // Di Laptop, arahkan endpoint /uploads ke folder project biasa
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/carts');
const addressRoutes = require('./routes/addresses');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Fairy Garden API is Running!');
});

// Koneksi Database (Ditaruh di luar app.listen agar aman di Vercel)
sequelize.authenticate()
    .then(() => console.log('✅ Database Connected to PostgreSQL'))
    .catch(err => console.error('❌ Database Connection Error:', err));

// --- LOGIKA START SERVER (VERCEL vs LOCAL) ---
// Jika file dijalankan langsung (node server.js), nyalakan port.
// Jika diimport oleh Vercel, jangan nyalakan port (Vercel yang handle).
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export app untuk Vercel
module.exports = app;