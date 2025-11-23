module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    order_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // INI KOLOM BARU YANG SERING BIKIN ERROR KALAU LUPA DITULIS:
    product_name_snapshot: { 
      type: DataTypes.STRING(200) 
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    }
  }, {
    tableName: 'order_items',
    timestamps: true,
    underscored: true
  });

  OrderItem.associate = function(models) {
    OrderItem.belongsTo(models.Order, { foreignKey: 'order_id' });
    OrderItem.belongsTo(models.Product, { foreignKey: 'product_id' });
  };

  return OrderItem;
};