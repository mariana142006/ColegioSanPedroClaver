const Carta = require("../models/CartaModel");

// ==========================================
// LISTAR CARTAS
// ==========================================
const listarCartas = async (req, res) => {
  try {
    const datos = await Carta.obtenerCartas();

    console.log("Cartas encontradas:", datos.length);

    res.json(datos);

  } catch (error) {
    console.error("ERROR LISTANDO CARTAS:", error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

// ==========================================
// GUARDAR CARTA / NOTIFICACIÓN
// ==========================================
const guardarCarta = async (req, res) => {
  try {
    console.log("==========================================");
    console.log("INTENTO DE GUARDAR CARTA");
    console.log("Datos recibidos:", req.body);
    console.log("==========================================");

    const {
      id_estudiante,
      grupo_alerta,
      tipo,
      numero_reporte,
      fecha_generacion,
      archivo_pdf,
      observacion,
    } = req.body;

    if (!id_estudiante) {
      return res.status(400).json({
        mensaje: "Falta id_estudiante.",
      });
    }

    if ((tipo === "llegada" || tipo === "uniforme") && !grupo_alerta) {
      return res.status(400).json({
        mensaje: "Falta grupo_alerta.",
      });
    }

    if (!tipo) {
      return res.status(400).json({
        mensaje: "Falta tipo.",
      });
    }

    if (!numero_reporte) {
      return res.status(400).json({
        mensaje: "Falta numero_reporte.",
      });
    }

    if (!fecha_generacion) {
      return res.status(400).json({
        mensaje: "Falta fecha_generacion.",
      });
    }

    const resultado = await Carta.crearCarta(req.body);

    console.log("CARTA / NOTIFICACIÓN GUARDADA CORRECTAMENTE");
    console.log("ID generado:", resultado.insertId);
    console.log("Grupo de alerta:", grupo_alerta);

    res.json({
      mensaje: "Carta guardada correctamente",
      id: resultado.insertId,
      grupo_alerta: Number(grupo_alerta),
    });

  } catch (error) {
    console.error("==========================================");
    console.error("ERROR GUARDANDO CARTA");
    console.error("Mensaje:", error.message);
    console.error("Código:", error.code);
    console.error("SQL:", error.sql);
    console.error("==========================================");

    res.status(500).json({
      mensaje: error.message,
      codigo: error.code || null,
    });
  }
};

// ==========================================
// OBTENER NÚMERO DE REPORTE
// ==========================================
const obtenerNumeroReporte = async (req, res) => {
  try {
    const numero = await Carta.obtenerSiguienteNumero();

    console.log("Siguiente número de reporte:", numero);

    res.json({
      numero,
    });

  } catch (error) {
    console.error("ERROR OBTENIENDO NÚMERO:", error);

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
    console.error("ERROR ELIMINANDO CARTA:", error);

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


