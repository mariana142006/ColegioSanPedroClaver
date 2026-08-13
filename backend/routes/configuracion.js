const express = require("express");

const router = express.Router();

const {
  verConfiguracion,
  actualizarConfiguracion,
} = require("../controllers/ConfiguracionController");

const verificarToken = require("../middleware/authMiddleware");
const verificarRol = require("../middleware/rolMiddleware");

// ==========================================
// CONFIGURACIÓN DEL COLEGIO
// SOLO ADMINISTRADOR
// ==========================================

// Obtener configuración
router.get(
  "/",
  verificarToken,
  verificarRol("Administrador"),
  verConfiguracion
);

// Actualizar configuración
router.put(
  "/",
  verificarToken,
  verificarRol("Administrador"),
  actualizarConfiguracion
);

module.exports = router;

