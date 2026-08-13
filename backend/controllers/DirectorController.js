const conexion = require("../database/conexion");

// ==========================================
// OBTENER TODOS LOS DIRECTORES
// ==========================================
const obtenerDirectores = async (req, res) => {
  try {
    const [directores] = await conexion.query(`
  SELECT 
    d.id_director,
    d.nombre_director,
    d.grupo,
    d.estado,
    COUNT(
      CASE 
        WHEN e.estado = 'Activo' THEN e.id_estudiante
      END
    ) AS total_estudiantes
  FROM directores_grupo AS d
  LEFT JOIN estudiantes AS e
    ON d.id_director = e.id_director
  GROUP BY 
    d.id_director,
    d.nombre_director,
    d.grupo,
    d.estado
  ORDER BY 
    CAST(SUBSTRING_INDEX(d.grupo, '-', 1) AS UNSIGNED),
    CAST(SUBSTRING_INDEX(d.grupo, '-', -1) AS UNSIGNED)
`);

    res.json(directores);
  } catch (error) {
    console.error("Error obteniendo directores:", error);
    res.status(500).json({
      mensaje: "Error al obtener los directores",
    });
  }
};
// ==========================================
// OBTENER UN DIRECTOR POR ID
// ==========================================
const obtenerDirector = async (req, res) => {
  try {
    const { id } = req.params;

    const [directores] = await conexion.query(
      `SELECT 
                id_director,
                nombre_director,
                grupo,
                estado,
                total_estudiantes
             FROM directores_grupo
             WHERE id_director = ?`,
      [id],
    );

    if (directores.length === 0) {
      return res.status(404).json({
        mensaje: "Director no encontrado",
      });
    }

    res.json(directores[0]);
  } catch (error) {
    console.error("Error obteniendo director:", error);
    res.status(500).json({
      mensaje: "Error al obtener el director",
    });
  }
};

// ==========================================
// AGREGAR DIRECTOR
// ==========================================
const agregarDirector = async (req, res) => {
  try {
    const { nombre_director, grupo, estado } = req.body;

    if (!nombre_director || !grupo) {
      return res.status(400).json({
        mensaje: "El nombre del director y el grupo son obligatorios",
      });
    }

    // Verificar si el grupo ya tiene director
    const [existente] = await conexion.query(
      `
      SELECT id_director
      FROM directores_grupo
      WHERE grupo = ?
      LIMIT 1
      `,
      [grupo],
    );

    if (existente.length > 0) {
      return res.status(400).json({
        mensaje: `El grupo ${grupo} ya tiene un director asignado`,
      });
    }

    const [resultado] = await conexion.query(
      `
      INSERT INTO directores_grupo
      (
        nombre_director,
        grupo,
        estado || "Activo",
        total_estudiantes
      )
      VALUES (?, ?, ?, 0)
      `,
      [nombre_director, grupo, estado || "Activo"],
    );

    res.status(201).json({
      mensaje: "Director agregado correctamente",
      id_director: resultado.insertId,
    });
  } catch (error) {
    console.error("Error agregando director:", error);

    res.status(500).json({
      mensaje: "Error al agregar el director",
    });
  }
};

// ==========================================
// ACTUALIZAR DIRECTOR
// ==========================================
const actualizarDirector = async (req, res) => {
  try {
    const { id } = req.params;

    const { nombre_director, grupo, total_estudiantes, estado } = req.body;

    if (!nombre_director || !grupo) {
      return res.status(400).json({
        mensaje: "El nombre del director y el grupo son obligatorios",
      });
    }

    // Verificar que el grupo no esté asignado a otro director
    const [existente] = await conexion.query(
      `
      SELECT id_director
      FROM directores_grupo
      WHERE grupo = ?
      AND id_director != ?
      LIMIT 1
      `,
      [grupo, id],
    );

    if (existente.length > 0) {
      return res.status(400).json({
        mensaje: `El grupo ${grupo} ya tiene otro director asignado`,
      });
    }

    // Verificar que no tenga estudiantes activos antes de desactivar
    if (estado === "Inactivo") {
      const [estudiantesActivos] = await conexion.query(
        `
        SELECT COUNT(*) AS total
        FROM estudiantes
        WHERE id_director = ?
        AND estado = 'Activo'
        `,
        [id],
      );

      if (estudiantesActivos[0].total > 0) {
        return res.status(400).json({
          mensaje: `No se puede desactivar este director porque tiene ${estudiantesActivos[0].total} estudiante(s) activo(s) asignado(s).`,
        });
      }
    }

    // Actualizar director
    const [resultado] = await conexion.query(
      `
      UPDATE directores_grupo
      SET
        nombre_director = ?,
        grupo = ?,
        total_estudiantes = ?,
        estado = ?
      WHERE id_director = ?
      `,
      [nombre_director, grupo, total_estudiantes || 0, estado || "Activo", id],
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Director no encontrado",
      });
    }

    res.json({
      mensaje: "Director actualizado correctamente",
    });
  } catch (error) {
    console.error("Error actualizando director:", error);

    res.status(500).json({
      mensaje: "Error al actualizar el director",
    });
  }
};

// ==========================================
// ELIMINAR DIRECTOR
// ==========================================
const eliminarDirector = async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================================
    // VERIFICAR SI TIENE ESTUDIANTES
    // ==========================================

    const [estudiantes] = await conexion.query(
      `
      SELECT COUNT(*) AS total
      FROM estudiantes
      WHERE id_director = ?
      `,
      [id],
    );

    const totalEstudiantes = Number(estudiantes[0].total);

    console.log(
      `Director ${id} tiene ${totalEstudiantes} estudiante(s) asignado(s)`,
    );

    // ==========================================
    // NO PERMITIR ELIMINAR SI TIENE ESTUDIANTES
    // ==========================================

    if (totalEstudiantes > 0) {
      return res.status(400).json({
        mensaje: `No se puede eliminar este director porque tiene ${totalEstudiantes} estudiante(s) asignado(s). Primero debe reasignar esos estudiantes a otro director.`,
      });
    }

    // ==========================================
    // ELIMINAR DIRECTOR
    // ==========================================

    const [resultado] = await conexion.query(
      `
      DELETE FROM directores_grupo
      WHERE id_director = ?
      `,
      [id],
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Director no encontrado",
      });
    }

    res.json({
      mensaje: "Director eliminado correctamente",
    });
  } catch (error) {
    console.error("Error eliminando director:", error);

    res.status(500).json({
      mensaje: "Error al eliminar el director",
    });
  }
};

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================
module.exports = {
  obtenerDirectores,
  obtenerDirector,
  agregarDirector,
  actualizarDirector,
  eliminarDirector,
};
