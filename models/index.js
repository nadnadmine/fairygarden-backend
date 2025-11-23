const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// ====================================================
// SETUP KONEKSI DATABASE (FIX LOCALHOST vs VERCEL)
// ====================================================

// Cek apakah kita sedang di mode Production (Vercel)
const isProduction = process.env.NODE_ENV === 'production';

const sequelizeConfig = {
  dialect: 'postgres',
  logging: false,
  dialectModule: require('pg'), // Wajib buat Vercel
};

// HANYA Tambahkan SSL jika sedang di Production (Vercel/Neon)
if (isProduction) {
  sequelizeConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

const sequelize = new Sequelize(process.env.DATABASE_URL, sequelizeConfig);

// ====================================================
// IMPORT MODEL (FIX: Tambah Sequelize.DataTypes)
// ====================================================
// Kita harus passing 'Sequelize.DataTypes' agar model bisa baca INTEGER, STRING, dll.

const User = require('./User')(sequelize, Sequelize.DataTypes);
const Admin = require('./Admin')(sequelize, Sequelize.DataTypes);
const Address = require('./Address')(sequelize, Sequelize.DataTypes);
const Category = require('./Category')(sequelize, Sequelize.DataTypes);
const Product = require('./Product')(sequelize, Sequelize.DataTypes);
const Cart = require('./Cart')(sequelize, Sequelize.DataTypes);
const CartItem = require('./CartItem')(sequelize, Sequelize.DataTypes);
const Order = require('./Order')(sequelize, Sequelize.DataTypes);
const OrderItem = require('./OrderItem')(sequelize, Sequelize.DataTypes);
const Payment = require('./Payment')(sequelize, Sequelize.DataTypes);
const ProductImage = require('./ProductImage')(sequelize, Sequelize.DataTypes);
const ActivityLog = require('./ActivityLog')(sequelize, Sequelize.DataTypes);
const OrderStatusHistory = require('./OrderStatusHistory')(sequelize, Sequelize.DataTypes);

// ====================================================
// DEFINISI RELASI (ASSOCIATIONS)
// ====================================================

// 1. User & Address
User.hasMany(Address, { foreignKey: 'user_id' });
Address.belongsTo(User, { foreignKey: 'user_id' });

// 2. User & Cart
User.hasOne(Cart, { foreignKey: 'user_id' });
Cart.belongsTo(User, { foreignKey: 'user_id' });

// 3. Category & Product
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

// 4. Cart & Items & Product
Cart.hasMany(CartItem, { foreignKey: 'cart_id' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });
Product.hasMany(CartItem, { foreignKey: 'product_id' }); 
CartItem.belongsTo(Product, { foreignKey: 'product_id' });

// 5. User & Order
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

// 6. Order & Address
// (Kita disable dulu relasi Address-Order karena di sistem baru alamat nempel di Order)
// Address.hasMany(Order, { foreignKey: 'address_id' });
// Order.belongsTo(Address, { foreignKey: 'address_id' });

// 7. Order & Items & Product
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

// 8. Order & Payment
Order.hasOne(Payment, { foreignKey: 'order_id' });
Payment.belongsTo(Order, { foreignKey: 'order_id' });

// 9. Product & Images
Product.hasMany(ProductImage, { foreignKey: 'product_id' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

// 10. Admin & Activity Log
Admin.hasMany(ActivityLog, { foreignKey: 'admin_id' });
ActivityLog.belongsTo(Admin, { foreignKey: 'admin_id' });

// 11. Order History
Order.hasMany(OrderStatusHistory, { foreignKey: 'order_id' });
OrderStatusHistory.belongsTo(Order, { foreignKey: 'order_id' });
Admin.hasMany(OrderStatusHistory, { foreignKey: 'changed_by_admin' });
OrderStatusHistory.belongsTo(Admin, { foreignKey: 'changed_by_admin' });

// Export
module.exports = { 
  sequelize, 
  User, Admin, Address, Category, Product, Cart, CartItem, 
  Order, OrderItem, Payment, ProductImage, ActivityLog, OrderStatusHistory 
};