const express = require("express");

const router = express.Router();

const CartaController = require("../controllers/CartaController");

const verificarToken = require("../middleware/authMiddleware");
const verificarRol = require("../middleware/rolMiddleware");

// ==========================================
// CARTAS Y REPORTES
// ADMINISTRADOR, COORDINADOR Y DIRECTOR
// ==========================================

// Listar cartas
router.get(
  "/",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  CartaController.listarCartas
);

// Obtener número de reporte
router.get(
  "/numero",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  CartaController.obtenerNumeroReporte
);

// Guardar carta
router.post(
  "/",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  CartaController.guardarCarta
);

// Eliminar carta/reporte
router.delete(
  "/:id",
  verificarToken,
  verificarRol("Administrador", "Coordinador", "Director"),
  CartaController.eliminarCarta
);

module.exports = router;
