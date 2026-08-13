const conexion = require("../database/conexion");

// ==========================================
// OBTENER TODAS LAS LLEGADAS
// ==========================================
const obtenerLlegadas = async () => {
  const [rows] = await conexion.query(`
    SELECT
      l.id_llegada,
      l.id_estudiante,
      l.fecha,
      l.hora,
      l.observacion,
      l.total_mes,
      l.genero_alerta,
      l.estado_alerta,

      e.nombres,
      e.documento,
      e.grado

    FROM llegadas_tarde l

    INNER JOIN estudiantes e
      ON l.id_estudiante = e.id_estudiante

    ORDER BY l.fecha DESC, l.hora DESC, l.id_llegada DESC
  `);

  return rows;
};

// ==========================================
// CREAR LLEGADA TARDE
// ==========================================
const crearLlegada = async (datos) => {
  const { id_estudiante, fecha, hora, observacion } = datos;

  // ==========================================
  // CONTAR LLEGADAS DEL MISMO MES
  // ==========================================
  const [conteo] = await conexion.query(
    `
      SELECT COUNT(*) AS total
      FROM llegadas_tarde
      WHERE id_estudiante = ?
        AND MONTH(fecha) = MONTH(?)
        AND YEAR(fecha) = YEAR(?)
    `,
    [id_estudiante, fecha, fecha],
  );

  const totalMes = Number(conteo[0].total) + 1;

  // ==========================================
  // GENERAR ALERTA DESDE LA TERCERA LLEGADA
  // ==========================================
  const generaAlerta = totalMes >= 3 ? 1 : 0;

  const estadoAlerta = generaAlerta === 1 ? "Pendiente" : "Normal";

  // ==========================================
  // INSERTAR LLEGADA
  // ==========================================
  const [resultado] = await conexion.query(
    `
      INSERT INTO llegadas_tarde
      (
        id_estudiante,
        fecha,
        hora,
        observacion,
        total_mes,
        genero_alerta,
        estado_alerta
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id_estudiante,
      fecha,
      hora,
      observacion,
      totalMes,
      generaAlerta,
      estadoAlerta,
    ],
  );

  // ==========================================
  // ACTUALIZAR TODAS LAS LLEGADAS DEL MES
  // ==========================================
  await actualizarTotalesMes(id_estudiante, fecha);

  return resultado;
};

// ==========================================
// ACTUALIZAR LLEGADA
// ==========================================
const actualizarLlegada = async (id, datos) => {
  const { id_estudiante, fecha, hora, observacion } = datos;

  // Buscar datos anteriores
  const [anterior] = await conexion.query(
    `
      SELECT
        id_estudiante,
        fecha
      FROM llegadas_tarde
      WHERE id_llegada = ?
    `,
    [id],
  );

  if (anterior.length === 0) {
    throw new Error("Llegada tarde no encontrada");
  }

  const estudianteAnterior = anterior[0].id_estudiante;
  const fechaAnterior = anterior[0].fecha;

  // Actualizar
  const [resultado] = await conexion.query(
    `
      UPDATE llegadas_tarde
      SET
        id_estudiante = ?,
        fecha = ?,
        hora = ?,
        observacion = ?
      WHERE id_llegada = ?
    `,
    [id_estudiante, fecha, hora, observacion, id],
  );

  // Recalcular el mes anterior
  await actualizarTotalesMes(estudianteAnterior, fechaAnterior);

  // Recalcular el nuevo mes
  await actualizarTotalesMes(id_estudiante, fecha);

  return resultado;
};

// ==========================================
// ELIMINAR LLEGADA
// ==========================================
const eliminarLlegada = async (id) => {
  // Buscar la llegada antes de eliminarla
  const [llegada] = await conexion.query(
    `
      SELECT
        id_estudiante,
        fecha
      FROM llegadas_tarde
      WHERE id_llegada = ?
    `,
    [id],
  );

  if (llegada.length === 0) {
    throw new Error("Llegada tarde no encontrada");
  }

  const estudiante = llegada[0].id_estudiante;
  const fecha = llegada[0].fecha;

  // Eliminar
  await conexion.query(
    `
      DELETE FROM llegadas_tarde
      WHERE id_llegada = ?
    `,
    [id],
  );

  // Recalcular después de eliminar
  await actualizarTotalesMes(estudiante, fecha);

  return {
    id_estudiante: estudiante,
    fecha: fecha,
  };
};

// ==========================================
// CONTAR LLEGADAS DEL MES
// ==========================================
const contarLlegadasEstudiante = async (id_estudiante, fecha = null) => {
  let fechaReferencia = fecha;

  if (!fechaReferencia) {
    fechaReferencia = new Date().toISOString().substring(0, 10);
  }

  const [rows] = await conexion.query(
    `
      SELECT COUNT(*) AS total
      FROM llegadas_tarde
      WHERE id_estudiante = ?
        AND MONTH(fecha) = MONTH(?)
        AND YEAR(fecha) = YEAR(?)
    `,
    [id_estudiante, fechaReferencia, fechaReferencia],
  );

  return rows[0];
};

// ==========================================
// ACTUALIZAR TOTALES DEL MES
// ==========================================
const actualizarTotalesMes = async (id_estudiante, fecha) => {
  // Obtener total del mes
  const [resultado] = await conexion.query(
    `
      SELECT COUNT(*) AS total
      FROM llegadas_tarde
      WHERE id_estudiante = ?
        AND MONTH(fecha) = MONTH(?)
        AND YEAR(fecha) = YEAR(?)
    `,
    [id_estudiante, fecha, fecha],
  );

  const total = Number(resultado[0].total);

  const alerta = total >= 3 ? 1 : 0;

  const estado = total >= 3 ? "Pendiente" : "Normal";

  // Actualizar registros de ese mismo mes
  await conexion.query(
    `
      UPDATE llegadas_tarde
      SET
        total_mes = ?,
        genero_alerta = ?,
        estado_alerta = ?
      WHERE id_estudiante = ?
        AND MONTH(fecha) = MONTH(?)
        AND YEAR(fecha) = YEAR(?)
    `,
    [total, alerta, estado, id_estudiante, fecha, fecha],
  );
};

// ==========================================
// MARCAR ALERTA COMO REVISADA
// ==========================================
const marcarAlertaRevisada = async (id_estudiante, fecha) => {
  await conexion.query(
    `
      UPDATE llegadas_tarde
      SET estado_alerta = 'Revisada'
      WHERE id_estudiante = ?
        AND MONTH(fecha) = MONTH(?)
        AND YEAR(fecha) = YEAR(?)
        AND genero_alerta = 1
    `,
    [id_estudiante, fecha, fecha],
  );
};

// ==========================================
// EXPORTAR
// ==========================================
module.exports = {
  obtenerLlegadas,
  crearLlegada,
  actualizarLlegada,
  eliminarLlegada,
  contarLlegadasEstudiante,
  actualizarTotalesMes,
  marcarAlertaRevisada,
};
