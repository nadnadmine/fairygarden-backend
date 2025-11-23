const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Admin } = require('../models');
// TAMBAHAN PENTING: Import middleware auth di sini
const { auth } = require('../middleware/auth'); 

const router = express.Router();

// 1. Register User
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, password, phone } = req.body;
  try {
    // Password di-hash otomatis oleh Hooks di Model User
    const user = await User.create({ first_name, last_name, email, password_hash: password, phone });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    // Gunakan method comparePassword dari model
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.user_id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // --- GANTI BAGIAN INI ---
    // Kirim data LENGKAP agar frontend tidak error
    res.json({
        token,
        user: {
            id: user.user_id,
            first_name: user.first_name, // Kirim Nama Depan
            last_name: user.last_name,   // Kirim Nama Belakang (PENTING)
            email: user.email,           // Kirim Email
            phone: user.phone,           // Kirim No HP (PENTING)
            role: 'customer'
        }
    });
    // ------------------------
    // Payload token: id (user_id) dan role
    res.json({ token, user: { id: user.user_id, name: user.first_name, role: 'customer' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Login Admin
router.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await Admin.findOne({ where: { email } });
      if (!admin || !(await admin.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: admin.admin_id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '12h' });
      res.json({ token, user: { id: admin.admin_id, name: admin.name, role: 'admin' } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// 4. User: Update Profile (Untuk Halaman 'Account Details')
router.put('/profile', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Update field yang dikirim saja
        const { first_name, last_name, phone, email } = req.body;
        
        if (first_name) user.first_name = first_name;
        if (last_name) user.last_name = last_name;
        if (phone) user.phone = phone;
        if (email) user.email = email; 

        await user.save();
        
        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Reset Password (Sederhana tanpa email)
router.put('/reset-password', async (req, res) => {
    const { email, new_password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'Email tidak terdaftar' });

        // Manual hash password baru
        user.password_hash = await bcrypt.hash(new_password, 10);
        
        await user.save();
        res.json({ message: 'Password berhasil direset. Silakan login kembali.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Cek User Login (Me) - Opsional untuk Frontend mengecek token valid/tidak
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['user_id', 'first_name', 'last_name', 'email', 'phone']
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;