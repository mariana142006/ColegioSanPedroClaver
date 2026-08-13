const conexion = require("../database/conexion");

// =====================================================
// LISTAR ESTUDIANTES
// =====================================================

const obtenerEstudiantes = async () => {
  const [rows] = await conexion.query(`
    SELECT 
      e.id_estudiante,
      e.documento,
      e.nombres,
      e.grado,
      e.telefono_acudiente,
      e.nombre_acudiente,
      e.id_director,
      e.estado,
      d.nombre_director,
      d.grupo
    FROM estudiantes e
    LEFT JOIN directores_grupo d
      ON e.id_director = d.id_director
    ORDER BY e.id_estudiante DESC
  `);

  return rows;
};

// =====================================================
// CREAR ESTUDIANTE
// =====================================================

const crearEstudiante = async (datos) => {
  const {
    documento,
    nombres,
    grado,
    telefono_acudiente,
    nombre_acudiente,
    estado,
  } = datos;

  // Buscar si ya existe el documento

  const [existente] = await conexion.query(
    `
    SELECT id_estudiante
    FROM estudiantes
    WHERE documento = ?
    LIMIT 1
    `,
    [documento],
  );

  if (existente.length > 0) {
    throw new Error("Ya existe un estudiante con ese documento");
  }

  // Buscar director del grupo

  const [directores] = await conexion.query(
    `
    SELECT id_director
    FROM directores_grupo
    WHERE grupo = ?
    AND estado = 'Activo'
    LIMIT 1
    `,
    [grado],
  );

  if (directores.length === 0) {
    throw new Error(`No existe un director asignado al grupo ${grado}`);
  }

  const id_director = directores[0].id_director;

  // Crear estudiante

  const [resultado] = await conexion.query(
    `
    INSERT INTO estudiantes
    (
      documento,
      nombres,
      grado,
      telefono_acudiente,
      nombre_acudiente,
      id_director,
      estado
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      documento,
      nombres,
      grado,
      telefono_acudiente,
      nombre_acudiente,
      id_director,
      estado || "Activo",
    ],
  );

  return resultado;
};

// =====================================================
// ACTUALIZAR ESTUDIANTE
// =====================================================

const actualizarEstudiante = async (id, datos) => {
  const {
    documento,
    nombres,
    grado,
    telefono_acudiente,
    nombre_acudiente,
    estado,
  } = datos;

  // Verificar documento duplicado
  // excepto el estudiante que estamos editando

  const [existente] = await conexion.query(
    `
    SELECT id_estudiante
    FROM estudiantes
    WHERE documento = ?
    AND id_estudiante != ?
    LIMIT 1
    `,
    [documento, id],
  );

  if (existente.length > 0) {
    throw new Error("Ya existe otro estudiante con ese documento");
  }

  // Buscar director del nuevo grupo

  const [directores] = await conexion.query(
    `
    SELECT id_director
    FROM directores_grupo
    WHERE grupo = ?
    AND estado = 'Activo'
    LIMIT 1
    `,
    [grado],
  );

  if (directores.length === 0) {
    throw new Error(`No existe un director asignado al grupo ${grado}`);
  }

  const id_director = directores[0].id_director;

  // Actualizar

  const [resultado] = await conexion.query(
    `
    UPDATE estudiantes
    SET
      documento = ?,
      nombres = ?,
      grado = ?,
      telefono_acudiente = ?,
      nombre_acudiente = ?,
      id_director = ?,
      estado = ?
    WHERE id_estudiante = ?
    `,
    [
      documento,
      nombres,
      grado,
      telefono_acudiente,
      nombre_acudiente,
      id_director,
      estado,
      id,
    ],
  );

  return resultado;
};

// =====================================================
// ELIMINAR ESTUDIANTE
// =====================================================

const eliminarEstudiante = async (id) => {
  const [resultado] = await conexion.query(
    `
    UPDATE estudiantes
    SET estado = 'Inactivo'
    WHERE id_estudiante = ?
    `,
    [id],
  );

  return resultado;
};

const activarEstudiante = async (id) => {
  const [resultado] = await conexion.query(
    `
    UPDATE estudiantes
    SET estado = 'Activo'
    WHERE id_estudiante = ?
    `,
    [id],
  );

  return resultado;
};

module.exports = {
  obtenerEstudiantes,
  crearEstudiante,
  actualizarEstudiante,
  eliminarEstudiante,
  activarEstudiante,
};
