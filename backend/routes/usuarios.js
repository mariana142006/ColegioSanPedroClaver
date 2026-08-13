const express = require("express");

const router = express.Router();

const {
  listarUsuarios,
  crearUsuario,
  eliminarUsuario,
  editarUsuario,
  iniciarSesion,
} = require("../controllers/UsuarioController");

const verificarToken = require("../middleware/authMiddleware");
const verificarRol = require("../middleware/rolMiddleware");

// ==========================================
// LOGIN
// ==========================================

router.post("/login", iniciarSesion);

// ==========================================
// USUARIOS
// SOLO ADMINISTRADOR
// ==========================================

router.get(
  "/",
  verificarToken,
  verificarRol("Administrador"),
  listarUsuarios
);

router.post(
  "/",
  verificarToken,
  verificarRol("Administrador"),
  crearUsuario
);

router.delete(
  "/:id",
  verificarToken,
  verificarRol("Administrador"),
  eliminarUsuario
);

router.put(
  "/:id",
  verificarToken,
  verificarRol("Administrador"),
  editarUsuario
);

module.exports = router;

