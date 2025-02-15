const express = require("express");
const router = express.Router();
const CommunityController = require("../controllers/communityControllers");
const CommentController = require("../controllers/commentControllers");
const CommunityLikeController = require("../controllers/communitylikesControllers"); // Import controller
const { authenticateToken } = require("../middleware/auth"); // Middleware buat cek user login

// ✅ Semua route di bawah ini butuh login dulu pakai `authenticateToken`
router.use(authenticateToken); // Jadi nggak usah tulis berulang

// ===================== POST ROUTES =====================
// 📝 GET semua post (timeline)
router.get("/community", CommunityController.getAllPosts);

// 📝 GET satu post berdasarkan ID
router.get("/community/:postId", CommunityController.getPostById);

// 📝 POST buat bikin post baru
router.post("/community", CommunityController.createPost);

// 📝 PUT update post (hanya pemilik bisa edit)
router.put("/community/:id", CommunityController.updatePost);

// ❌ DELETE hapus post (hanya pemilik atau admin)
router.delete("/community/:id", CommunityController.deletePost);

// ===================== COMMENT ROUTES =====================
// 📝 GET semua komentar di post tertentu
router.get("/community/:postId/comments", CommentController.getComments);

// 📝 POST buat komentar baru (komentar utama)
router.post("/community/:postId/comments", CommentController.createComment);

// 📝 PUT edit komentar utama (hanya pemilik bisa edit)
router.put("/community/:postId/comments/:commentId", CommentController.updateComment);

// ❌ DELETE hapus komentar utama + semua reply-nya
router.delete("/community/:postId/comments/:commentId", CommentController.deleteComment);

// ===================== REPLY ROUTES (CRUD) =====================

// 🔥 POST reply ke komentar tertentu
router.post("/community/:postId/comments/:commentId/reply", CommentController.replyToComment);

// 📝 PUT edit reply (hanya pemilik bisa edit)
router.put("/community/:postId/comments/:commentId/reply/:replyId", CommentController.updateComment);

// ❌ DELETE hapus reply (hanya pemilik atau admin)
router.delete("/community/:postId/comments/:commentId/reply/:replyId", CommentController.deleteComment);

// ===================== COMMUNITY LIKE ROUTES =====================
// 📝 GET lihat semua like yang diterima oleh komunitas (post)
router.get("/community/:postId/like", CommunityLikeController.getPostLikes);


// 📝 POST like ke komunitas (suka)
router.post("/community/:postId/like", CommunityLikeController.addCommunityLike);

// 📝 DELETE like dari komunitas
router.delete("/community/:postId/like/:likeId", CommunityLikeController.removeCommunityLike);

module.exports = router;
