import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/usuarios.css";
import ModalForm from "../components/ui/Modal";
import Swal from "sweetalert2";

import { FaEdit, FaTrash } from "react-icons/fa";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    contraseña: "",
    rol: "Director",
  });

  const cargarUsuarios = async () => {
    try {
      const respuesta = await api.get("/usuarios");
      setUsuarios(respuesta.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter((usuario) => {
    return (
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.correo.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();

    try {
      await api.post("/usuarios", formulario);

      Swal.fire({
        title: "¡Usuario creado!",
        text: "El usuario fue registrado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      setFormulario({
        nombre: "",
        correo: "",
        contraseña: "",
      });

      setMostrarFormulario(false);

      cargarUsuarios();
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Error",
        text: "No se pudo crear el usuario.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  const eliminarUsuario = async (id) => {
    const resultado = await Swal.fire({
      title: "¿Eliminar usuario?",

      text: "Esta acción no se puede deshacer",

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Sí, eliminar",

      cancelButtonText: "Cancelar",
    });

    if (!resultado.isConfirmed) {
      return;
    }

    try {
      await api.delete(`/usuarios/${id}`);

      Swal.fire({
        title: "Eliminado",

        text: "Usuario eliminado correctamente",

        icon: "success",

        timer: 1500,

        showConfirmButton: false,
      });

      cargarUsuarios();
    } catch (error) {
      Swal.fire("Error", "No se pudo eliminar el usuario", "error");
    }
  };

  const guardarEdicion = async () => {
    try {
      await api.put(`/usuarios/${usuarioEditar.id_usuario}`, usuarioEditar);

      setUsuarioEditar(null);

      cargarUsuarios();

      Swal.fire({
        title: "¡Actualizado!",
        text: "El usuario fue actualizado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el usuario.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  return (
    <div className="usuarios-container">
      {/* 1. Header en formato columna */}
      <div className="usuario-header">
        <h2 className="fw-bold">Gestión de Usuarios</h2>
        <p className="text-muted mb-3">
          Administra los usuarios del sistema del Colegio San Pedro Claver
        </p>
      </div>

      {/* 3. Modal Form para nuevo usuario */}
      <ModalForm
        mostrar={mostrarFormulario}
        cerrar={() => setMostrarFormulario(false)}
        titulo="Nuevo Usuario"
        guardar={guardarUsuario}
      >
        <input
          className="form-control mb-3"
          name="nombre"
          placeholder="Nombre completo"
          value={formulario.nombre}
          onChange={manejarCambio}
        />
        <input
          className="form-control mb-3"
          name="correo"
          placeholder="Correo electrónico"
          value={formulario.correo}
          onChange={manejarCambio}
        />
        <input
          className="form-control mb-3"
          type="password"
          name="contraseña"
          placeholder="Contraseña"
          value={formulario.contraseña}
          onChange={manejarCambio}
        />

        <select
          className="form-select mb-3"
          name="rol"
          value={formulario.rol}
          onChange={manejarCambio}
        >
          <option value="Administrador">Administrador</option>
          <option value="Coordinador">Coordinador</option>
          <option value="Director">Director</option>
        </select>
      </ModalForm>

      {/* 4. Tabla ocupando todo el ancho abajo */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold mb-1">Usuarios registrados</h5>

          <small className="text-muted">
            Total: {usuarios.length} usuarios
          </small>
        </div>

        <input
          className="form-control"
          style={{
            width: "300px",
          }}
          placeholder="🔍 Buscar usuario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      <div className="tabla-usuarios-container">
        <div>
          <button
            className="btn btn-naranja px-4"
            onClick={() => setMostrarFormulario(true)}
          >
            + Nuevo Usuario
          </button>
        </div>
        <table className="table table-striped mb-0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha creación</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {usuariosFiltrados.map((usuario) => (
              <tr key={usuario.id_usuario}>
                <td>{usuario.nombre}</td>

                <td>{usuario.correo}</td>

                <td>
                  <span
                    className={`badge ${
                      usuario.rol === "Administrador"
                        ? "bg-danger"
                        : usuario.rol === "Coordinador"
                          ? "bg-primary"
                          : "bg-secondary"
                    }`}
                  >
                    {usuario.rol || "Sin rol"}
                  </span>
                </td>

                <td>
                  <span className="badge bg-success">{usuario.estado}</span>
                </td>

                <td>
                  {usuario.fecha_creacion
                    ? new Date(usuario.fecha_creacion).toLocaleDateString()
                    : "Sin fecha"}
                </td>

                <td>
                  <button
                    className="btn btn-outline-primary me-2"
                    title="Editar usuario"
                    onClick={() => setUsuarioEditar(usuario)}
                  >
                    <FaEdit />
                  </button>

                  <button
                    className="btn btn-outline-danger"
                    title="Eliminar usuario"
                    onClick={() => eliminarUsuario(usuario.id_usuario)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Modal Editar Usuario */}
      {usuarioEditar && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-white">Editar usuario</h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setUsuarioEditar(null)}
                ></button>
              </div>

              <div className="modal-body">
                <input
                  className="form-control mb-3"
                  value={usuarioEditar.nombre}
                  onChange={(e) =>
                    setUsuarioEditar({
                      ...usuarioEditar,
                      nombre: e.target.value,
                    })
                  }
                />
                <input
                  className="form-control mb-3"
                  value={usuarioEditar.correo}
                  onChange={(e) =>
                    setUsuarioEditar({
                      ...usuarioEditar,
                      correo: e.target.value,
                    })
                  }
                />

                <select
                  className="form-select mb-3"
                  value={usuarioEditar.rol || "Director"}
                  onChange={(e) =>
                    setUsuarioEditar({
                      ...usuarioEditar,
                      rol: e.target.value,
                    })
                  }
                >
                  <option value="Administrador">Administrador</option>

                  <option value="Coordinador">Coordinador</option>

                  <option value="Director">Director</option>
                </select>
                <input
                  className="form-control mb-3"
                  type="password"
                  placeholder="Nueva contraseña"
                  onChange={(e) =>
                    setUsuarioEditar({
                      ...usuarioEditar,
                      contraseña: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setUsuarioEditar(null)}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={guardarEdicion}>
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;
