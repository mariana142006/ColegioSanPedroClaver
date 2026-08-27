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
        CAST(SUBSTRING_INDEX(d.grupo, '-', -1) AS UNSIGNED),
        d.estado DESC,
        d.nombre_director
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
      `
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
      WHERE d.id_director = ?
      GROUP BY
        d.id_director,
        d.nombre_director,
        d.grupo,
        d.estado
      `,
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
  let conexionDB;

  try {
    const { nombre_director, grupo } = req.body;

    if (!nombre_director || !grupo) {
      return res.status(400).json({
        mensaje: "El nombre del director y el grupo son obligatorios",
      });
    }

    conexionDB = await conexion.getConnection();

    await conexionDB.beginTransaction();

    // ==========================================
    // VERIFICAR DIRECTOR ACTIVO DEL GRUPO
    // ==========================================

    const [existente] = await conexionDB.query(
      `
      SELECT
        id_director,
        nombre_director
      FROM directores_grupo
      WHERE grupo = ?
      AND estado = 'Activo'
      LIMIT 1
      `,
      [grupo],
    );

    if (existente.length > 0) {
      await conexionDB.rollback();

      return res.status(400).json({
        mensaje: `El grupo ${grupo} ya tiene un director activo: ${existente[0].nombre_director}.`,
      });
    }

    // ==========================================
    // CREAR NUEVO DIRECTOR
    // ==========================================

    const [resultado] = await conexionDB.query(
      `
      INSERT INTO directores_grupo
      (
        nombre_director,
        grupo,
        estado,
        total_estudiantes
      )
      VALUES (?, ?, 'Activo', 0)
      `,
      [nombre_director, grupo],
    );

    const nuevoIdDirector = resultado.insertId;

    // ==========================================
    // ASIGNAR ESTUDIANTES ACTIVOS DEL GRUPO
    // ==========================================

    const [estudiantesReasignados] = await conexionDB.query(
      `
      UPDATE estudiantes
      SET id_director = ?
      WHERE grado = ?
      AND estado = 'Activo'
      `,
      [nuevoIdDirector, grupo],
    );

    const totalEstudiantes = estudiantesReasignados.affectedRows;

    // ==========================================
    // ACTUALIZAR TOTAL DEL NUEVO DIRECTOR
    // ==========================================

    await conexionDB.query(
      `
      UPDATE directores_grupo
      SET total_estudiantes = ?
      WHERE id_director = ?
      `,
      [totalEstudiantes, nuevoIdDirector],
    );

    await conexionDB.commit();

    res.status(201).json({
      mensaje: "Director agregado correctamente",
      id_director: nuevoIdDirector,
      estudiantes_reasignados: totalEstudiantes,
    });
  } catch (error) {
    if (conexionDB) {
      try {
        await conexionDB.rollback();
      } catch (rollbackError) {
        console.error("Error haciendo rollback:", rollbackError);
      }
    }

    console.error("Error agregando director:", error);

    res.status(500).json({
      mensaje: "Error al agregar el director",
    });
  } finally {
    if (conexionDB) {
      conexionDB.release();
    }
  }
};

// ==========================================
// ACTUALIZAR DIRECTOR
// ==========================================
const actualizarDirector = async (req, res) => {
  let conexionDB;

  try {
    const { id } = req.params;

    const {
      nombre_director,
      grupo,
      estado,
    } = req.body;

    if (!nombre_director || !grupo) {
      return res.status(400).json({
        mensaje: "El nombre del director y el grupo son obligatorios",
      });
    }

    conexionDB = await conexion.getConnection();

    await conexionDB.beginTransaction();

    // ==========================================
    // VERIFICAR QUE EL DIRECTOR EXISTA
    // ==========================================

    const [directorActual] = await conexionDB.query(
      `
      SELECT
        id_director,
        nombre_director,
        grupo,
        estado
      FROM directores_grupo
      WHERE id_director = ?
      LIMIT 1
      `,
      [id],
    );

    if (directorActual.length === 0) {
      await conexionDB.rollback();

      return res.status(404).json({
        mensaje: "Director no encontrado",
      });
    }

    const grupoAnterior = directorActual[0].grupo;
    const estadoAnterior = directorActual[0].estado;
    const nuevoEstado = estado || "Activo";

    // ==========================================
    // VERIFICAR DIRECTOR ACTIVO DEL NUEVO GRUPO
    // ==========================================

    if (nuevoEstado === "Activo") {
      const [otroActivo] = await conexionDB.query(
        `
        SELECT
          id_director,
          nombre_director
        FROM directores_grupo
        WHERE grupo = ?
        AND estado = 'Activo'
        AND id_director != ?
        LIMIT 1
        `,
        [grupo, id],
      );

      if (otroActivo.length > 0) {
        await conexionDB.rollback();

        return res.status(400).json({
          mensaje: `El grupo ${grupo} ya tiene un director activo: ${otroActivo[0].nombre_director}.`,
        });
      }
    }

    // ==========================================
    // ACTUALIZAR DIRECTOR
    // ==========================================

    await conexionDB.query(
      `
      UPDATE directores_grupo
      SET
        nombre_director = ?,
        grupo = ?,
        estado = ?
      WHERE id_director = ?
      `,
      [
        nombre_director,
        grupo,
        nuevoEstado,
        id,
      ],
    );

    // ==========================================
    // SI CAMBIÓ DE GRUPO
    // LOS ESTUDIANTES ACTIVOS DEL GRUPO ANTERIOR
    // QUEDAN SIN DIRECTOR HASTA QUE SE ASIGNE
    // ==========================================

    if (grupoAnterior !== grupo) {
      await conexionDB.query(
        `
        UPDATE estudiantes
        SET id_director = NULL
        WHERE id_director = ?
        AND grado = ?
        AND estado = 'Activo'
        `,
        [id, grupoAnterior],
      );
    }

    // ==========================================
    // SI EL DIRECTOR ESTÁ ACTIVO
    // ASIGNAR ESTUDIANTES ACTIVOS DEL NUEVO GRUPO
    // ==========================================

    if (nuevoEstado === "Activo") {
      await conexionDB.query(
        `
        UPDATE estudiantes
        SET id_director = ?
        WHERE grado = ?
        AND estado = 'Activo'
        `,
        [id, grupo],
      );
    }

    // ==========================================
    // SI SE DESACTIVA
    // LOS ESTUDIANTES NO SE ELIMINAN
    // Y SE CONSERVA SU HISTORIAL
    // ==========================================

    if (nuevoEstado === "Inactivo" && estadoAnterior === "Activo") {
      // No modificamos los estudiantes.
      // El historial debe conservar el director asociado.
    }

    // ==========================================
    // ACTUALIZAR TOTALES DE TODOS LOS DIRECTORES
    // ==========================================

    await conexionDB.query(`
      UPDATE directores_grupo d
      SET total_estudiantes = (
        SELECT COUNT(*)
        FROM estudiantes e
        WHERE e.id_director = d.id_director
        AND e.estado = 'Activo'
      )
    `);

    await conexionDB.commit();

    res.json({
      mensaje:
        nuevoEstado === "Inactivo"
          ? "Director desactivado correctamente"
          : "Director actualizado correctamente",
    });
  } catch (error) {
    if (conexionDB) {
      try {
        await conexionDB.rollback();
      } catch (rollbackError) {
        console.error("Error haciendo rollback:", rollbackError);
      }
    }

    console.error("Error actualizando director:", error);

    res.status(500).json({
      mensaje: "Error al actualizar el director",
    });
  } finally {
    if (conexionDB) {
      conexionDB.release();
    }
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

    if (totalEstudiantes > 0) {
      return res.status(400).json({
        mensaje: `No se puede eliminar este director porque tiene ${totalEstudiantes} estudiante(s) asociado(s). El director debe permanecer como parte del historial.`,
      });
    }

    // ==========================================
    // ELIMINAR
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
// EXPORTAR
// ==========================================
module.exports = {
  obtenerDirectores,
  obtenerDirector,
  agregarDirector,
  actualizarDirector,
  eliminarDirector,
};
