module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    product_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    image_url: {
      type: DataTypes.TEXT
    },
    sold: { // Kolom tambahan yang tadi kita buat di SQL
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
    // HAPUS 'is_active' JIKA ADA DI SINI, KARENA DI DB TIDAK ADA
  }, {
    tableName: 'products',
    timestamps: true, // created_at
    underscored: true
  });

  Product.associate = function(models) {
    Product.belongsTo(models.Category, { foreignKey: 'category_id' });
    Product.hasMany(models.CartItem, { foreignKey: 'product_id' });
    Product.hasMany(models.OrderItem, { foreignKey: 'product_id' });
    // Product.hasMany(models.ProductImage, { foreignKey: 'product_id' }); // Disable jika tidak dipakai
  };

  return Product;
};