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

// ✅ Get All Users (Hanya Admin)
router.get("/users", authenticateToken, userController.getAllUsers);

// ✅ Get User by ID (User hanya bisa lihat dirinya sendiri, admin bisa lihat siapa saja)
router.get("/users/:id", authenticateToken, authorizeSelf, userController.getUserById);

// ✅ Update User (User hanya bisa update dirinya sendiri, admin bisa update siapa saja)  
router.put("/users/:id", authenticateToken, authorizeSelf, userController.updateUser);

// ✅ Delete User (Hanya Admin)
router.delete("/users/:id", authenticateToken, userController.deleteUser);

module.exports = router;
