const express = require("express");

const router = express.Router();

const controller = require("../controllers/LlegadaController");

const verificarToken = require("../middleware/authMiddleware");
const verificarRol = require("../middleware/rolMiddleware");

// ==========================================
// LLEGADAS TARDE
// ADMINISTRADOR, COORDINADOR Y DIRECTOR
// ==========================================

// Listar llegadas
router.get(
  "/",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  controller.listarLlegadas
);

// Crear llegada
router.post(
  "/",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  controller.crearLlegada
);

// Marcar alerta como revisada
router.put(
  "/alerta/revisada",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  controller.marcarAlertaRevisada
);

// Actualizar llegada
router.put(
  "/:id",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  controller.actualizarLlegada
);

// Eliminar llegada
router.delete(
  "/:id",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  controller.eliminarLlegada
);

// Contar llegadas de un estudiante
router.get(
  "/estudiante/:id",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  controller.contarLlegadasEstudiante
);

module.exports = router;

