const express = require("express");

const router = express.Router();

const {
  listarEstudiantes,
  crearEstudiante,
  eliminarEstudiante,
  actualizarEstudiante,
  activarEstudiante,
} = require("../controllers/EstudianteController");

const verificarToken = require("../middleware/authMiddleware");
const verificarRol = require("../middleware/rolMiddleware");

// ==========================================
// ESTUDIANTES
// ADMINISTRADOR, COORDINADOR Y DIRECTOR
// ==========================================

// Listar estudiantes
router.get(
  "/",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  listarEstudiantes
);

// Crear estudiante
router.post(
  "/",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  crearEstudiante
);

// Desactivar estudiante
router.delete(
  "/:id",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  eliminarEstudiante
);

// Activar estudiante
router.put(
  "/:id/activar",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  activarEstudiante
);

// Actualizar estudiante
router.put(
  "/:id",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  actualizarEstudiante
);

module.exports = router;

