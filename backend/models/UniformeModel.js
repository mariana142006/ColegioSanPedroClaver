const conexion = require("../database/conexion");

// listar uniformes
const obtenerUniformes = async () => {
  const [rows] = await conexion.query(`

        SELECT

        u.id_uniforme,
        u.id_estudiante,
        u.fecha,
        u.motivo,

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

// crear reporte
const crearUniforme = async (datos) => {
  const { id_estudiante, fecha, hora, motivo, observacion } = datos;

  const [resultado] = await conexion.query(
    `
      INSERT INTO uniforme
      (
        id_estudiante,
        fecha,
        hora,
        motivo,
        observacion,
        genero_alerta
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      id_estudiante,
      fecha,
      hora,
      motivo,
      observacion || null,
      0,
    ],
  );

  return resultado;
};

// actualizar reporte
const actualizarUniforme = async (id, datos) => {
  const { id_estudiante, fecha, hora, motivo } = datos;

  const [resultado] = await conexion.query(
    `

        UPDATE uniforme SET

        id_estudiante=?,
        fecha=?,
        hora=?,
        motivo=?

        WHERE id_uniforme=?

        `,

    [id_estudiante, fecha, hora, motivo, id],
  );

  return resultado;
};

// eliminar reporte

const eliminarUniforme = async (id) => {
  const [resultado] = await conexion.query(
    "DELETE FROM uniforme WHERE id_uniforme=?",

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
