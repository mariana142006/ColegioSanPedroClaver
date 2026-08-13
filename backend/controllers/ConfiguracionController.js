const Configuracion = require("../models/ConfiguracionModel");

// Obtener configuración

const verConfiguracion = async (req, res) => {
  try {
    const datos = await Configuracion.obtenerConfiguracion();

    res.json(datos);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

// Guardar configuración

const actualizarConfiguracion = async (req, res) => {
  try {
    const resultado = await Configuracion.guardarConfiguracion(req.body);

    res.json({
      mensaje: "Configuración guardada correctamente",
      resultado,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

module.exports = {
  verConfiguracion,
  actualizarConfiguracion,
};
