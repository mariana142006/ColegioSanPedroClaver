const Uniforme = require("../models/UniformeModel");

const listarUniformes = async (req, res) => {
  try {
    const datos = await Uniforme.obtenerUniformes();

    res.json(datos);
  } catch (error) {
    console.log("ERROR UNIFORMES:", error);
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const crearUniforme = async (req, res) => {
  try {
    await Uniforme.crearUniforme(req.body);

    res.json({
      mensaje: "Reporte creado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const actualizarUniforme = async (req, res) => {
  try {
    await Uniforme.actualizarUniforme(req.params.id, req.body);

    res.json({
      mensaje: "Actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const eliminarUniforme = async (req, res) => {
  try {
    await Uniforme.eliminarUniforme(req.params.id);

    res.json({
      mensaje: "Eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

module.exports = {
  listarUniformes,
  crearUniforme,
  actualizarUniforme,
  eliminarUniforme,
};
