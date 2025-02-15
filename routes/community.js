const express = require("express");
const router = express.Router();
const CommunityController = require("../controllers/communityControllers");
const { authenticateToken } = require("../middleware/auth"); // Middleware buat cek user login

// ✅ Semua route di bawah ini butuh login dulu pakai `authenticateToken`

// 📝 GET semua post di komunitas
// Endpoint ini buat ambil semua post yang ada di komunitas
router.get("/community", authenticateToken, CommunityController.getAllPosts);

// 📝 POST buat bikin post baru di komunitas
// User yang login bisa bikin post baru
router.post("/community", authenticateToken, CommunityController.createPost);

// 📝 PUT buat update/edit post berdasarkan `id`
// Hanya pemilik post yang bisa edit
router.put("/community/:id", authenticateToken, CommunityController.updatePost);

// ❌ DELETE buat hapus post berdasarkan `id`
// Hanya pemilik post atau admin yang bisa hapus post ini
router.delete("/community/:id", authenticateToken, CommunityController.deletePost);

module.exports = router;
