const express = require("express");
const router = express.Router();
const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentControllers");
const { authenticateToken } = require("../middleware/auth"); // Middleware buat ngecek user login

// ✅ GET Semua Komentar di Post tertentu
// Route ini buat ngambil semua komentar di satu post berdasarkan `postId`
// `authenticateToken` memastikan hanya user yang login yang bisa akses
router.get("/comment/:postId", authenticateToken, getComments);

// ✅ POST Buat Komentar Baru atau Reply
// Route ini buat bikin komentar baru di sebuah post
// Kalau ada `parent_id` di request body, berarti ini reply ke komentar lain
router.post("/comment/:postId", authenticateToken, createComment);

// ✅ PUT Edit Komentar (Hanya pemilik atau admin)
// Route ini buat edit komentar yang udah ada
// User cuma bisa edit komentarnya sendiri, kecuali kalau dia admin
router.put("/comment/:commentId", authenticateToken, updateComment);

// ✅ DELETE Hapus Komentar (Hanya pemilik atau admin)
// Route ini buat hapus komentar berdasarkan `commentId`
// Kalau komentar punya reply, reply-nya juga ikut dihapus
router.delete("/comment/:commentId", authenticateToken, deleteComment);

module.exports = router;
