const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. CONFIGURASI CORS (VERSI AMAN & FINAL)
// ==========================================
const allowedOrigins = [
    'https://fairygarden-frontend.vercel.app', // Domain Front-End Kamu
    'http://localhost:5500',                   // Localhost
    'http://127.0.0.1:5500'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(null, true); 
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: false 
}));

// ==========================================
// 2. MIDDLEWARE LAINNYA
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// ==========================================
// 3. ROUTES
// ==========================================
app.get('/', (req, res) => {
    res.send('Fairy Garden Backend is Running! 🌸');
});

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/carts');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const addressRoutes = require('./routes/addresses');
const paymentRoutes = require('./routes/payments');

// Gunakan Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/payments', paymentRoutes);

// ==========================================
// 4. GLOBAL ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err.stack);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// ==========================================
// 5. START SERVER (VERSI VERCEL COMPATIBLE)
// ==========================================

// A. Sinkronisasi Database (Jalan di background)
sequelize.sync({ alter: false })
    .then(() => console.log('Database Connected & Synced! 🐘'))
    .catch(err => console.error('Database Connection Failed:', err));

// B. Local Development (Hanya jalan di laptop, Vercel skip ini)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} 🚀`);
    });
}

// C. EXPORT APP (INI YANG DICARI VERCEL!)
module.exports = app;