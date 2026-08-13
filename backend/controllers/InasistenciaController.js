const Inasistencia = require("../models/InasistenciaModel");

// ==========================================
// LISTAR INASISTENCIAS
// ==========================================
const listarInasistencias = async (req, res) => {
  try {
    const datos = await Inasistencia.obtenerInasistencias();

    res.json(datos);
  } catch (error) {
    console.log("ERROR INASISTENCIAS:", error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

// ==========================================
// CREAR INASISTENCIA
// ==========================================
const crearInasistencia = async (req, res) => {
  try {
    const resultado = await Inasistencia.crearInasistencia(req.body);

    res.json({
      mensaje: "Inasistencia registrada correctamente",
      id: resultado.insertId,
    });
  } catch (error) {
    console.log("ERROR CREAR INASISTENCIA:", error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

// ==========================================
// ACTUALIZAR INASISTENCIA
// ==========================================
const actualizarInasistencia = async (req, res) => {
  try {
    await Inasistencia.actualizarInasistencia(req.params.id, req.body);

    res.json({
      mensaje: "Inasistencia actualizada correctamente",
    });
  } catch (error) {
    console.log("ERROR ACTUALIZAR INASISTENCIA:", error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

// ==========================================
// ELIMINAR INASISTENCIA
// ==========================================
const eliminarInasistencia = async (req, res) => {
  try {
    await Inasistencia.eliminarInasistencia(req.params.id);

    res.json({
      mensaje: "Inasistencia eliminada correctamente",
    });
  } catch (error) {
    console.log("ERROR ELIMINAR INASISTENCIA:", error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

module.exports = {
  listarInasistencias,
  crearInasistencia,
  actualizarInasistencia,
  eliminarInasistencia,
};
