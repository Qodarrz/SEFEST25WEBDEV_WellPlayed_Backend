const { Op, fn, col } = require("sequelize");
const { Community, User, Comment, CommunityLike } = require("../models");

// ✅ GET Semua Post dengan Komentar, Balasan, dan Like
exports.getAllPosts = async (req, res) => {
  try {
    const communities = await Community.findAll({
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email", "profile_picture"],
        },
        {
          model: Comment,
          as: "comments",
          where: { parent_id: null },
          required: false,
          include: [
            {
              model: User,
              as: "commenter",
              attributes: ["id", "name", "profile_picture"],
            },
            {
              model: Comment,
              as: "replies",
              include: [
                {
                  model: User,
                  as: "commenter",
                  attributes: ["id", "name", "profile_picture"],
                },
              ],
            },
          ],
        },
        {
          model: CommunityLike,
          as: "community_likes",
          attributes: [
            "id",
            [fn("COUNT", col("community_likes.id")), "likeCount"], // Hitung jumlah like
          ],
          include: [
            {
              model: User,
              as: "user", // Gunakan alias yang sesuai dengan relasi di model
              attributes: ["id", "name", "profile_picture"],
            },
          ],
        },
      ],
      group: [
        "Community.id",
        "author.id",
        "comments.id",
        "comments.commenter.id",
        "comments.replies.id",
        "comments.replies.commenter.id",
        "community_likes.id",
        "community_likes.user.id",
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(communities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


// ✅ Get satu post berdasarkan ID + komentar & reply-nya + Jumlah Like
// ✅ Get satu post berdasarkan ID + komentar & reply-nya + Jumlah Like
exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Community.findByPk(postId, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email", "profile_picture"],
        },
        {
          model: Comment,
          as: "comments",
          where: { parent_id: null },
          required: false,
          include: [
            {
              model: User,
              as: "commenter",
              attributes: ["id", "name", "profile_picture"],
            },
            {
              model: Comment,
              as: "replies",
              include: [
                {
                  model: User,
                  as: "commenter",
                  attributes: ["id", "name", "profile_picture"],
                },
              ],
            },
          ],
        },
        {
          model: CommunityLike,
          as: "community_likes",
          attributes: [[fn("COUNT", col("community_likes.id")), "likeCount"]],
        },
      ],
      group: [
        "Community.id", 
        "comments.id", 
        "community_likes.post_id", // Gunakan post_id, bukan community_id
      ], 
    });

    if (!post) return res.status(404).json({ message: "Post tidak ditemukan" });

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
