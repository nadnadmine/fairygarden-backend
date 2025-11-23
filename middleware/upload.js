const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import File System bawaan Node.js

// Cek apakah folder 'uploads' ada? Jika tidak, buat otomatis.
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Gunakan variabel uploadDir yang sudah pasti ada
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
module.exports = upload;