const express = require('express');
const cors = require('cors');
const path = require('path'); // <--- INI YANG TADI HILANG
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

// Folder uploads agar bisa diakses publik (Penting untuk gambar)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    res.send('Welcome to Fairy Garden API!');
});

// Start Server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await sequelize.authenticate();
        console.log('✅ Database Connected to PostgreSQL');
    } catch (error) {
        console.error('❌ Database Connection Error:', error);
    }
});