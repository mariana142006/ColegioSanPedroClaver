const conexion = require("../database/conexion");

// ==========================================
// OBTENER TODAS LAS CARTAS
// ==========================================
const obtenerCartas = async () => {
  const [rows] = await conexion.query(`
    SELECT
      c.id_carta,
      c.id_estudiante,
      c.grupo_alerta,
      c.tipo,
      c.numero_reporte,
      c.fecha_generacion,
      c.archivo_pdf,
      c.observacion,
      e.nombres,
      e.documento,
      e.grado
    FROM cartas c
    INNER JOIN estudiantes e
      ON c.id_estudiante = e.id_estudiante
    ORDER BY c.id_carta DESC
  `);

  return rows;
};

// ==========================================
// CREAR CARTA
// ==========================================
const crearCarta = async (datos) => {
  const {
    id_estudiante,
    grupo_alerta,
    tipo,
    numero_reporte,
    fecha_generacion,
    archivo_pdf,
    observacion,
  } = datos;

  const [resultado] = await conexion.query(
    `
    INSERT INTO cartas
    (
      id_estudiante,
      grupo_alerta,
      tipo,
      numero_reporte,
      fecha_generacion,
      archivo_pdf,
      observacion
    )
    VALUES (?,?,?,?,?,?,?)
    `,
    [
      id_estudiante,
      grupo_alerta,
      tipo,
      numero_reporte,
      fecha_generacion,
      archivo_pdf,
      observacion,
    ]
  );

  return resultado;
};

// ==========================================
// OBTENER SIGUIENTE NÚMERO DE REPORTE
// ==========================================
const obtenerSiguienteNumero = async () => {
  const [rows] = await conexion.query(`
    SELECT COUNT(*) AS total
    FROM cartas
  `);

  const numero = Number(rows[0].total) + 1;

  return numero.toString().padStart(4, "0");
};

// ==========================================
// ELIMINAR CARTA / REPORTE
// ==========================================
const eliminarCarta = async (id) => {
  const [resultado] = await conexion.query(
    `
    DELETE FROM cartas
    WHERE id_carta = ?
    `,
    [id]
  );

  return resultado;
};

module.exports = {
  obtenerCartas,
  crearCarta,
  obtenerSiguienteNumero,
  eliminarCarta,
};
