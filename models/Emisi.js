const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Emission = sequelize.define(
  "Emission",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Bisa NULL sesuai tabel MySQL
    },
    category: {
      type: DataTypes.ENUM("Transportasi", "Listrik", "Makanan", "Lainnya"),
      allowNull: false,
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Sesuai tabel MySQL
    },
  },
  {
    timestamps: false, // Disable updated_at, karena di tabel cuma ada created_at
    tableName: "emisi", // Pakai nama tabel "emisi" sesuai MySQL
  }
);

module.exports = Emission;
