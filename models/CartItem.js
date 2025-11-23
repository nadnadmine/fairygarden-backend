const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CartItem = sequelize.define('CartItem', {
    cart_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cart_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    delivery_option: { type: DataTypes.ENUM('Delivery', 'PickUp'), defaultValue: 'Delivery' },
    delivery_date: DataTypes.DATE,
    delivery_time: DataTypes.STRING(50),
    message_card_from: DataTypes.STRING(150),
    message_card_to: DataTypes.STRING(150),
    message_card_text: DataTypes.TEXT,
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'cart_items', timestamps: false });

  return CartItem;
};