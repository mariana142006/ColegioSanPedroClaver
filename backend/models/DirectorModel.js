const conexion = require("../database/conexion");

const obtenerDirectores = async () => {
  const [rows] = await conexion.query(`
    SELECT
      id_director,
      nombre_director,
      grupo
    FROM directores_grupo
    ORDER BY nombre_director
  `);

  return rows;
};

module.exports = {
  obtenerDirectores,
};