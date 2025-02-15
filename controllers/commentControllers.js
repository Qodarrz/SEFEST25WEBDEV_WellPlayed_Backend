const { Comment, User, Community } = require("../models");

// ✅ GET Semua Komentar di Post tertentu (termasuk reply)
// ✅ GET Semua Komentar di Post tertentu (termasuk reply)
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { post_id: req.params.postId, parent_id: null }, // Hanya ambil komentar utama
      include: [
        {
          model: User,
          as: "commenter",
          attributes: ["id", "name", "email", "profile_picture"], // Menambahkan profile_picture
        },
        {
          model: Comment,
          as: "replies",
          include: [
            {
              model: User,
              as: "commenter",
              attributes: ["id", "name", "profile_picture"], // Menambahkan profile_picture untuk replies
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ POST Buat Komentar Baru
exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;
    const postId = req.params.postId;

    if (!content) {
      return res.status(400).json({ message: "Komentar tidak boleh kosong" });
    }

    // Pastikan post-nya ada
    const post = await Community.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Post tidak ditemukan" });
    }

    const newComment = await Comment.create({
      post_id: postId,
      user_id: userId,
      comment: content,
      parent_id: null, // Ini komentar utama
    });

    res.status(201).json({ message: "Komentar berhasil dibuat", newComment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ POST Reply Komentar (Beda Endpoint)
exports.replyToComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: "Balasan tidak boleh kosong" });
    }

    // Pastikan post-nya ada
    const post = await Community.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Post tidak ditemukan" });
    }

    // Pastikan komentar utama ada
    const parentComment = await Comment.findByPk(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Komentar utama tidak ditemukan" });
    }

    const newReply = await Comment.create({
      post_id: postId,
      user_id: userId,
      comment: content,
      parent_id: commentId, // Parent ID dari komentar utama
    });

    res.status(201).json({ message: "Balasan berhasil ditambahkan", newReply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ PUT Edit Komentar (Hanya pemilik bisa edit)
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findByPk(req.params.commentId);

    if (!comment) return res.status(404).json({ message: "Komentar tidak ditemukan" });

    if (req.user.id !== comment.user_id) {
      return res.status(403).json({ message: "Anda hanya bisa edit komentar sendiri." });
    }

    await comment.update({ comment: content });
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

    // Hapus semua reply dari komentar ini
    await Comment.destroy({ where: { parent_id: comment.id } });

    // Hapus komentarnya sendiri
    await comment.destroy();

    res.json({ message: "Komentar dan semua balasannya berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
