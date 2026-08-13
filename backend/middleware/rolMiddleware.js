const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario haya pasado
      // primero por verificarToken
      if (!req.usuario) {
        return res.status(401).json({
          mensaje: "Usuario no autenticado",
        });
      }

      // Verificar el rol
      if (!rolesPermitidos.includes(req.usuario.rol)) {
        return res.status(403).json({
          mensaje: "No tienes permisos para realizar esta acción",
        });
      }

      next();

    } catch (error) {
      console.error("Error verificando rol:", error);

      return res.status(500).json({
        mensaje: "Error verificando permisos",
      });
    }
  };
};

module.exports = verificarRol;

