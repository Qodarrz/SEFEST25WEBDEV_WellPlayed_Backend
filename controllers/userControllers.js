const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/User");
require("dotenv").config();

/**
 * ✅ Register User
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Cek validasi input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Cek apakah email sudah digunakan
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user ke database
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user", // Default role sebagai "user"
    });

    res.status(201).json({ message: "Registrasi berhasil", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Login User & Generate Token
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Email atau password salah" });

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Email atau password salah" });

    // Generate token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ message: "Login berhasil", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get All Users (Hanya Admin)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get User by ID (Admin bisa lihat semua user, user hanya bisa lihat dirinya sendiri)
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    // Cek apakah user mencoba melihat akun orang lain (kecuali admin)
    if (req.user.role !== "admin" && req.user.id !== user.id) {
      return res.status(403).json({ message: "Akses ditolak! Anda hanya bisa melihat akun sendiri." });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Update User (User hanya bisa edit dirinya sendiri, admin bisa edit siapa saja)
 */
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    // Cek apakah user mencoba mengedit akun orang lain (kecuali admin)
    if (req.user.role !== "admin" && req.user.id !== user.id) {
      return res.status(403).json({ message: "Akses ditolak! Anda hanya bisa mengedit akun sendiri." });
    }

    // Hash password jika ada yang baru
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    await user.update(req.body);
    res.json({ message: "User berhasil diperbarui", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Delete User (Hanya Admin)
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    await user.destroy();
    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔥 Export semua function
module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
