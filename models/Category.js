const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    category_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: DataTypes.TEXT
  }, { tableName: 'categories', timestamps: false });

  return Category;
};