const express = require('express');
const router = express.Router();

// FITUR PAYMENT TERPISAH SUDAH DIHAPUS (Sesuai Desain PDF Baru)
// Status pembayaran & bukti transfer sekarang ada di tabel 'Orders'.

router.get('/', (req, res) => {
    res.json([]); 
});

module.exports = router;