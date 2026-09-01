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
      l.grupo_alerta,
      l.genero_alerta,
      l.estado_alerta,

      e.nombres,
      e.documento,
      e.grado,
      e.telefono_acudiente,
      e.nombre_acudiente,

      (
        SELECT COUNT(*)
        FROM cartas c
        WHERE c.id_estudiante = l.id_estudiante
          AND c.tipo = 'llegada'
          AND c.observacion NOT LIKE 'Notificado por WhatsApp%'
          AND c.grupo_alerta = l.grupo_alerta
      ) AS carta_generada,

      (
        SELECT COUNT(*)
        FROM cartas c
        WHERE c.id_estudiante = l.id_estudiante
          AND c.tipo = 'llegada'
          AND c.observacion LIKE 'Notificado por WhatsApp%'
          AND c.grupo_alerta = l.grupo_alerta
      ) AS notificado_whatsapp,

      (
        SELECT c.observacion
        FROM cartas c
        WHERE c.id_estudiante = l.id_estudiante
          AND c.tipo = 'llegada'
          AND c.grupo_alerta = l.grupo_alerta
        ORDER BY c.id_carta DESC
        LIMIT 1
      ) AS ultima_observacion_carta

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
  // OBTENER HORA REAL DE COLOMBIA
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
  // OBTENER HORA DE ENTRADA CONFIGURADA
  // ==========================================
  const [configuracion] = await conexion.query(`
    SELECT hora_entrada
    FROM configuracion
    LIMIT 1
  `);

  if (
    configuracion.length === 0 ||
    !configuracion[0].hora_entrada
  ) {
    throw new Error(
      "No hay una hora de entrada configurada en el sistema"
    );
  }

  // ==========================================
  // CONVERTIR HORAS A SEGUNDOS
  // ==========================================
  const horaActualPartes = hora
    .split(":")
    .map(Number);

  const horaEntradaTexto = String(
    configuracion[0].hora_entrada
  ).substring(0, 8);

  const horaEntradaPartes = horaEntradaTexto
    .split(":")
    .map(Number);

  const segundosHoraActual =
    (horaActualPartes[0] * 3600) +
    (horaActualPartes[1] * 60) +
    horaActualPartes[2];

  const segundosHoraEntrada =
    (horaEntradaPartes[0] * 3600) +
    (horaEntradaPartes[1] * 60) +
    horaEntradaPartes[2];

  // ==========================================
  // VALIDAR LLEGADA TARDE
  // ==========================================
  if (segundosHoraActual <= segundosHoraEntrada) {
    throw new Error(
      `No se puede registrar una llegada tarde todavía. ` +
      `La hora de entrada es ${horaEntradaTexto} y la hora actual es ${hora}.`
    );
  }

  // ==========================================
  // CONTAR LLEGADAS DEL MES
  // ==========================================
  const [conteo] = await conexion.query(
    `
      SELECT COUNT(*) AS total
      FROM llegadas_tarde
      WHERE id_estudiante = ?
        AND fecha >= DATE_FORMAT(?, '%Y-%m-01')
        AND fecha < DATE_ADD(
          DATE_FORMAT(?, '%Y-%m-01'),
          INTERVAL 1 MONTH
        )
    `,
    [id_estudiante, fecha, fecha]
  );

  const totalMes = Number(conteo[0].total) + 1;

  // ==========================================
  // CALCULAR GRUPO DE ALERTA
  //
  // 1,2,3   = grupo 1
  // 4,5,6   = grupo 2
  // 7,8,9   = grupo 3
  // ==========================================
  const grupoAlerta = Math.ceil(totalMes / 3);

  // ==========================================
  // POSICION DENTRO DEL GRUPO
  //
  // 1 = Normal
  // 2 = Seguimiento
  // 3 = Generar alerta
  // ==========================================
  const posicionGrupo = ((totalMes - 1) % 3) + 1;

  const generaAlerta = posicionGrupo === 3 ? 1 : 0;

  const estadoAlerta =
    posicionGrupo === 3
      ? "Pendiente"
      : "Atendida";

  // ==========================================
  // INSERTAR NUEVA LLEGADA
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
        grupo_alerta,
        genero_alerta,
        estado_alerta
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id_estudiante,
      fecha,
      hora,
      observacion || null,
      totalMes,
      grupoAlerta,
      generaAlerta,
      estadoAlerta,
    ]
  );

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

  const [anterior] = await conexion.query(
    `
      SELECT
        id_estudiante,
        fecha
      FROM llegadas_tarde
      WHERE id_llegada = ?
    `,
    [id]
  );

  if (anterior.length === 0) {
    throw new Error("Llegada tarde no encontrada");
  }

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
    ]
  );

  return resultado;
};


// ==========================================
// ELIMINAR LLEGADA
// ==========================================
const eliminarLlegada = async (id) => {
  const [llegada] = await conexion.query(
    `
      SELECT
        id_estudiante,
        fecha
      FROM llegadas_tarde
      WHERE id_llegada = ?
    `,
    [id]
  );

  if (llegada.length === 0) {
    throw new Error("Llegada tarde no encontrada");
  }

  await conexion.query(
    `
      DELETE FROM llegadas_tarde
      WHERE id_llegada = ?
    `,
    [id]
  );

  return {
    mensaje: "Llegada eliminada correctamente",
  };
};


// ==========================================
// CONTAR LLEGADAS DE UN ESTUDIANTE
// ==========================================
const contarLlegadasEstudiante = async (
  id_estudiante,
  fecha = null
) => {
  let fechaReferencia = fecha;

  if (!fechaReferencia) {
    const ahora = new Date();

    fechaReferencia =
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Bogota",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(ahora);
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
    ]
  );

  return Number(rows[0].total);
};


// ==========================================
// ACTUALIZAR TOTALES DEL MES
// ==========================================
// Se conserva por compatibilidad.
// YA NO modifica los registros anteriores.
// ==========================================
const actualizarTotalesMes = async (
  id_estudiante,
  fecha
) => {
  return true;
};


// ==========================================
// MARCAR ALERTA COMO REVISADA
// SOLO AFECTA EL GRUPO CORRESPONDIENTE
// ==========================================
const marcarAlertaRevisada = async (
  id_estudiante,
  fecha
) => {
  const [registro] = await conexion.query(
    `
      SELECT grupo_alerta
      FROM llegadas_tarde
      WHERE id_estudiante = ?
        AND fecha = ?
      ORDER BY id_llegada DESC
      LIMIT 1
    `,
    [
      id_estudiante,
      fecha,
    ]
  );

  if (registro.length === 0) {
    return;
  }

  const grupo = registro[0].grupo_alerta;

  await conexion.query(
    `
      UPDATE llegadas_tarde
      SET estado_alerta = 'Atendida'
      WHERE id_estudiante = ?
        AND grupo_alerta = ?
    `,
    [
      id_estudiante,
      grupo,
    ]
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

