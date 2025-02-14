const express = require("express");
const { getLeaderboard } = require("../controllers/leaderboardControllers");

const router = express.Router();

// 🔹 Route untuk ambil leaderboard (10 user dengan point terbanyak)
router.get("/leaderboard", getLeaderboard);

module.exports = router;
