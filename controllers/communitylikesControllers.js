const { User, Community, CommunityLike } = require("../models");

// Fungsi untuk menambahkan like ke post
const addCommunityLike = async (req, res) => {
    const { postId } = req.params; // Ambil postId dari parameter route
    const userId = req.user.id; // Ambil userId dari JWT token
  
    try {
      // Cari post berdasarkan postId
      const post = await Community.findByPk(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      // Periksa apakah user sudah memberi like pada post ini
      const existingLike = await CommunityLike.findOne({
        where: {
          user_id: userId,
          post_id: postId, // Pastikan menggunakan post_id
        },
      });
  
      if (existingLike) {
        return res.status(400).json({ message: "You already liked this post" });
      }
  
      // Tambahkan like baru
      const newLike = await CommunityLike.create({
        user_id: userId,
        post_id: postId, // Kita pakai post_id di sini
      });
  
      return res.status(201).json({ message: "Like added", data: newLike });
    } catch (error) {
      console.error(error.stack);
      return res.status(500).json({ message: error.message || "Server error" });
    }
  };
  

// Fungsi untuk menghapus like dari post
// Fungsi untuk menghapus like dari post
const removeCommunityLike = async (req, res) => {
    const { postId, likeId } = req.params; // Ambil postId dan likeId dari parameter route
    const userId = req.user.id; // Ambil userId dari JWT token
  
    try {
      // Cari like yang ingin dihapus berdasarkan userId, postId, dan likeId
      const likeToDelete = await CommunityLike.findOne({
        where: {
          id: likeId, // Gunakan likeId untuk mencari like tertentu
          user_id: userId, // Pastikan user yang menghapus adalah pemilik like
          post_id: postId, // Pastikan like tersebut terkait dengan postId yang benar
        },
      });
  
      if (!likeToDelete) {
        return res.status(404).json({ message: "Like not found" });
      }
  
      // Hapus like
      await likeToDelete.destroy();
  
      return res.status(200).json({ message: "Like removed", data: likeToDelete });
    } catch (error) {
      console.error(error.stack);
      return res.status(500).json({ message: error.message || "Server error" });
    }
  };
  
// Fungsi untuk mendapatkan semua like pada post tertentu
const getPostLikes = async (req, res) => {
  const { postId } = req.params; // Ambil postId dari parameter route

  try {
    // Cari post berdasarkan postId
    const post = await Community.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Cari semua like yang diberikan pada post ini
    const communityLikes = await CommunityLike.findAll({
      where: {
        post_id: postId, // Kita pakai post_id di sini
      },
      include: [
        {
          model: User,
          as: "user", // Relasi ke model User untuk ambil data user yang memberi like
          attributes: ["id", "name", "email"], // Ambil informasi user yang memberi like
        },
        {
          model: Community, // Relasi ke model Community untuk ambil informasi post
          as: "community",
          attributes: ["id", "topic", "user_id"], // Ambil informasi tentang post
        },
      ],
    });

    // Kirim response dengan data post dan like-likes
    return res.status(200).json({
      post: post, // Info tentang post
      likes: communityLikes.map(like => ({
        user: like.user, // User yang memberi like
        post: like.community, // Post yang dilike
      })),
    });
  } catch (error) {
    console.error(error.stack);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

module.exports = { addCommunityLike, removeCommunityLike, getPostLikes };
