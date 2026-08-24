const Carta = require("../models/CartaModel");

// ==========================================
// LISTAR CARTAS
// ==========================================
const listarCartas = async (req, res) => {
  try {
    const datos = await Carta.obtenerCartas();

    res.json(datos);

  } catch (error) {
    console.log("Error listando cartas:", error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

// ==========================================
// GUARDAR CARTA
// ==========================================
const guardarCarta = async (req, res) => {
  try {
    const resultado = await Carta.crearCarta(req.body);

    res.json({
      mensaje: "Carta guardada correctamente",
      id: resultado.insertId,
    });

  } catch (error) {
    console.log("Error guardando carta:", error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

// ==========================================
// OBTENER NÚMERO DE REPORTE
// ==========================================
const obtenerNumeroReporte = async (req, res) => {
  try {
    const numero = await Carta.obtenerSiguienteNumero();

    res.json({
      numero,
    });

  } catch (error) {
    console.log("Error obteniendo número de reporte:", error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

// ==========================================
// ELIMINAR CARTA / REPORTE
// ==========================================
const eliminarCarta = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        mensaje: "No se recibió el ID del reporte.",
      });
    }

    const resultado = await Carta.eliminarCarta(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "El reporte no existe.",
      });
    }

    res.json({
      mensaje: "Reporte eliminado correctamente.",
    });

  } catch (error) {
    console.log("Error eliminando carta:", error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

module.exports = {
  listarCartas,
  guardarCarta,
  obtenerNumeroReporte,
  eliminarCarta,
};
