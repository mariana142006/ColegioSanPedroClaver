const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Usuario = require("../models/UsuarioModel");
const conexion = require("../database/conexion");

// ==========================================
// LISTAR USUARIOS
// ==========================================
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.obtenerUsuarios();

    res.json(usuarios);
  } catch (error) {
    console.log("ERROR LISTANDO USUARIOS:", error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

// ==========================================
// CREAR USUARIO
// ==========================================
const crearUsuario = async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol = "Director" } = req.body;

    if (!nombre || !correo || !contraseña || !rol) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios",
      });
    }

    const rolesPermitidos = ["Administrador", "Coordinador", "Director"];
    if (!rolesPermitidos.includes(rol)) {
      return res
        .status(400)
        .json({ mensaje: "El rol seleccionado no es válido" });
    }

    const existe = await Usuario.obtenerUsuarioPorCorreo(correo);

    if (existe) {
      return res.status(400).json({
        mensaje: "El correo ya está registrado",
      });
    }

    const passwordHash = await bcrypt.hash(contraseña, 10);

    await Usuario.crearUsuario(nombre, correo, passwordHash, rol);

    res.status(201).json({
      mensaje: "Usuario creado correctamente",
    });
  } catch (error) {
    console.log("ERROR CREANDO USUARIO:", error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

// ==========================================
// LOGIN
// ==========================================
// ==========================================
// INICIAR SESIÓN
// ==========================================

// ==========================================
// INICIAR SESIÓN
// ==========================================

const iniciarSesion = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({
        mensaje: "El correo y la contraseña son obligatorios",
      });
    }

    const usuario = await Usuario.obtenerUsuarioPorCorreo(correo);

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos",
      });
    }

    if (usuario.estado !== "Activo") {
      return res.status(403).json({
        mensaje: "Este usuario está inactivo",
      });
    }

    const contraseñaCorrecta = await bcrypt.compare(
      contraseña,
      usuario.contraseña,
    );

    if (!contraseñaCorrecta) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos",
      });
    }

    // Crear token de seguridad
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      },
    );

    res.json({
      mensaje: "Inicio de sesión correcto",

      token,

      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.log("ERROR INICIANDO SESIÓN:");
    console.log(error);

    res.status(500).json({
      mensaje: "Error al iniciar sesión",
    });
  }
};
// ==========================================
// EDITAR USUARIO
// ==========================================

const editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const { nombre, correo, contraseña, rol } = req.body;

    // ==========================================
    // VALIDAR ROL
    // ==========================================

    const rolesPermitidos = ["Administrador", "Coordinador", "Director"];

    if (!rolesPermitidos.includes(rol)) {
      return res.status(400).json({
        mensaje: "El rol seleccionado no es válido",
      });
    }

    // ==========================================
    // ENCRIPTAR NUEVA CONTRASEÑA
    // ==========================================

    let passwordHash = null;

    if (contraseña) {
      passwordHash = await bcrypt.hash(contraseña, 10);
    }

    // ==========================================
    // ACTUALIZAR USUARIO
    // ==========================================

    if (passwordHash) {
      await conexion.query(
        `
                UPDATE usuarios
                SET nombre=?,
                    correo=?,
                    contraseña=?,
                    rol=?
                WHERE id_usuario=?
                `,
        [nombre, correo, passwordHash, rol, id],
      );
    } else {
      await conexion.query(
        `
                UPDATE usuarios
                SET nombre=?,
                    correo=?,
                    rol=?
                WHERE id_usuario=?
                `,
        [nombre, correo, rol, id],
      );
    }

    res.json({
      mensaje: "Usuario actualizado correctamente",
    });
  } catch (error) {
    console.log("ERROR ACTUALIZANDO USUARIO:");
    console.log(error);

    res.status(500).json({
      mensaje: "Error actualizando usuario",
    });
  }
};

// ==========================================
// DESACTIVAR USUARIO
// ==========================================
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    await Usuario.eliminarUsuario(id);

    res.json({
      mensaje: "Usuario desactivado correctamente",
    });
  } catch (error) {
    console.log("ERROR DESACTIVANDO USUARIO:", error);

    res.status(500).json({
      mensaje: "Error desactivando usuario",
    });
  }
};

module.exports = {
  listarUsuarios,
  crearUsuario,
  iniciarSesion,
  eliminarUsuario,
  editarUsuario,
};
