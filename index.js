require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/database");
const routes = require("./routes/users");

const app = express();


app.use(cors()); // Enable CORS buat frontend
app.use(express.json()); // Middleware buat parsing JSON
app.use("/api", routes); // Semua API diawali `/api`

const PORT = process.env.PORT || 4500;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
