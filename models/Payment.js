const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    payment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    method: { type: DataTypes.ENUM('QRIS', 'OTHER'), defaultValue: 'QRIS' },
    status: { type: DataTypes.ENUM('Pending', 'Berhasil', 'Gagal'), defaultValue: 'Pending' },
    gateway_payment_ref: DataTypes.STRING(255),
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'payments', timestamps: false });

  return Payment;
};