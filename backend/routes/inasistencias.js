const express = require("express");

const router = express.Router();

const controller = require("../controllers/InasistenciaController");

const verificarToken = require("../middleware/authMiddleware");
const verificarRol = require("../middleware/rolMiddleware");

// ==========================================
// INASISTENCIAS
// ADMINISTRADOR, COORDINADOR Y DIRECTOR
// ==========================================

// Listar inasistencias
router.get(
  "/",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  controller.listarInasistencias
);

// Registrar inasistencia
router.post(
  "/",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  controller.crearInasistencia
);

// Actualizar inasistencia
router.put(
  "/:id",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  controller.actualizarInasistencia
);

// Eliminar inasistencia
router.delete(
  "/:id",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  controller.eliminarInasistencia
);

module.exports = router;
