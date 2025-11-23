const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    product_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    category_id: DataTypes.INTEGER,
    product_name: { type: DataTypes.STRING(200), allowNull: false },
    description: DataTypes.TEXT,
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    sold: { type: DataTypes.INTEGER, defaultValue: 0 },
    image_url: DataTypes.TEXT,
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'products', timestamps: false });

  return Product;
};