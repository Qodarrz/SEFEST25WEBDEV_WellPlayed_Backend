const express = require("express");
const router = express.Router();
const EmissionController = require("../controllers/emisiControllers");
const { authenticateToken, authorizeRole } = require("../middleware/auth"); // Middleware buat cek user & role

// 🔹 USER bisa pakai kalkulator emisi & lihat riwayatnya sendiri

// 📝 POST data ke kalkulator emisi
// User yang login bisa input data ke kalkulator untuk hitung emisi
router.post("/kalkulator", authenticateToken, EmissionController.saveEmission);

// 📝 GET riwayat emisi user sendiri
// Hanya user yang login bisa lihat riwayat emisinya
router.get("/riwayat", authenticateToken, EmissionController.getUserEmissions);

// 🔹 ADMIN bisa hapus data emisi berdasarkan ID

// ❌ DELETE data emisi berdasarkan `id` (hanya admin)
// Hanya admin yang punya akses buat hapus data emisi tertentu
router.delete("/kalkulator/:id", authenticateToken, authorizeRole("admin"), EmissionController.deleteEmission);

module.exports = router;
