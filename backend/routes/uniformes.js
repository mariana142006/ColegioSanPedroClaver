const express = require("express");

const router = express.Router();

const controller = require("../controllers/UniformeController");

const verificarToken = require("../middleware/authMiddleware");
const verificarRol = require("../middleware/rolMiddleware");

// ==========================================
// UNIFORMES
// ADMINISTRADOR, COORDINADOR Y DIRECTOR
// ==========================================

// Listar registros
router.get(
  "/",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  controller.listarUniformes
);

// Registrar mal uso del uniforme
router.post(
  "/",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  controller.crearUniforme
);

// Eliminar registro
router.delete(
  "/:id",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  controller.eliminarUniforme
);

// Actualizar registro
router.put(
  "/:id",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  controller.actualizarUniforme
);

module.exports = router;

