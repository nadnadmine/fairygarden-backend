// sync.js
const { sequelize } = require('./models');

const syncDatabase = async () => {
    try {
        // force: true akan MENGHAPUS tabel lama dan membuat baru (hati-hati data hilang)
        // alter: true akan mengubah struktur tabel tanpa menghapus data (lebih aman)
        await sequelize.sync({ alter: true }); 
        console.log('✅ Database & Tables synced successfully!');
    } catch (error) {
        console.error('❌ Error syncing database:', error);
    } finally {
        await sequelize.close();
    }
};

syncDatabase();