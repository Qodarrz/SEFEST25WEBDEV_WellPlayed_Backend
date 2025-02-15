const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Community = require("./Community");
const User = require("./User");

const CommunityLike = sequelize.define(
  "CommunityLike",  // Ubah nama model jadi CommunityLike
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    post_id: {  // Ganti post_id menjadi community_id
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Community,
        key: "id",  // Referensikan ke Community, bukan Post
      },
      // Menambah index untuk community_id agar query lebih cepat
      index: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      // Menambah index untuk user_id agar query lebih cepat
      index: true,
    },
  },
  {
    timestamps: false,  // Tidak ada updated_at karena hanya menyimpan waktu like
    tableName: "post_likes",  // Ubah nama tabel menjadi community_likes
  }
);

module.exports = CommunityLike;
