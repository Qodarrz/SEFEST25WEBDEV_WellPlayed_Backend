const User = require("../models/User");

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.findAll({
      attributes: ["id", "name", "point"],
      order: [["point", "DESC"]], // Urutin dari point terbesar ke terkecil
      limit: 10, // Ambil 10 user teratas
    });

    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard };
