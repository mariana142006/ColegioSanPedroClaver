const conexion = require("../database/conexion");

// ==========================================
// OBTENER TODOS LOS USUARIOS
// ==========================================
const obtenerUsuarios = async () => {
  const [rows] = await conexion.query(`
    SELECT
      id_usuario,
      nombre,
      correo,
      rol,
      estado,
      fecha_creacion
    FROM usuarios
    ORDER BY id_usuario DESC
  `);

  return rows;
};

// ==========================================
// OBTENER USUARIO POR CORREO
// ==========================================
const obtenerUsuarioPorCorreo = async (correo) => {
  const [rows] = await conexion.query(
    `
    SELECT *
    FROM usuarios
    WHERE correo = ?
    LIMIT 1
    `,
    [correo]
  );

  return rows[0];
};

// ==========================================
// CREAR USUARIO
// ==========================================
const crearUsuario = async (
  nombre,
  correo,
  contraseña,
  rol
) => {
  const [resultado] = await conexion.query(
    `
    INSERT INTO usuarios
    (
      nombre,
      correo,
      contraseña,
      rol,
      fecha_creacion,
      estado
    )
    VALUES (?, ?, ?, ?, NOW(), 'Activo')
    `,
    [
      nombre,
      correo,
      contraseña,
      rol,
    ]
  );

  return resultado;
};

// ==========================================
// ACTUALIZAR USUARIO
// ==========================================
const actualizarUsuario = async (
  id,
  nombre,
  correo,
  contraseña,
  rol,
  estado
) => {
  let resultado;

  if (contraseña) {
    [resultado] = await conexion.query(
      `
      UPDATE usuarios
      SET
        nombre=?,
        correo=?,
        contraseña=?,
        rol=?,
        estado=?
      WHERE id_usuario=?
      `,
      [
        nombre,
        correo,
        contraseña,
        rol,
        estado,
        id,
      ]
    );
  } else {
    [resultado] = await conexion.query(
      `
      UPDATE usuarios
      SET
        nombre=?,
        correo=?,
        rol=?,
        estado=?
      WHERE id_usuario=?
      `,
      [
        nombre,
        correo,
        rol,
        estado,
        id,
      ]
    );
  }

  return resultado;
};

// ==========================================
// DESACTIVAR USUARIO
// ==========================================
const eliminarUsuario = async (id) => {
  const [resultado] = await conexion.query(
    `
    UPDATE usuarios
    SET estado='Inactivo'
    WHERE id_usuario=?
    `,
    [id]
  );

  return resultado;
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorCorreo,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};