const conexion = require("../database/conexion");

// Obtener configuración
const obtenerConfiguracion = async () => {
  const [rows] = await conexion.query(
    `
        SELECT *
        FROM configuracion
        LIMIT 1
        `,
  );

  return rows[0];
};

// Crear o actualizar configuración
const guardarConfiguracion = async (datos) => {
  const {
    nombre_colegio,
    año_lectivo,
    hora_entrada,
    rector,
    coordinador,
    logo,
  } = datos;

  const existente = await obtenerConfiguracion();

  if (existente) {
    const [resultado] = await conexion.query(
      `
            UPDATE configuracion SET

            nombre_colegio=?,
            año_lectivo=?,
            hora_entrada=?,
            rector=?,
            coordinador=?,
            logo=?

            WHERE id_configuracion=?

            `,
      [
        nombre_colegio,
        año_lectivo,
        hora_entrada,
        rector,
        coordinador,
        logo,
        existente.id_configuracion,
      ],
    );

    return resultado;
  } else {
    const [resultado] = await conexion.query(
      `
            INSERT INTO configuracion
            (
                nombre_colegio,
                año_lectivo,
                hora_entrada,
                rector,
                coordinador,
                logo
            )

            VALUES (?,?,?,?,?,?)

            `,
      [nombre_colegio, año_lectivo, hora_entrada, rector, coordinador, logo],
    );

    return resultado;
  }
};

module.exports = {
  obtenerConfiguracion,
  guardarConfiguracion,
};
