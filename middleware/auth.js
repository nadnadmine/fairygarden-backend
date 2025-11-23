const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Pastikan export-nya LANGSUNG fungsi, bukan object
module.exports = (req, res, next) => {
    try {
        // Ambil header Authorization
        const authHeader = req.headers['authorization'];
        
        // Cek apakah ada header
        if (!authHeader) {
            return res.status(401).json({ error: 'Akses ditolak. Token tidak ada.' });
        }

        // Format harus "Bearer <token>"
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Format token salah.' });
        }

        // Verifikasi Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia123');
        
        // Simpan data user ke request agar bisa dipakai di route berikutnya
        req.user = decoded; 
        
        next(); // Lanjut ke controller berikutnya

    } catch (error) {
        return res.status(403).json({ error: 'Token tidak valid atau kadaluarsa.' });
    }
};