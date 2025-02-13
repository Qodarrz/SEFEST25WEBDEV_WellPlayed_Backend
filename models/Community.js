const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

class Community extends Model {}

Community.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      onDelete: "CASCADE",
    },
    topic: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    modelName: "Community",
    tableName: "post", // ✅ Sesuaikan dengan nama tabel di DB
    timestamps: false, // Kalau DB support timestamps, bisa ubah ke true
  }
);

module.exports = Community;
