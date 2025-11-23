const { Admin, sequelize } = require('./models');

const createAdmin = async () => {
    try {
        // 1. Hubungkan ke Database
        await sequelize.authenticate();
        
        // 2. Buat Admin Baru
        // Karena kita pakai Sequelize Model, Hooks 'beforeCreate' akan otomatis
        // mengubah password "admin123" menjadi hash terenkripsi yang aman.
        const newAdmin = await Admin.create({
            name: "Super Admin",
            email: "admin@fairygarden.com",
            password_hash: "admin123" 
        });

        console.log("✅ Admin berhasil dibuat!");
        console.log("Email:", newAdmin.email);
        console.log("Pass:", "admin123");

    } catch (error) {
        console.error("❌ Gagal membuat admin:", error.message);
    } finally {
        // Tutup koneksi
        await sequelize.close();
    }
};

createAdmin();