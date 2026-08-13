const Estudiante = require("../models/EstudianteModel");

// =====================================================
// LISTAR
// =====================================================

const listarEstudiantes = async (req, res) => {
  try {
    const estudiantes = await Estudiante.obtenerEstudiantes();

    res.json(estudiantes);
  } catch (error) {
    console.log("ERROR LISTANDO ESTUDIANTES:", error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

// =====================================================
// CREAR
// =====================================================

const crearEstudiante = async (req, res) => {
  try {
    const { documento, nombres, grado, telefono_acudiente, nombre_acudiente } =
      req.body;

    // Validaciones

    if (!documento || !nombres || !grado) {
      return res.status(400).json({
        mensaje: "Documento, nombre y grado son obligatorios",
      });
    }

    const resultado = await Estudiante.crearEstudiante(req.body);

    res.status(201).json({
      mensaje: "Estudiante creado correctamente",

      id: resultado.insertId,
    });
  } catch (error) {
    console.log("ERROR CREANDO ESTUDIANTE:", error);

    res.status(400).json({
      mensaje: error.message,
    });
  }
};

// =====================================================
// ACTUALIZAR
// =====================================================

const actualizarEstudiante = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        mensaje: "ID del estudiante requerido",
      });
    }

    await Estudiante.actualizarEstudiante(id, req.body);

    res.json({
      mensaje: "Estudiante actualizado correctamente",
    });
  } catch (error) {
    console.log("ERROR ACTUALIZANDO ESTUDIANTE:", error);

    res.status(400).json({
      mensaje: error.message,
    });
  }
};

// =====================================================
// ELIMINAR
// =====================================================

const eliminarEstudiante = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await Estudiante.eliminarEstudiante(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Estudiante no encontrado",
      });
    }

    res.json({
      mensaje: "Estudiante desactivado correctamente",
    });
  } catch (error) {
    console.log("ERROR DESACTIVANDO ESTUDIANTE:", error);

    res.status(500).json({
      mensaje: "No se pudo desactivar el estudiante",
    });
  }
};

const activarEstudiante = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await Estudiante.activarEstudiante(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Estudiante no encontrado",
      });
    }

    res.json({
      mensaje: "Estudiante activado correctamente",
    });
  } catch (error) {
    console.log("ERROR ACTIVANDO ESTUDIANTE:", error);

    res.status(500).json({
      mensaje: "No se pudo activar el estudiante",
    });
  }
};

module.exports = {
  listarEstudiantes,
  crearEstudiante,
  actualizarEstudiante,
  eliminarEstudiante,
  activarEstudiante,
};

