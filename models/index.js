const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// ====================================================
// SETUP KONEKSI DATABASE (FIX VERCEL + NEON)
// ====================================================
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  // PENTING: Baris ini wajib untuk Vercel agar driver pg terbaca
  dialectModule: require('pg'), 
  dialectOptions: {
    ssl: {
      require: true, // Wajib untuk Neon
      rejectUnauthorized: false // Mencegah error sertifikat
    }
  }
});

// ====================================================
// IMPORT MODEL
// ====================================================
// Kita memanggil file per file, BUKAN memanggil './models'
const User = require('./User')(sequelize);
const Admin = require('./Admin')(sequelize);
const Address = require('./Address')(sequelize);
const Category = require('./Category')(sequelize);
const Product = require('./Product')(sequelize);
const Cart = require('./Cart')(sequelize);
const CartItem = require('./CartItem')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);
const Payment = require('./Payment')(sequelize);
const ProductImage = require('./ProductImage')(sequelize);
const ActivityLog = require('./ActivityLog')(sequelize);
const OrderStatusHistory = require('./OrderStatusHistory')(sequelize);

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
Address.hasMany(Order, { foreignKey: 'address_id' });
Order.belongsTo(Address, { foreignKey: 'address_id' });

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

// Export semua model dan instance sequelize
module.exports = { 
  sequelize, 
  User, 
  Admin, 
  Address, 
  Category, 
  Product, 
  Cart, 
  CartItem, 
  Order, 
  OrderItem, 
  Payment, 
  ProductImage, 
  ActivityLog, 
  OrderStatusHistory 
};