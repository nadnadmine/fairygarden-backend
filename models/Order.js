module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    order_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // --- DATA PENERIMA ---
    recipient_name: { type: DataTypes.STRING, allowNull: false },
    recipient_phone: { type: DataTypes.STRING, allowNull: false },
    sender_phone: { type: DataTypes.STRING }, // Opsional (No HP Pengirim)
    
    // --- DATA ALAMAT (Langsung di Order, tidak pakai tabel terpisah) ---
    address_line: { type: DataTypes.TEXT, allowNull: false },
    province: { type: DataTypes.STRING },
    postal_code: { type: DataTypes.STRING },
    
    // --- DATA PENGIRIMAN ---
    delivery_type: { type: DataTypes.STRING, defaultValue: 'Delivery' }, // Delivery / Pick Up
    delivery_date: { type: DataTypes.DATEONLY }, // YYYY-MM-DD
    delivery_time: { type: DataTypes.STRING },   // 09:00 - 12:00
    
    // --- PESAN ---
    message_card: { type: DataTypes.TEXT },
    
    // --- KEUANGAN ---
    total_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    delivery_fee: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    handling_fee: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    
    // --- STATUS ---
    status: { type: DataTypes.STRING, defaultValue: 'DIPROSES' },
    payment_status: { type: DataTypes.STRING, defaultValue: 'Pending' },
    payment_method: { type: DataTypes.STRING, defaultValue: 'QRIS' },
    proof_of_payment: { type: DataTypes.TEXT } // URL Gambar
  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: true
  });

  Order.associate = function(models) {
    Order.belongsTo(models.User, { foreignKey: 'user_id' });
    Order.hasMany(models.OrderItem, { foreignKey: 'order_id' });
  };

  return Order;
};