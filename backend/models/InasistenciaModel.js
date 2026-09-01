const conexion = require("../database/conexion");

// ==========================================
// OBTENER TODAS LAS INASISTENCIAS
// ==========================================
const obtenerInasistencias = async () => {
  const [rows] = await conexion.query(`
    SELECT
      i.id_inasistencia,
      i.id_estudiante,
      i.fecha,
      i.tipo,
      i.observacion,
      i.estado,

      e.nombres,
      e.documento,
      e.grado,

      (
        SELECT COUNT(*)
        FROM inasistencias i2
        WHERE i2.id_estudiante = i.id_estudiante
          AND i2.tipo = 'Sin excusa'
          AND (
            i2.fecha < i.fecha
            OR (
              i2.fecha = i.fecha
              AND i2.id_inasistencia <= i.id_inasistencia
            )
          )
      ) AS total_inasistencias,

      (
        SELECT COUNT(*)
        FROM cartas c
        WHERE c.id_estudiante = i.id_estudiante
          AND c.tipo = 'inasistencia'
          AND c.observacion NOT LIKE 'Notificado por WhatsApp%'
          AND c.id_carta = (
            SELECT MAX(c2.id_carta)
            FROM cartas c2
            WHERE c2.id_estudiante = i.id_estudiante
              AND c2.tipo = 'inasistencia'
          )
      ) AS total_cartas_inasistencia,

      (
        SELECT COUNT(*)
        FROM cartas c
        WHERE c.id_estudiante = i.id_estudiante
          AND c.tipo = 'inasistencia'
          AND c.observacion LIKE 'Notificado por WhatsApp%'
          AND c.id_carta = (
            SELECT MAX(c2.id_carta)
            FROM cartas c2
            WHERE c2.id_estudiante = i.id_estudiante
              AND c2.tipo = 'inasistencia'
          )
      ) AS notificado_whatsapp,

      (
        SELECT c.observacion
        FROM cartas c
        WHERE c.id_estudiante = i.id_estudiante
          AND c.tipo = 'inasistencia'
        ORDER BY c.id_carta DESC
        LIMIT 1
      ) AS ultima_observacion_carta

    FROM inasistencias i

    INNER JOIN estudiantes e
      ON i.id_estudiante = e.id_estudiante

    ORDER BY i.id_inasistencia DESC
  `);

  return rows;
};

// ==========================================
// OBTENER INASISTENCIAS POR ESTUDIANTE
// ==========================================
const obtenerInasistenciasPorEstudiante = async (id_estudiante) => {
  const [rows] = await conexion.query(
    `
    SELECT
      i.id_inasistencia,
      i.id_estudiante,
      i.fecha,
      i.tipo,
      i.observacion,
      i.estado,

      e.nombres,
      e.documento,
      e.grado

    FROM inasistencias i

    INNER JOIN estudiantes e
      ON i.id_estudiante = e.id_estudiante

    WHERE i.id_estudiante = ?

    ORDER BY i.fecha DESC, i.id_inasistencia DESC
    `,
    [id_estudiante]
  );

  return rows;
};

// ==========================================
// CREAR INASISTENCIA
// ==========================================
const crearInasistencia = async (datos) => {
  const {
    id_estudiante,
    fecha,
    tipo,
    observacion,
    estado,
  } = datos;

  const [resultado] = await conexion.query(
    `
    INSERT INTO inasistencias
    (
      id_estudiante,
      fecha,
      tipo,
      observacion,
      estado
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      id_estudiante,
      fecha,
      tipo,
      observacion,
      estado,
    ]
  );

  return resultado;
};

// ==========================================
// ACTUALIZAR INASISTENCIA
// ==========================================
const actualizarInasistencia = async (id, datos) => {
  const {
    id_estudiante,
    fecha,
    tipo,
    observacion,
    estado,
  } = datos;

  const [resultado] = await conexion.query(
    `
    UPDATE inasistencias
    SET
      id_estudiante = ?,
      fecha = ?,
      tipo = ?,
      observacion = ?,
      estado = ?
    WHERE id_inasistencia = ?
    `,
    [
      id_estudiante,
      fecha,
      tipo,
      observacion,
      estado,
      id,
    ]
  );

  return resultado;
};

// ==========================================
// ELIMINAR INASISTENCIA
// ==========================================
const eliminarInasistencia = async (id) => {
  const [resultado] = await conexion.query(
    `
    DELETE FROM inasistencias
    WHERE id_inasistencia = ?
    `,
    [id]
  );

  return resultado;
};

module.exports = {
  obtenerInasistencias,
  obtenerInasistenciasPorEstudiante,
  crearInasistencia,
  actualizarInasistencia,
  eliminarInasistencia,
};


