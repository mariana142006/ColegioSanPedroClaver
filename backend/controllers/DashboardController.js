const Dashboard = require("../models/DashboardModel");

// ==========================================
// OBTENER ESTADÍSTICAS
// ==========================================

const obtenerEstadisticas = async (req, res) => {
  try {
    const estadisticas = await Dashboard.obtenerEstadisticas();

    res.json(estadisticas);
  } catch (error) {
    console.log("ERROR OBTENIENDO ESTADÍSTICAS:", error);

    res.status(500).json({
      mensaje: "No se pudieron obtener las estadísticas del Dashboard",
    });
  }
};

module.exports = {
  obtenerEstadisticas,
};
