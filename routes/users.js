// routes/users.js
const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const userController = require("../controllers/userControllers");
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const upload = require("../middleware/multer"); // Import multer here

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

// ✅ Get User Profile
router.get("/profile", authenticateToken, userController.getUserProfile);

// ✅ Get All Users (Hanya Admin)
router.get("/users", authenticateToken, authorizeRole("admin"), userController.getAllUsers);

// ✅ Update User Profile
router.put(
  "/profile",
  authenticateToken, // Middleware to check token
  upload.fields([{ name: "profile_picture", maxCount: 1 }])
, // Multer to handle file upload
  userController.updateUser // Your controller function to update user data
);

// ✅ Delete User
router.delete("/users", authenticateToken, userController.deleteUser);

module.exports = router;
