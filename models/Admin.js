const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Admin = sequelize.define('Admin', {
    admin_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'admins', timestamps: false });

  Admin.beforeCreate(async (admin) => {
    admin.password_hash = await bcrypt.hash(admin.password_hash, 10);
  });

  Admin.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
  };

  return Admin;
};