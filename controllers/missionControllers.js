const Mission = require("../models/Mission");

const getMissions = async (req, res) => {
  try {
    const missions = await Mission.findAll({
      order: [["id", "ASC"]], // Urutin berdasarkan ID
    });

    res.status(200).json({
      message: "Daftar misi berhasil diambil!",
      missions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMissions };
