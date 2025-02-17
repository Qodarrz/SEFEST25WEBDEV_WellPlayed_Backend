const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Mission = require("./Mission");

const UserMission = sequelize.define(
  "UserMission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    mission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Mission,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    date_taken: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending", // pending, completed, dll.
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "user_missions",
    timestamps: false,
  }
);

module.exports = UserMission;
