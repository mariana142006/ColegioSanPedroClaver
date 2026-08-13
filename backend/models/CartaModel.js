const conexion = require("../database/conexion");

// Obtener todas las cartas
const obtenerCartas = async () => {
  const [rows] = await conexion.query(`
    
    SELECT
      c.id_carta,
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

//Crear carta
const crearCarta = async (datos) => {
  const {
    id_estudiante,
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
      tipo,
      numero_reporte,
      fecha_generacion,
      archivo_pdf,
      observacion
    )

    VALUES (?,?,?,?,?,?)

    `,
    [
      id_estudiante,
      tipo,
      numero_reporte,
      fecha_generacion,
      archivo_pdf,
      observacion,
    ],
  );

  return resultado;
};

const obtenerSiguienteNumero = async () => {
  const [rows] = await conexion.query(`
    SELECT COUNT(*) AS total
    FROM cartas
  `);

  const numero = rows[0].total + 1;

  return numero.toString().padStart(4, "0");
};

module.exports = {
  obtenerCartas,
  crearCarta,
  obtenerSiguienteNumero,
};
