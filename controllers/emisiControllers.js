const { Op, Sequelize } = require("sequelize");
const Emission = require("../models/Emisi");
const User = require("../models/User");

// 🔹 Simpan Data Emisi
const saveEmission = async (req, res) => {
  try {
    const { category, value } = req.body;
    const userId = req.user.id; // Ambil user ID dari token

    // Validasi input kategori
    if (!["Transportasi", "Listrik", "Makanan", "Lainnya"].includes(category)) {
      return res.status(400).json({ message: "Kategori tidak valid!" });
    }

    if (typeof value !== "number" || isNaN(value)) {
      return res.status(400).json({ message: "Value harus berupa angka!" });
    }

    // 🔹 Ambil data terakhir yang diinput user
    const lastEmission = await Emission.findOne({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      attributes: ["value"],
      raw: true,
    });

    // Konversi hasil query ke angka, kalau null anggap 0
    const lastEmissionValue = lastEmission?.value ? parseFloat(lastEmission.value) : 0;

    // 🔹 Simpan data baru
    const emission = await Emission.create({
      user_id: userId,
      category,
      value,
    });

    // 🔹 Kalau input lebih kecil dari data terakhir, user dapat 10 point
    if (value < lastEmissionValue) {
      await User.update(
        { point: Sequelize.literal("point + 10") },
        { where: { id: userId } }
      );
    }

    res.status(201).json({
      message: `Data emisi ${category.toLowerCase()} berhasil disimpan!`,
      emission,
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
