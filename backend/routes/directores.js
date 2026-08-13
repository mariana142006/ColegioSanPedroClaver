const express = require("express");
const router = express.Router();

const {
  obtenerDirectores,
  obtenerDirector,
  agregarDirector,
  actualizarDirector,
  eliminarDirector,
} = require("../controllers/DirectorController");

const verificarToken = require("../middleware/authMiddleware");
const verificarRol = require("../middleware/rolMiddleware");

// ==========================================
// DIRECTORES DE GRUPO
// ADMINISTRADOR Y COORDINADOR
// ==========================================

// Obtener todos
router.get(
  "/",
  verificarToken,
  verificarRol("Administrador", "Coordinador"),
  obtenerDirectores
);

// Obtener uno
router.get(
  "/:id",
  verificarToken,
  verificarRol("Administrador", "Coordinador"),
  obtenerDirector
);

// Agregar
router.post(
  "/",
  verificarToken,
  verificarRol("Administrador", "Coordinador"),
  agregarDirector
);

// Actualizar
router.put(
  "/:id",
  verificarToken,
  verificarRol("Administrador", "Coordinador"),
  actualizarDirector
);

// Eliminar
router.delete(
  "/:id",
  verificarToken,
  verificarRol("Administrador", "Coordinador"),
  eliminarDirector
);

module.exports = router;
