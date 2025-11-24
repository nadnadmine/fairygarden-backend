module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define('CartItem', {
    cart_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
    // SUDAH DIHAPUS: delivery_option, delivery_date, message_card
    // Karena data ini sekarang hanya diminta saat CHECKOUT (per pesanan), bukan per item.
  }, {
    tableName: 'cart_items',
    timestamps: true,
    underscored: true
  });

  CartItem.associate = function(models) {
    CartItem.belongsTo(models.Cart, { foreignKey: 'cart_id' });
    CartItem.belongsTo(models.Product, { foreignKey: 'product_id' });
  };

  return CartItem;
};