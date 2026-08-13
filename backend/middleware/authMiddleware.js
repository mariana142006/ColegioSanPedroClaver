const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  try {
    const encabezado = req.headers.authorization;

    if (!encabezado) {
      return res.status(401).json({
        mensaje: "No hay token de autenticación",
      });
    }

    const partes = encabezado.split(" ");

    if (partes.length !== 2 || partes[0] !== "Bearer") {
      return res.status(401).json({
        mensaje: "Formato de token inválido",
      });
    }

    const token = partes[1];

    const usuario = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = usuario;

    next();

  } catch (error) {

    console.error("Error verificando token:", error.message);

    return res.status(401).json({
      mensaje: "Token inválido o expirado",
    });
  }
};

module.exports = verificarToken;
