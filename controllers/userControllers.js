const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Achievement = require("../models/Achievement");
const upload = require("../middleware/multer");
require("dotenv").config();

/**
 * ✅ Register User
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email sudah terdaftar" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role && role === "admin" ? "admin" : "user",
      profile_picture: "/image/default.png",
      // created_at akan otomatis terisi oleh defaultValue (DataTypes.NOW)
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
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login berhasil", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get All Users (Admin Only)
 */
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak!" });
    }

    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "point", "profile_picture"],
      include: {
        model: Achievement,
        as: "achievements",
        attributes: ["name", "description", "createdAt"],
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get User by ID (Admin Only)
 */
const getUserById = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak!" });
    }

    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "role", "point", "profile_picture"],
      include: {
        model: Achievement,
        as: "achievements",
        attributes: ["name", "description", "createdAt"],
      },
    });

    if (!user)
      return res.status(404).json({ message: "User tidak ditemukan" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get User Profile (User yang sedang login)
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "point",
        "profile_picture",
        "created_at", // Gunakan nama field sesuai model
      ],
      include: {
        model: Achievement,
        as: "achievements",
        attributes: ["name", "description"],
      },
    });

    if (!user)
      return res.status(404).json({ message: "User tidak ditemukan" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Update User (Bisa update foto profil)
 */
const updateUser = async (req, res) => {
  try {
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    const user = await User.findByPk(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User tidak ditemukan" });

    const updateData = { ...req.body };
    delete updateData.role; // Cegah update role oleh user

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Jika ada file profile_picture yang dikirim
    if (req.files && req.files["profile_picture"]) {
      updateData.profile_picture = `/image/${req.files["profile_picture"][0].filename}`;
    }

    await user.update(updateData);
    res.json({ message: "User berhasil diperbarui", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Delete User (Hanya bisa hapus diri sendiri / oleh Admin)
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User tidak ditemukan" });

    await user.destroy();
    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  getUserProfile,
  updateUser,
  deleteUser,
};
