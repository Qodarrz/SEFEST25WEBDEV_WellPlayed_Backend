const express = require("express");
const router = express.Router();
const { getComments, createComment, updateComment, deleteComment } = require("../controllers/commentControllers");
const { authenticateToken } = require("../middleware/auth");

// ✅ GET Semua Komentar di Post tertentu
router.get("/comment/:postId", authenticateToken, getComments);
    
// ✅ POST Buat Komentar Baru
router.post("/comment/:postId", authenticateToken, createComment);

// ✅ PUT Edit Komentar (Hanya pemilik atau admin)
router.put("/comment/:commentId", authenticateToken, updateComment);

// ✅ DELETE Hapus Komentar (Hanya pemilik atau admin)
router.delete("/comment/:commentId", authenticateToken, deleteComment);

module.exports = router;
