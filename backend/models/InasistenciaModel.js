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
      ) AS total_inasistencias,

      (
        SELECT COUNT(*)
        FROM cartas c
        WHERE c.id_estudiante = i.id_estudiante
          AND c.tipo = 'inasistencia'
      ) AS total_cartas_inasistencia,

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
// CALCULAR ESTADO DEL ESTUDIANTE
// ==========================================
const actualizarEstadoEstudiante = async (id_estudiante) => {
  const [conteo] = await conexion.query(
    `
    SELECT COUNT(*) AS total
    FROM inasistencias
    WHERE id_estudiante = ?
      AND tipo = 'Sin excusa'
    `,
    [id_estudiante],
  );

  const total = Number(conteo[0].total);

  let estado = "Normal";

  if (total >= 3) {
    estado = "Alerta";
  } else if (total === 2) {
    estado = "Seguimiento";
  }

  // El estado se aplica solamente a las inasistencias
  // que son "Sin excusa".
  await conexion.query(
    `
    UPDATE inasistencias
    SET estado = ?
    WHERE id_estudiante = ?
      AND tipo = 'Sin excusa'
    `,
    [estado, id_estudiante],
  );

  // Las inasistencias justificadas no deben quedar
  // con estado de alerta por el conteo de Sin excusa.
  await conexion.query(
    `
    UPDATE inasistencias
    SET estado = 'Normal'
    WHERE id_estudiante = ?
      AND tipo <> 'Sin excusa'
    `,
    [id_estudiante],
  );

  return {
    total,
    estado,
  };
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
      "Normal",
    ],
  );

  // Recalcular estado despuÃ©s de crear.
  await actualizarEstadoEstudiante(id_estudiante);

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
  } = datos;

  // Obtener estudiante anterior
  const [registro] = await conexion.query(
    `
    SELECT id_estudiante
    FROM inasistencias
    WHERE id_inasistencia = ?
    `,
    [id],
  );

  if (registro.length === 0) {
    throw new Error("Inasistencia no encontrada");
  }

  const estudianteAnterior = registro[0].id_estudiante;

  // Actualizar registro
  const [resultado] = await conexion.query(
    `
    UPDATE inasistencias
    SET
      id_estudiante = ?,
      fecha = ?,
      tipo = ?,
      observacion = ?
    WHERE id_inasistencia = ?
    `,
    [
      id_estudiante,
      fecha,
      tipo,
      observacion,
      id,
    ],
  );

  // Recalcular estudiante nuevo
  await actualizarEstadoEstudiante(id_estudiante);

  // Si cambiÃ³ de estudiante, recalcular el anterior
  if (
    Number(estudianteAnterior) !== Number(id_estudiante)
  ) {
    await actualizarEstadoEstudiante(estudianteAnterior);
  }

  return resultado;
};

// ==========================================
// ELIMINAR INASISTENCIA
// ==========================================
const eliminarInasistencia = async (id) => {
  // Primero obtener el estudiante
  const [registro] = await conexion.query(
    `
    SELECT id_estudiante
    FROM inasistencias
    WHERE id_inasistencia = ?
    `,
    [id],
  );

  if (registro.length === 0) {
    throw new Error("Inasistencia no encontrada");
  }

  const id_estudiante = registro[0].id_estudiante;

  // Eliminar
  const [resultado] = await conexion.query(
    `
    DELETE FROM inasistencias
    WHERE id_inasistencia = ?
    `,
    [id],
  );

  // Recalcular estado despuÃ©s de eliminar
  await actualizarEstadoEstudiante(id_estudiante);

  return resultado;
};

module.exports = {
  obtenerInasistencias,
  crearInasistencia,
  actualizarInasistencia,
  eliminarInasistencia,
};

