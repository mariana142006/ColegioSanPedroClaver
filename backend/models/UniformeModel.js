const conexion = require("../database/conexion");

// ==========================================
// LISTAR UNIFORMES
// ==========================================
const obtenerUniformes = async () => {
  const [rows] = await conexion.query(`
    SELECT
      u.id_uniforme,
      u.id_estudiante,
      u.fecha,
      u.motivo,
      u.observacion,
      u.genero_alerta,

      e.nombres,
      e.documento,
      e.grado,

      (
        SELECT COUNT(*)
        FROM uniforme u2
        WHERE u2.id_estudiante = u.id_estudiante
      ) AS total_uniforme

    FROM uniforme u

    INNER JOIN estudiantes e
      ON u.id_estudiante = e.id_estudiante

    ORDER BY u.id_uniforme DESC
  `);

  return rows;
};

// ==========================================
// CREAR REPORTE DE UNIFORME
// ==========================================
const crearUniforme = async (datos) => {
  const {
    id_estudiante,
    fecha,
    motivo,
    observacion,
  } = datos;

  const [resultado] = await conexion.query(
    `
      INSERT INTO uniforme
      (
        id_estudiante,
        fecha,
        motivo,
        observacion,
        genero_alerta
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      id_estudiante,
      fecha,
      motivo,
      observacion || null,
      0,
    ],
  );

  return resultado;
};

// ==========================================
// ACTUALIZAR REPORTE DE UNIFORME
// ==========================================
const actualizarUniforme = async (id, datos) => {
  const {
    id_estudiante,
    fecha,
    motivo,
    observacion,
  } = datos;

  const [resultado] = await conexion.query(
    `
      UPDATE uniforme
      SET
        id_estudiante = ?,
        fecha = ?,
        motivo = ?,
        observacion = ?
      WHERE id_uniforme = ?
    `,
    [
      id_estudiante,
      fecha,
      motivo,
      observacion || null,
      id,
    ],
  );

  return resultado;
};

// ==========================================
// ELIMINAR REPORTE DE UNIFORME
// ==========================================
const eliminarUniforme = async (id) => {
  const [resultado] = await conexion.query(
    "DELETE FROM uniforme WHERE id_uniforme = ?",
    [id],
  );

  return resultado;
};

module.exports = {
  obtenerUniformes,
  crearUniforme,
  actualizarUniforme,
  eliminarUniforme,
};
