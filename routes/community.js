const express = require("express");
const router = express.Router();
const CommunityController = require("../controllers/communityControllers");
const { authenticateToken } = require("../middleware/auth");

// ✅ Semua route harus login dulu
router.get("/community", authenticateToken, CommunityController.getAllPosts); // Lihat semua post
router.post("/community", authenticateToken, CommunityController.createPost); // Buat post
router.put("/community/:id", authenticateToken, CommunityController.updatePost); // Edit post

// ✅ Hanya admin atau pemilik post yang bisa hapus
router.delete("/community/:id", authenticateToken, CommunityController.deletePost);

module.exports = router;
