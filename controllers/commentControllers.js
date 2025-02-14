const Comment = require("../models/Comment");
const User = require("../models/User");

// ✅ GET Semua Komentar di Post tertentu
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { post_id: req.params.postId },
      include: {
        model: User,
        as: "commenter",
        attributes: ["id", "name", "email"],
      },
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ POST Buat Komentar Baru
exports.createComment = async (req, res) => {
  try {
    const { content, parent_id } = req.body;
    const userId = req.user.id;
    const postId = req.params.postId;

    if (!content) {
      return res.status(400).json({ message: "Komentar tidak boleh kosong" });
    }

    // Jika ada parent_id, pastikan parent_id valid
    if (parent_id) {
      const parentComment = await Comment.findByPk(parent_id);
      if (!parentComment) {
        return res.status(400).json({ message: "Komentar induk tidak ditemukan" });
      }
    }

    const newComment = await Comment.create({
      post_id: postId,
      user_id: userId,
      comment: content,
      parent_id: parent_id || null, // Kalau null, berarti ini komentar utama
    });

    res.status(201).json({ message: "Komentar berhasil dibuat", newComment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// ✅ PUT Edit Komentar (Hanya pemilik yang bisa edit)
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findByPk(req.params.commentId);

    if (!comment) return res.status(404).json({ message: "Komentar tidak ditemukan" });

    if (req.user.id !== comment.user_id) {
      return res.status(403).json({ message: "Anda hanya bisa edit komentar sendiri." });
    }

    await comment.update({ content });
    res.json({ message: "Komentar berhasil diperbarui", comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ DELETE Hapus Komentar + Reply-nya
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);

    if (!comment) return res.status(404).json({ message: "Komentar tidak ditemukan" });

    if (req.user.role !== "admin" && req.user.id !== comment.user_id) {
      return res.status(403).json({ message: "Anda hanya bisa hapus komentar sendiri." });
    }

    // Hapus semua reply yang punya parent_id = comment.id
    await Comment.destroy({ where: { parent_id: comment.id } });

    // Hapus komentarnya sendiri
    await comment.destroy();

    res.json({ message: "Komentar dan semua balasannya berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
