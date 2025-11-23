const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os'); // Import OS untuk mendeteksi folder temp sistem

// Tentukan apakah kita sedang di Production (Vercel) atau Development (Laptop)
const isProduction = process.env.NODE_ENV === 'production';

// Tentukan lokasi penyimpanan:
// - Jika di Vercel: Gunakan os.tmpdir() (Folder /tmp yang diizinkan ditulis)
// - Jika di Laptop: Gunakan folder 'uploads' di dalam project
const uploadDir = isProduction ? os.tmpdir() : path.join(__dirname, '../uploads');

// Buat folder 'uploads' hanya jika di Laptop dan belum ada
// (Di Vercel /tmp sudah pasti ada, jadi tidak perlu mkdir)
if (!isProduction && !fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Gunakan variabel uploadDir yang sudah kita tentukan di atas
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        // Buat nama file unik: fieldname-timestamp-angkaacak.extensi
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit ukuran file 5MB (Opsional, biar aman)
});

module.exports = upload;