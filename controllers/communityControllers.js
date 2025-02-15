const { Op } = require("sequelize");
const { Community, User, Comment } = require("../models");

// ✅ Ambil Semua Post + Komentar & Reply-nya
exports.getAllPosts = async (req, res) => {
  try {
    const communities = await Community.findAll({
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
        {
          model: Comment,
          as: "comments",
          where: { parent_id: null }, // 🔥 Ambil hanya komentar utama (bukan reply)
          required: false, // 🔥 Biar kalau ga ada komen tetap jalan
          include: [
            {
              model: User,
              as: "commenter",
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
      order: [["createdAt", "DESC"]], // 🔥 Order dari terbaru ke terlama
    });

    res.status(200).json(communities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get satu post berdasarkan ID + komentar & reply-nya
exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Community.findByPk(postId, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
        {
          model: Comment,
          as: "comments",
          where: { parent_id: null }, // 🔥 Hanya komentar utama
          required: false,
          include: [
            {
              model: User,
              as: "commenter",
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

    if (!post) {
      return res.status(404).json({ message: "Post tidak ditemukan" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


// ✅ Buat Post Baru
exports.createPost = async (req, res) => {
  try {
    const { topic } = req.body;
    const userId = req.user.id;

    if (!topic) {
      return res.status(400).json({ message: "Topik tidak boleh kosong" });
    }

    const newPost = await Community.create({ user_id: userId, topic });
    res.status(201).json({ message: "Post berhasil dibuat", newPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Edit Post (Hanya bisa edit post sendiri, admin bisa edit semua)
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

// ✅ Hapus Post (Hanya pemilik atau admin yang bisa hapus)
// ✅ Hapus Post (Hanya pemilik atau admin yang bisa hapus)
exports.deletePost = async (req, res) => {
  try {
    const post = await Community.findByPk(req.params.id, {

      include: { model: Comment, as: "comments" },
    });

    if (!post) return res.status(404).json({ message: "Post tidak ditemukan" });

    if (req.user.role !== "admin" && req.user.id !== post.user_id) {
      return res.status(403).json({ message: "Akses ditolak! Anda hanya bisa hapus post sendiri." });
    }

    // 🔥 Hapus semua komentar berdasarkan post_id sebelum hapus post
    await Comment.destroy({ where: { post_id: post.id } });

    // 🔥 Hapus post-nya setelah semua komentarnya terhapus
    await post.destroy();

    res.json({ message: "Post berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

