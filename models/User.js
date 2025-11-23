const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    last_name: DataTypes.STRING(100),
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    phone: DataTypes.STRING(30),
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'users', timestamps: false });

  User.beforeCreate(async (user) => {
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
  });

  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
  };

  return User;
};