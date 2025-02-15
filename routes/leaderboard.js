const express = require("express");
const { getLeaderboard } = require("../controllers/leaderboardControllers");

const router = express.Router();

// 🔹 GET Leaderboard
// Ambil daftar 10 user dengan poin terbanyak
// Bisa diakses tanpa login (umumnya leaderboard itu publik)
router.get("/leaderboard", getLeaderboard);

module.exports = router;
