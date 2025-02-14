const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const userController = require("../controllers/userControllers");
const { authenticateToken, authorizeRole, authorizeSelf } = require("../middleware/auth");

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

// ✅ Get User by ID (Admin bisa lihat siapa aja, user hanya bisa lihat dirinya sendiri)
router.get("/users/:id", authenticateToken, authorizeSelf, userController.getUserById);

// ✅ Update User (Admin bisa update siapa aja, user hanya bisa update dirinya sendiri)
router.put("/users/:id", authenticateToken, authorizeSelf, userController.updateUser);

// ✅ Delete User (User bisa hapus akunnya sendiri, admin bisa hapus siapa saja)
router.delete("/users/:id", authenticateToken, authorizeSelf, userController.deleteUser);

module.exports = router;
