const conexion = require("../database/conexion");

// ==========================================
// OBTENER ESTADÍSTICAS DEL DASHBOARD
// ==========================================

const obtenerEstadisticas = async () => {
  // ==========================================
  // TOTAL DE USUARIOS ACTIVOS
  // ==========================================

  const [usuarios] = await conexion.query(`
    SELECT COUNT(*) AS total
    FROM usuarios
    WHERE estado = 'Activo'
  `);

  // ==========================================
  // TOTAL DE ESTUDIANTES ACTIVOS
  // ==========================================

  const [estudiantes] = await conexion.query(`
    SELECT COUNT(*) AS total
    FROM estudiantes
    WHERE estado = 'Activo'
  `);

  // ==========================================
  // LLEGADAS TARDE DEL MES ACTUAL
  // ==========================================

  const [llegadas] = await conexion.query(`
    SELECT COUNT(*) AS total
    FROM llegadas_tarde
    WHERE MONTH(fecha) = MONTH(CURDATE())
      AND YEAR(fecha) = YEAR(CURDATE())
  `);

  // ==========================================
  // INASISTENCIAS DEL MES ACTUAL
  // ==========================================

  const [inasistencias] = await conexion.query(`
    SELECT COUNT(*) AS total
    FROM inasistencias
    WHERE MONTH(fecha) = MONTH(CURDATE())
      AND YEAR(fecha) = YEAR(CURDATE())
  `);

  // ==========================================
  // DATOS MENSUALES DEL AÑO ACTUAL
  // ==========================================

  const [mensual] = await conexion.query(`
    SELECT
      MONTH(fecha) AS mes,

      SUM(tipo_registro = 'llegada') AS llegadas_tarde,

      SUM(tipo_registro = 'inasistencia') AS inasistencias

    FROM (

      SELECT
        fecha,
        'llegada' AS tipo_registro
      FROM llegadas_tarde

      WHERE YEAR(fecha) = YEAR(CURDATE())


      UNION ALL


      SELECT
        fecha,
        'inasistencia' AS tipo_registro
      FROM inasistencias

      WHERE YEAR(fecha) = YEAR(CURDATE())

    ) AS registros

    GROUP BY MONTH(fecha)

    ORDER BY MONTH(fecha)
  `);

  return {
    usuarios: Number(usuarios[0].total),

    estudiantes: Number(estudiantes[0].total),

    llegadas_tarde: Number(llegadas[0].total),

    inasistencias: Number(inasistencias[0].total),

    mensual,
  };
};

// ==========================================
// EXPORTAR
// ==========================================

module.exports = {
  obtenerEstadisticas,
};
