const { Op, Sequelize } = require("sequelize");
const Emission = require("../models/Emisi");
const User = require("../models/User");
const Mission = require("../models/Mission");
const UserMission = require("../models/userMission");

const saveEmission = async (req, res) => {
  try {
    const { category, value } = req.body;
    const userId = req.user.id;

    // Validasi kategori
    if (!["Transportasi", "Listrik", "Makanan", "Lainnya"].includes(category)) {
      return res.status(400).json({ message: "Kategori tidak valid!" });
    }

    if (typeof value !== "number" || isNaN(value)) {
      return res.status(400).json({ message: "Value harus berupa angka!" });
    }

    // Ambil data emisi terakhir user sebelum input ini
    const lastEmission = await Emission.findOne({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });

    const lastEmissionValue = lastEmission ? lastEmission.value : 0; // Default to 0 if no previous data

    // Simpan data emisi baru
    const emission = await Emission.create({
      user_id: userId,
      category,
      value,
    });

    // Cek total emisi user hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Reset waktu menjadi tengah malam hari ini

    const totalEmissionToday = await Emission.sum("value", {
      where: {
        user_id: userId,
        created_at: { [Op.gte]: today },
      },
    });

    // Cari misi yang sesuai dengan total emisi hari ini
    const mission = await Mission.findOne({
      where: {
        target_kgco2: {
          [Op.lte]: totalEmissionToday, // Misi yang targetnya <= total emisi hari ini
        },
      },
      order: [["target_kgco2", "DESC"]], // Pilih misi dengan target yang lebih besar atau sama
    });

    let responseMessage = `Data emisi ${category.toLowerCase()} berhasil disimpan!`;
    let extraPoints = 0;

    // Bonus points jika emisi baru lebih kecil dari sebelumnya
    if (lastEmissionValue !== null && value < lastEmissionValue) {
      extraPoints = 10;
      await User.increment("point", { by: extraPoints, where: { id: userId } });
      responseMessage += ` Kamu juga dapat bonus ${extraPoints} point karena berhasil mengurangi emisi dibanding input sebelumnya! 🔥`;
    }

    // Pastikan kita mencari misi yang sesuai jika emisi hari ini belum mencapai target apapun
    let nextMission;
    if (!mission) {
      // Jika tidak ada misi yang tercapai, kita cari misi pertama yang belum tercapai
      nextMission = await Mission.findOne({
        order: [["target_kgco2", "ASC"]] // Pilih misi dengan target terkecil terlebih dahulu
      });
      if (nextMission) {
        responseMessage += ` Mulai dengan misi "${nextMission.name}", target emisi ${nextMission.target_kgco2} kgCO2.`;
      }
    } else {
      const remainingEmission = mission.target_kgco2 - totalEmissionToday;

      if (remainingEmission > 0) {
        // Jika misi belum selesai, tampilkan sisa emisi yang dibutuhkan
        responseMessage += ` Kamu butuh ${remainingEmission} kgCO2 lagi buat nyelesain daily mission "${mission.name}".`;
      } else {
        // Jika misi sudah selesai, cari misi berikutnya yang belum tercapai
        nextMission = await Mission.findOne({
          where: {
            target_kgco2: {
              [Op.gt]: totalEmissionToday, // Ambil misi dengan target lebih besar
            },
          },
          order: [["target_kgco2", "ASC"]], // Pilih misi dengan target yang lebih besar
        });

        if (nextMission) {
          responseMessage = `Data emisi berhasil disimpan! Kamu menyelesaikan daily mission "${mission.name}" dan naik ke misi "${nextMission.name}"!`;
        } else {
          responseMessage = `Data emisi berhasil disimpan! Kamu sudah menyelesaikan semua misi!`;
        }
      }
    }

    // Return Response dengan total emisi hari ini dan remaining emission untuk misi yang belum tercapai
    res.status(201).json({
      message: responseMessage,
      emission,
      total_emission_today: totalEmissionToday,  // Tambahkan total emisi hari ini ke dalam response
      mission: nextMission
        ? {
            name: nextMission.name,
            target_kgco2: nextMission.target_kgco2,
            remaining_kgco2: Math.max(nextMission.target_kgco2 - totalEmissionToday, 0), // Menghitung sisa emisi
          }
        : null,
      extra_points: extraPoints > 0 ? extraPoints : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};









// 🔹 Ambil Data Emisi User Tertentu (User hanya bisa lihat datanya sendiri)
const getUserEmissions = async (req, res) => {
  try {
    let emissions;

    if (req.user.role === "admin") {
      // 🔥 Admin bisa lihat semua data
      emissions = await Emission.findAll({
        order: [["created_at", "DESC"]],
      });
    } else {
      // 🔥 User biasa cuma bisa lihat data sendiri
      emissions = await Emission.findAll({
        where: { user_id: req.user.id },
        order: [["created_at", "DESC"]],
      });
    }

    res.status(200).json(emissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Hapus Data Emisi (Admin Only)
const deleteEmission = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah data ada
    const emission = await Emission.findOne({ where: { id } });
    if (!emission) {
      return res.status(404).json({ message: "Data tidak ditemukan!" });
    }

    await Emission.destroy({ where: { id } });
    res.status(200).json({ message: "Data emisi berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  saveEmission,
  getUserEmissions,
  deleteEmission,
};
