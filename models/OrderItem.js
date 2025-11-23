const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    order_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: DataTypes.INTEGER,
    
    product_name_snapshot: DataTypes.STRING(200),
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    
    // PENTING: Pastikan namanya 'price' (bukan price_at_purchase)
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    
    delivery_option: DataTypes.ENUM('Delivery', 'PickUp'),
    delivery_date: DataTypes.DATEONLY, // Gunakan DATEONLY jika cuma tanggal
    delivery_time: DataTypes.STRING(50),
    message_card: DataTypes.TEXT
  }, { tableName: 'order_items', timestamps: false });
  
  return OrderItem;
};