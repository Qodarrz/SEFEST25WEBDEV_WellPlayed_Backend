const express = require("express");
const router = express.Router();
const EmissionController = require("../controllers/emisiControllers");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

// 🔹 User bisa POST data ke kalkulator dan GET riwayat emisinya sendiri
router.post("/kalkulator", authenticateToken, EmissionController.saveEmission);
router.get("/riwayat", authenticateToken, EmissionController.getUserEmissions); 

// 🔹 Admin bisa DELETE data emisi berdasarkan ID
router.delete("/kalkulator/:id", authenticateToken, authorizeRole("admin"), EmissionController.deleteEmission);

module.exports = router;
