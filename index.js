require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/database");
const userRoutes = require("./routes/users"); 
const communityRoutes = require("./routes/community");
const commentRoutes = require("./routes/comment");
const emisiRoutes = require("./routes/emisi");



const app = express();


app.use(cors()); // Enable CORS buat frontend
app.use(express.json()); // Middleware buat parsing JSON
app.use("/api", userRoutes);
app.use("/api", communityRoutes);
app.use("/api", commentRoutes);
app.use("/api", emisiRoutes);
 // Semua API diawali `/api`

const PORT = process.env.PORT || 4500;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
