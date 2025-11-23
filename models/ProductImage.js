const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductImage = sequelize.define('ProductImage', {
    image_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    url: { type: DataTypes.TEXT, allowNull: false },
    alt_text: DataTypes.STRING(255),
    is_primary: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, { tableName: 'product_images', timestamps: false });

  return ProductImage;
};