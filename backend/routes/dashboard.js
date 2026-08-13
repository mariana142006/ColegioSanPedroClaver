const express = require("express");

const router = express.Router();

const { obtenerEstadisticas } = require("../controllers/DashboardController");

const verificarToken = require("../middleware/authMiddleware");
const verificarRol = require("../middleware/rolMiddleware");

// ==========================================
// DASHBOARD
// ADMINISTRADOR, COORDINADOR Y DIRECTOR
// ==========================================

router.get(
  "/",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  obtenerEstadisticas,
);

module.exports = router;
