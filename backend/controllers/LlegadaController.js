const Llegada = require("../models/LlegadaModel");

// ==========================================
// LISTAR LLEGADAS
// ==========================================
const listarLlegadas = async (req, res) => {
  try {
    const llegadas = await Llegada.obtenerLlegadas();

    res.json(llegadas);
  } catch (error) {
    console.log("Error listando llegadas:", error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

// ==========================================
// CREAR LLEGADA
// ==========================================
const crearLlegada = async (req, res) => {
  try {
    const { id_estudiante, fecha } = req.body;

    if (!id_estudiante || !fecha) {
      return res.status(400).json({
        mensaje: "El estudiante y la fecha son obligatorios",
      });
    }

    // Crear llegada
    await Llegada.crearLlegada(req.body);

    // Contar llegadas del mismo mes
    const total = await Llegada.contarLlegadasEstudiante(id_estudiante, fecha);

    const totalMes = Number(total.total);

    const alerta = totalMes >= 3 ? 1 : 0;

    res.status(201).json({
      mensaje: "Llegada registrada correctamente",
      total_mes: totalMes,
      genero_alerta: alerta,
      estado_alerta: alerta === 1 ? "Pendiente" : "Normal",
    });
  } catch (error) {
    console.log("Error registrando llegada:", error);

    res.status(500).json({
      mensaje: "Error registrando llegada",
    });
  }
};

// ==========================================
// ACTUALIZAR LLEGADA
// ==========================================
const actualizarLlegada = async (req, res) => {
  try {
    const { id } = req.params;

    await Llegada.actualizarLlegada(id, req.body);

    res.json({
      mensaje: "Llegada tarde actualizada correctamente",
    });
  } catch (error) {
    console.log("Error actualizando llegada:", error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

// ==========================================
// ELIMINAR LLEGADA
// ==========================================
const eliminarLlegada = async (req, res) => {
  try {
    const { id } = req.params;

    await Llegada.eliminarLlegada(id);

    res.json({
      mensaje: "Llegada eliminada correctamente",
    });
  } catch (error) {
    console.log("Error eliminando llegada:", error);

    res.status(500).json({
      mensaje: "Error eliminando llegada",
    });
  }
};

// ==========================================
// CONTAR LLEGADAS DE UN ESTUDIANTE
// ==========================================
const contarLlegadasEstudiante = async (req, res) => {
  try {
    const { id } = req.params;

    const total = await Llegada.contarLlegadasEstudiante(id);

    res.json(total);
  } catch (error) {
    console.log("Error consultando llegadas:", error);

    res.status(500).json({
      mensaje: "Error consultando llegadas",
    });
  }
};

// ==========================================
// MARCAR ALERTA COMO REVISADA
// ==========================================
const marcarAlertaRevisada = async (req, res) => {
  try {
    const { id_estudiante, fecha } = req.body;

    if (!id_estudiante || !fecha) {
      return res.status(400).json({
        mensaje: "El estudiante y la fecha son obligatorios",
      });
    }

    await Llegada.marcarAlertaRevisada(id_estudiante, fecha);

    res.json({
      mensaje: "Alerta marcada como revisada",
    });
  } catch (error) {
    console.log("Error marcando alerta:", error);

    res.status(500).json({
      mensaje: "Error marcando alerta como revisada",
    });
  }
};

// ==========================================
// EXPORTAR
// ==========================================
module.exports = {
  listarLlegadas,
  crearLlegada,
  actualizarLlegada,
  eliminarLlegada,
  contarLlegadasEstudiante,
  marcarAlertaRevisada,
};
