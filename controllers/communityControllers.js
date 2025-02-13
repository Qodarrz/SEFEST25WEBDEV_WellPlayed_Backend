const { Op } = require("sequelize");
const { Community, User, Comment } = require("../models");

exports.getAllPosts = async (req, res) => {
  try {
    const communities = await Community.findAll({
      include: [
        {
          model: User,
          as: "author", // 🔥 Sesuai alias di models/index.js
          attributes: ["id", "name", "email"],
        },
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: User,
              as: "commenter", // 🔥 Sesuai alias di models/index.js
              attributes: ["id", "name"],
            },
            {
              model: Comment,
              as: "replies",
              include: [
                {
                  model: User,
                  as: "commenter",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json(communities);
  } catch (error) {
    console.error(error); // 🔍 Biar errornya kelihatan jelas di terminal
    res.status(500).json({ error: error.message });
  }
};

// ✅ Buat Post Baru
exports.createPost = async (req, res) => {
  try {
    const { topic } = req.body;
    const userId = req.user.id; // Dari token JWT

    if (!topic) {
      return res.status(400).json({ message: "Topik tidak boleh kosong" });
    }

    const newPost = await Community.create({ user_id: userId, topic });
    res.status(201).json({ message: "Post berhasil dibuat", newPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Edit Post (Hanya bisa edit post sendiri, admin bisa edit semuanya)
exports.updatePost = async (req, res) => {
  try {
    const { topic } = req.body;
    const post = await Community.findByPk(req.params.id);

    if (!post) return res.status(404).json({ message: "Post tidak ditemukan" });

    if (req.user.role !== "admin" && req.user.id !== post.user_id) {
      return res.status(403).json({ message: "Akses ditolak! Anda hanya bisa edit post sendiri." });
    }

    await post.update({ topic });
    res.json({ message: "Post berhasil diperbarui", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Hapus Post (Hanya bisa hapus post sendiri, admin bisa hapus semuanya)
exports.deletePost = async (req, res) => {
  try {
    const post = await Community.findByPk(req.params.id);

    if (!post) return res.status(404).json({ message: "Post tidak ditemukan" });

    if (req.user.role !== "admin" && req.user.id !== post.user_id) {
      return res.status(403).json({ message: "Akses ditolak! Anda hanya bisa hapus post sendiri." });
    }

    await post.destroy();
    res.json({ message: "Post berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
