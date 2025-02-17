const { Op } = require("sequelize");
const Emission = require("../models/Emisi");
const User = require("../models/User");
const Mission = require("../models/Mission");
const UserMission = require("../models/UserMission");
const Achievement = require("../models/Achievement"); // Tambahin ini!

const saveEmission = async (req, res) => {
  try {
    const { category, value } = req.body;
    const userId = req.user.id;

    // Validasi kategori
    const validCategories = ["Transportasi", "Listrik", "Makanan", "Lainnya"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Kategori tidak valid!" });
    }
    if (typeof value !== "number" || isNaN(value) || value <= 0) {
      return res
        .status(400)
        .json({ message: "Value harus berupa angka positif!" });
    }

    // Ambil data emisi terakhir user (untuk bonus poin)
    const lastEmission = await Emission.findOne({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });
    const lastEmissionValue = lastEmission ? lastEmission.value : null;

    // Simpan data emisi baru
    const emission = await Emission.create({
      user_id: userId,
      category,
      value,
    });

    // Hitung total emisi user hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let totalEmissionToday = await Emission.sum("value", {
      where: {
        user_id: userId,
        created_at: { [Op.gte]: today },
      },
    });
    if (!totalEmissionToday) totalEmissionToday = 0;

    // Cek apakah user memiliki misi aktif (status pending)
    const activeUserMission = await UserMission.findOne({
      where: { user_id: userId, status: "pending" },
    });

    let missionStatusMessage = "";
    if (activeUserMission) {
      const missionDetails = await Mission.findByPk(
        activeUserMission.mission_id
      );
      if (missionDetails) {
        // Jika target tercapai, update misi jadi "completed"
        if (totalEmissionToday <= missionDetails.target_kgco2) {
          await activeUserMission.update({
            status: "completed",
            completed_at: new Date(),
          });
          await User.increment("point", {
            by: missionDetails.points,
            where: { id: userId },
          });

          missionStatusMessage = `🎉 Selamat! Kamu telah menyelesaikan misi "${missionDetails.name}" dan mendapatkan ${missionDetails.points} poin!`;
        } else {
          const excessEmission =
            totalEmissionToday - missionDetails.target_kgco2;
          missionStatusMessage = `Kamu masih harus mengurangi ${excessEmission} kgCO2 untuk menyelesaikan misi "${missionDetails.name}".`;
        }
      }
    }

    let responseMessage = `✅ Data emisi ${category.toLowerCase()} berhasil disimpan!`;
    let extraPoints = 0;

    // Bonus points jika emisi lebih kecil dari sebelumnya
    if (lastEmissionValue !== null && value < lastEmissionValue) {
      extraPoints = 10;
      await User.increment("point", { by: extraPoints, where: { id: userId } });
      responseMessage += ` 🎉 Bonus ${extraPoints} poin karena berhasil mengurangi emisi dibanding input sebelumnya!`;
    }
    if (missionStatusMessage) {
      responseMessage += ` ${missionStatusMessage}`;
    }

    // Cek jumlah kategori unik yang sudah dimasukkan user
    const categoryCounts = await Emission.findAll({
      where: { user_id: userId },
      attributes: ["category"],
      group: ["category"],
    });

    // Achievement berdasarkan kategori
    const categoryAchievements = {
      Transportasi: {
        name: "Eco Traveler",
        description: "Berhasil mencatat emisi dari transportasi!",
      },
      Listrik: {
        name: "Power Saver",
        description: "Berhasil mencatat emisi dari penggunaan listrik!",
      },
      Makanan: {
        name: "Green Eater",
        description: "Berhasil mencatat emisi dari konsumsi makanan!",
      },
      Lainnya: {
        name: "Sustainability Hero",
        description: "Berhasil mencatat emisi dari aktivitas lainnya!",
      },
    };

    // Cek apakah user sudah pernah input di kategori ini sebelumnya
    // Cek apakah user sudah pernah input kategori INI sebelum hari ini
   // Hitung jumlah post dalam kategori ini
const categoryPostCount = await Emission.count({
  where: { user_id: userId, category },
});

// User baru dapat achievement kalau udah ada 5 post dalam kategori ini
if (categoryPostCount === 5) { // Saat post ke-5 baru dapet achievement
  const achievementExists = await Achievement.findOne({
    where: { user_id: userId, name: categoryAchievements[category].name },
  });

  if (!achievementExists) {
    await Achievement.create({
      user_id: userId,
      name: categoryAchievements[category].name,
      description: categoryAchievements[category].description,
    });

    responseMessage += ` 🏆 Selamat! Kamu mendapatkan achievement "${categoryAchievements[category].name}" karena sudah mencatat 5 kali di kategori ini!`;
  }
}


    res.status(201).json({
      message: responseMessage,
      emission,
      total_emission_today: totalEmissionToday,
      extra_points: extraPoints > 0 ? extraPoints : null,
    });
  } catch (error) {
    console.error("Error in saveEmission:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat menyimpan emisi. Coba lagi nanti!",
    });
  }
};

const getUserEmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition =
      req.user.role === "admin" ? {} : { user_id: req.user.id };

    const emissions = await Emission.findAndCountAll({
      where: whereCondition,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      totalRecords: emissions.count,
      totalPages: Math.ceil(emissions.count / limit),
      currentPage: parseInt(page),
      emissions: emissions.rows,
    });
  } catch (error) {
    console.error("Error in getUserEmissions:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data emisi. Coba lagi nanti!" });
  }
};

const deleteEmission = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Cek apakah data emisi ada
    const emission = await Emission.findOne({ where: { id } });
    if (!emission) {
      return res.status(404).json({ message: "❌ Data tidak ditemukan!" });
    }

    // Pastikan hanya pemilik atau admin yang bisa hapus
    if (userRole !== "admin" && emission.user_id !== userId) {
      return res.status(403).json({
        message: "🚫 Kamu tidak punya izin untuk menghapus data ini!",
      });
    }

    await Emission.destroy({ where: { id } });
    res.status(200).json({ message: "✅ Data emisi berhasil dihapus!" });
  } catch (error) {
    console.error("Error in deleteEmission:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat menghapus emisi. Coba lagi nanti!",
    });
  }
};

module.exports = {
  saveEmission,
  getUserEmissions,
  deleteEmission,
};
