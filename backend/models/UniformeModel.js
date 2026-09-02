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
      u.grupo_alerta,
      u.genero_alerta,

      e.nombres,
      e.documento,
      e.grado,

      (
        SELECT COUNT(*)
        FROM uniforme u2
        WHERE u2.id_estudiante = u.id_estudiante
      ) AS total_uniforme,

      (
        SELECT COUNT(*)
        FROM cartas c
        WHERE c.id_estudiante = u.id_estudiante
          AND c.tipo = 'uniforme'
          AND c.grupo_alerta = u.grupo_alerta
          AND c.observacion NOT LIKE 'Notificado por WhatsApp%'
      ) AS carta_generada,

      (
        SELECT COUNT(*)
        FROM cartas c
        WHERE c.id_estudiante = u.id_estudiante
          AND c.tipo = 'uniforme'
          AND c.grupo_alerta = u.grupo_alerta
          AND c.observacion LIKE 'Notificado por WhatsApp%'
      ) AS notificado_whatsapp,

      (
        SELECT c.observacion
        FROM cartas c
        WHERE c.id_estudiante = u.id_estudiante
          AND c.tipo = 'uniforme'
          AND c.grupo_alerta = u.grupo_alerta
        ORDER BY c.id_carta DESC
        LIMIT 1
      ) AS ultima_observacion_carta

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

  // Contar cuántos uniformes tiene actualmente
  const [conteo] = await conexion.query(
    `
      SELECT COUNT(*) AS total
      FROM uniforme
      WHERE id_estudiante = ?
    `,
    [id_estudiante],
  );

  // Este será el número de este nuevo reporte
  const totalUniforme = Number(conteo[0].total) + 1;

  // Cada grupo contiene 3 registros:
  // 1,2,3   -> grupo 1
  // 4,5,6   -> grupo 2
  // 7,8,9   -> grupo 3
  // etc.
  const grupoAlerta = Math.ceil(totalUniforme / 3);

  // Solo el tercer registro del grupo genera alerta
  const posicionGrupo = ((totalUniforme - 1) % 3) + 1;
  const generaAlerta = posicionGrupo === 3 ? 1 : 0;

  const [resultado] = await conexion.query(
    `
      INSERT INTO uniforme
      (
        id_estudiante,
        fecha,
        motivo,
        observacion,
        grupo_alerta,
        genero_alerta
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      id_estudiante,
      fecha,
      motivo,
      observacion || null,
      grupoAlerta,
      generaAlerta,
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
