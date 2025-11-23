const express = require('express');
const router = express.Router();

// FITUR ADDRESS SUDAH DIHAPUS (Sesuai Desain PDF Baru)
// Alamat sekarang disimpan langsung di tabel 'Orders' saat checkout.
// File ini disisakan agar server tidak crash.

router.get('/', (req, res) => {
    res.json([]); // Return array kosong
});

router.post('/', (req, res) => {
    res.json({ message: "Fitur ini tidak digunakan lagi." });
});

module.exports = router;