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
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, role: role || "user" });

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
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({ message: "Login berhasil", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get All Users
 */
const getAllUsers = async (req, res) => {
  try {
    let users = await User.findAll();
    if (req.user.role !== "admin") {
      users = users.map(({ name, email }) => ({ name, email }));
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get User by ID
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    if (req.user.role !== "admin" && req.user.id !== user.id) {
      return res.json({ name: user.name, email: user.email });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Update User
 */
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    if (req.user.role !== "admin" && req.user.id !== user.id) {
      return res.status(403).json({ message: "Akses ditolak!" });
    }

    if (req.body.password) req.body.password = await bcrypt.hash(req.body.password, 10);
    await user.update(req.body);
    res.json({ message: "User berhasil diperbarui", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Delete User
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    if (req.user.role !== "admin" && req.user.id !== user.id) {
      return res.status(403).json({ message: "Akses ditolak!" });
    }

    await user.destroy();
    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔥 Export semua function
module.exports = { registerUser, loginUser, getAllUsers, getUserById, updateUser, deleteUser };