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
      e.grado,

      (
        SELECT COUNT(*)
        FROM cartas c
        WHERE c.id_estudiante = l.id_estudiante
          AND c.tipo = 'llegada'
      ) AS carta_generada

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
  const {
    id_estudiante,
    fecha,
    observacion,
  } = datos;

  // ==========================================
  // GENERAR HORA REAL - COLOMBIA
  // ==========================================
  const ahora = new Date();

  const hora = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(ahora);

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

  const estadoAlerta = generaAlerta === 1
    ? "Pendiente"
    : "Atendida";

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
      observacion || null,
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
// LA HORA ORIGINAL NO SE MODIFICA
// ==========================================
const actualizarLlegada = async (id, datos) => {
  const {
    id_estudiante,
    fecha,
    observacion,
  } = datos;

  // ==========================================
  // BUSCAR DATOS ANTERIORES
  // ==========================================
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

  // ==========================================
  // ACTUALIZAR SIN CAMBIAR LA HORA
  // ==========================================
  const [resultado] = await conexion.query(
    `
      UPDATE llegadas_tarde
      SET
        id_estudiante = ?,
        fecha = ?,
        observacion = ?
      WHERE id_llegada = ?
    `,
    [
      id_estudiante,
      fecha,
      observacion || null,
      id,
    ],
  );

  // ==========================================
  // RECALCULAR MES ANTERIOR
  // ==========================================
  await actualizarTotalesMes(
    estudianteAnterior,
    fechaAnterior,
  );

  // ==========================================
  // RECALCULAR NUEVO MES
  // ==========================================
  await actualizarTotalesMes(
    id_estudiante,
    fecha,
  );

  return resultado;
};

// ==========================================
// ELIMINAR LLEGADA
// ==========================================
const eliminarLlegada = async (id) => {
  // ==========================================
  // BUSCAR LA LLEGADA ANTES DE ELIMINAR
  // ==========================================
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

  // ==========================================
  // ELIMINAR
  // ==========================================
  await conexion.query(
    `
      DELETE FROM llegadas_tarde
      WHERE id_llegada = ?
    `,
    [id],
  );

  // ==========================================
  // RECALCULAR DESPUÉS DE ELIMINAR
  // ==========================================
  await actualizarTotalesMes(
    estudiante,
    fecha,
  );

  return {
    mensaje: "Llegada eliminada correctamente",
  };
};

// ==========================================
// CONTAR LLEGADAS DEL MES
// ==========================================
const contarLlegadasEstudiante = async (
  id_estudiante,
  fecha = null,
) => {
  let fechaReferencia = fecha;

  if (!fechaReferencia) {
    fechaReferencia = new Date()
      .toISOString()
      .substring(0, 10);
  }

  const [rows] = await conexion.query(
    `
      SELECT COUNT(*) AS total
      FROM llegadas_tarde
      WHERE id_estudiante = ?
        AND MONTH(fecha) = MONTH(?)
        AND YEAR(fecha) = YEAR(?)
    `,
    [
      id_estudiante,
      fechaReferencia,
      fechaReferencia,
    ],
  );

  return Number(rows[0].total);
};

// ==========================================
// ACTUALIZAR TOTALES DEL MES
// ==========================================
const actualizarTotalesMes = async (
  id_estudiante,
  fecha,
) => {
  const [resultado] = await conexion.query(
    `
      SELECT COUNT(*) AS total
      FROM llegadas_tarde
      WHERE id_estudiante = ?
        AND MONTH(fecha) = MONTH(?)
        AND YEAR(fecha) = YEAR(?)
    `,
    [
      id_estudiante,
      fecha,
      fecha,
    ],
  );

  const total = Number(resultado[0].total);

  const alerta = total >= 3 ? 1 : 0;

  const estado = total >= 3
    ? "Pendiente"
    : "Atendida";

  // ==========================================
  // ACTUALIZAR REGISTROS DEL MISMO MES
  // ==========================================
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
    [
      total,
      alerta,
      estado,
      id_estudiante,
      fecha,
      fecha,
    ],
  );
};

// ==========================================
// MARCAR ALERTA COMO ATENDIDA
// ==========================================
const marcarAlertaRevisada = async (
  id_estudiante,
  fecha,
) => {
  await conexion.query(
    `
      UPDATE llegadas_tarde
      SET estado_alerta = 'Atendida'
      WHERE id_estudiante = ?
        AND MONTH(fecha) = MONTH(?)
        AND YEAR(fecha) = YEAR(?)
    `,
    [
      id_estudiante,
      fecha,
      fecha,
    ],
  );
};

// ==========================================
// EXPORTAR FUNCIONES
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