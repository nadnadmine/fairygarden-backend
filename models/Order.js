const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    order_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: DataTypes.INTEGER,
    address_id: DataTypes.INTEGER,
    total_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    delivery_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    handling_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    status: { type: DataTypes.ENUM('DIPROSES', 'DIKIRIM', 'SELESAI', 'DIBATALKAN'), defaultValue: 'DIPROSES' },
    payment_status: { type: DataTypes.ENUM('Pending', 'Berhasil', 'Gagal'), defaultValue: 'Pending' },
    payment_method: DataTypes.ENUM('QRIS', 'OTHER'),
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'orders', timestamps: false });

  return Order;
};