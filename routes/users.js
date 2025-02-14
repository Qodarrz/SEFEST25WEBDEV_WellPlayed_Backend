const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const userController = require("../controllers/userControllers");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

// ✅ Register User
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
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email tidak valid"),
    body("password").notEmpty().withMessage("Password harus diisi"),
  ],
  userController.loginUser
);

// ✅ Get User Profile (User yang login)
router.get("/profile", authenticateToken, userController.getUserProfile);

// ✅ Get All Users (Hanya Admin)
router.get("/users", authenticateToken, authorizeRole("admin"), userController.getAllUsers);

// ✅ Update User (User hanya bisa update dirinya sendiri, admin bisa update siapa aja)
router.put("/profile", authenticateToken, userController.updateUser);

// ✅ Delete User (User hanya bisa hapus akun sendiri, admin bisa hapus siapa aja)
router.delete("/users", authenticateToken, userController.deleteUser);

module.exports = router;
