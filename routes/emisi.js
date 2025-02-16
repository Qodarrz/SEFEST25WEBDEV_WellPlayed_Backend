const express = require("express");
const router = express.Router();
const EmissionController = require("../controllers/emisiControllers");
const MissionController = require("../controllers/missionControllers");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

// 🔹 Middleware: Semua route butuh autentikasi
router.use(authenticateToken);

// 🔥 USER Routes (Input & Lihat Riwayat Emisi)
router.post("/kalkulator", EmissionController.saveEmission);
router.get("/kalkulator/riwayat", EmissionController.getUserEmissions);

// 🔥 ADMIN Routes (Hapus Emisi)
router.delete("/kalkulator/:id", authorizeRole("admin"), EmissionController.deleteEmission);

// 🔥 Mission Routes
router.get("/missions", MissionController.getMissions);  // ✅ Pakai DELETE

module.exports = router;
