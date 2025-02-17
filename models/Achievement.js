const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config/database");

class Achievement extends Model {}

Achievement.init(
  {
    id: {  // Menambahkan ID sebagai kolom primary key
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // Referensi ke tabel users
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    
  },
  {
    sequelize,
    modelName: "Achievement",
    tableName: "achievements",
    timestamps: false, // Jika tidak ada kolom `updatedAt` di DB
  }
);

module.exports = Achievement;
