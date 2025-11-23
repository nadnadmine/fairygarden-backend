const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
    history_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    prev_status: DataTypes.ENUM('DIPROSES', 'DIKIRIM', 'SELESAI', 'DIBATALKAN'),
    new_status: DataTypes.ENUM('DIPROSES', 'DIKIRIM', 'SELESAI', 'DIBATALKAN'),
    changed_by_admin: DataTypes.INTEGER,
    note: DataTypes.TEXT,
    changed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'order_status_history', timestamps: false });

  return OrderStatusHistory;
};