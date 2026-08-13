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
      ) AS total_inasistencias

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
    `,
    [id_estudiante],
  );

  const total = conteo[0].total;

  let estado = "Normal";

  if (total >= 3) {
    estado = "Alerta";
  } else if (total === 2) {
    estado = "Seguimiento";
  }

  await conexion.query(
    `
    UPDATE inasistencias
    SET estado = ?
    WHERE id_estudiante = ?
    `,
    [estado, id_estudiante],
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
  const { id_estudiante, fecha, tipo, observacion } = datos;

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
    [id_estudiante, fecha, tipo, observacion, "Normal"],
  );

  // Recalcular estado después de crear
  await actualizarEstadoEstudiante(id_estudiante);

  return resultado;
};

// ==========================================
// ACTUALIZAR INASISTENCIA
// ==========================================
const actualizarInasistencia = async (id, datos) => {
  const { id_estudiante, fecha, tipo, observacion } = datos;

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
    [id_estudiante, fecha, tipo, observacion, id],
  );

  // Recalcular estudiante nuevo
  await actualizarEstadoEstudiante(id_estudiante);

  // Si cambió de estudiante, recalcular el anterior
  if (Number(estudianteAnterior) !== Number(id_estudiante)) {
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

  // Recalcular estado después de eliminar
  await actualizarEstadoEstudiante(id_estudiante);

  return resultado;
};

module.exports = {
  obtenerInasistencias,
  crearInasistencia,
  actualizarInasistencia,
  eliminarInasistencia,
};
