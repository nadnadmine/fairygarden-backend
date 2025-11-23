const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Admin } = require('../models');
const authMiddleware = require('../middleware/auth'); // Import Middleware yang benar

require('dotenv').config();

// ==========================================
// 1. REGISTER CUSTOMER (POST /api/auth/register)
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, phone, password } = req.body;

        // Cek apakah email sudah ada
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email sudah terdaftar!' });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat User Baru
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            phone,
            password_hash: hashedPassword,
            role: 'customer'
        });

        res.status(201).json({ message: 'Registrasi berhasil!', user: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal registrasi user.' });
    }
});

// ==========================================
// 2. LOGIN CUSTOMER (POST /api/auth/login)
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cari User
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Email atau password salah.' });
        }

        // Cek Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Email atau password salah.' });
        }

        // Buat Token
        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            process.env.JWT_SECRET || 'rahasia123',
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login berhasil!',
            token,
            user: {
                user_id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login error.' });
    }
});

// ==========================================
// 3. LOGIN ADMIN (POST /api/auth/admin/login)
// ==========================================
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cari Admin
        const admin = await Admin.findOne({ where: { email } });
        if (!admin) {
            return res.status(400).json({ error: 'Email admin tidak ditemukan.' });
        }

        // Cek Password
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Password salah.' });
        }

        const token = jwt.sign(
            { userId: admin.admin_id, role: 'admin' },
            process.env.JWT_SECRET || 'rahasia123',
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login Admin berhasil!',
            token,
            user: {
                first_name: admin.name,
                role: 'admin'
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Admin login error.' });
    }
});

// ==========================================
// 4. GET MY PROFILE (GET /api/auth/me)
// ==========================================
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            attributes: { exclude: ['password_hash'] }
        });
        if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil profil.' });
    }
});

// ==========================================
// 5. UPDATE PROFILE (PUT /api/auth/profile)
// ==========================================
// Kita hapus upload middleware dulu untuk mencegah error
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { first_name, last_name, phone, password } = req.body;
        const userId = req.user.userId;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

        // Update data
        if (first_name) user.first_name = first_name;
        if (last_name) user.last_name = last_name;
        if (phone) user.phone = phone;

        // Update password jika ada
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password_hash = hashedPassword;
        }

        await user.save();

        res.json({ message: 'Profil berhasil diupdate!', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal update profil.' });
    }
});

module.exports = router;