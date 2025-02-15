const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const userController = require("../controllers/userControllers");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

// ✅ Register User
// User baru bisa daftar dengan name, email, dan password
// Validasi:
// - Name tidak boleh kosong
// - Email harus format valid
// - Password minimal 6 karakter
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Nama harus diisi"),
    body("email").isEmail().withMessage("Email tidak valid"),
    body("password").isLength({ min: 6 }).withMessage("Password minimal 6 karakter"),
  ],
  userController.registerUser
);

// ✅ Login User
// User bisa login pakai email & password
// Validasi:
// - Email harus format valid
// - Password tidak boleh kosong
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email tidak valid"),
    body("password").notEmpty().withMessage("Password harus diisi"),
  ],
  userController.loginUser
);

// ✅ Get User Profile
// Hanya user yang login bisa akses profilnya sendiri
router.get("/profile", authenticateToken, userController.getUserProfile);

// ✅ Get All Users (Hanya Admin)
// Admin bisa melihat daftar semua user
router.get("/users", authenticateToken, authorizeRole("admin"), userController.getAllUsers);

// ✅ Update User Profile
// User hanya bisa mengupdate profil dirinya sendiri
// Admin bisa update siapa aja
router.put("/profile", authenticateToken, userController.updateUser);

// ✅ Delete User
// - User bisa menghapus akunnya sendiri
// - Admin bisa menghapus user lain
router.delete("/users", authenticateToken, userController.deleteUser);

module.exports = router;
