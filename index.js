require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); // ✅ Tambahin ini!
const db = require("./config/database");
const userRoutes = require("./routes/users"); 
const communityRoutes = require("./routes/community");
const emisiRoutes = require("./routes/emisi");
const leaderboardRoutes = require("./routes/leaderboard");


const app = express();

app.use(cors()); // Enable CORS buat frontend
app.use(express.json()); // Middleware buat parsing JSON

// ✅ Set folder "public/image" biar bisa diakses langsung
app.use("/image", express.static(path.join(__dirname, "public/image")));

// Semua API diawali `/api`
app.use("/api", userRoutes);
app.use("/api", communityRoutes);
app.use("/api", emisiRoutes);
app.use("/api", leaderboardRoutes);

const PORT = process.env.PORT || 4500;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
