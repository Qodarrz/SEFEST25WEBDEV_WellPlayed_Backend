const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Community = require("./Community");

class Comment extends Model {}

Comment.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      onDelete: "CASCADE",
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Community, key: "id" },
      onDelete: "CASCADE",
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Bisa null kalau komentar utama
      references: { model: Comment, key: "id" }, // ✅ Perbaiki Foreign Key Reference
      onDelete: "CASCADE",
    },
    comment: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    modelName: "Comment",
    tableName: "comments", // ✅ Pakai plural agar konsisten
    timestamps: false, // ✅ Sequelize akan buat createdAt & updatedAt otomatis
  }
);

module.exports = Comment;
