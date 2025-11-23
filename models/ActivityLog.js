const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    log_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    admin_id: DataTypes.INTEGER,
    action: { type: DataTypes.STRING(255), allowNull: false },
    detail: DataTypes.TEXT,
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'activity_logs', timestamps: false });

  return ActivityLog;
};