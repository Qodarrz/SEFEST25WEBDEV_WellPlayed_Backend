const jwt = require("jsonwebtoken");

/**
 * ✅ Middleware: Cek Token JWT
 * - Memastikan user mengirim token JWT yang valid
 */
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Akses ditolak! Token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded; // Simpan data user dari token
    next();
  } catch (error) {
    res.status(403).json({ message: "Token tidak valid" });
  }
};

/**
 * ✅ Middleware: Cek Role (Hanya Admin)
 * - Hanya user dengan role tertentu yang bisa akses (contoh: "admin")
 */
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Akses ditolak! Anda tidak memiliki izin" });
    }
    next();
  };
};

/**
 * ✅ Middleware: Cek Hak Akses Berdasarkan ID
 * - User hanya bisa mengelola data dirinya sendiri
 */
const authorizeSelf = (req, res, next) => {
  if (req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ message: "Akses ditolak! Anda hanya bisa mengelola akun sendiri." });
  }
  next();
};

module.exports = { authenticateToken, authorizeRole, authorizeSelf };
