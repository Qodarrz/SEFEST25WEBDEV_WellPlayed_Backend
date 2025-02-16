const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Mission = sequelize.define(
  "Mission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    target_kgco2: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "missions",  // This links the model to your "missions" table in the database.
    timestamps: false,      // You don't want Sequelize to add 'createdAt' and 'updatedAt' by default.
  }
);

module.exports = Mission;
