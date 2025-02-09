const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("express", "root", "", {
  host: "127.0.0.1",
  dialect: "mysql",
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected!");
  } catch (error) {
    console.error("❌ Unable to connect to database:", error);
  }
}

testConnection();

module.exports = sequelize;
