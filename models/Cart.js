const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cart = sequelize.define('Cart', {
    cart_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'carts', timestamps: false });

  return Cart;
};