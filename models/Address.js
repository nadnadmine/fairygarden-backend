const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Address = sequelize.define('Address', {
    address_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    recipient_name: DataTypes.STRING(150),
    recipient_phone: DataTypes.STRING(30),
    address_line: { type: DataTypes.TEXT, allowNull: false },
    province: DataTypes.STRING(100),
    postal_code: DataTypes.STRING(20),
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'addresses', timestamps: false });

  return Address;
};