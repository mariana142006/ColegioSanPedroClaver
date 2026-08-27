import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { FaEdit, FaPowerOff } from "react-icons/fa";
import "../styles/usuarios.css";

function Directores() {
  const [directores, setDirectores] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [editar, setEditar] = useState(false);

  const [idEditar, setIdEditar] = useState(null);

  const [formulario, setFormulario] = useState({
    nombre_director: "",
    grupo: "",
    estado: "Activo",
  });

  // ==========================================
  // CARGAR DIRECTORES
  // ==========================================

  const cargarDirectores = async () => {
    try {
      const respuesta = await api.get("/directores");

      setDirectores(respuesta.data);
    } catch (error) {
      console.log("Error cargando directores:", error);

      Swal.fire(
        "Error",
        "No se pudieron cargar los directores de grupo",
        "error",
      );
    }
  };

  useEffect(() => {
    cargarDirectores();
  }, []);

  // ==========================================
  // CAMBIAR FORMULARIO
  // ==========================================

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // ABRIR FORMULARIO NUEVO
  // ==========================================

  const nuevoDirector = () => {
    setEditar(false);
    setIdEditar(null);

    setFormulario({
      nombre_director: "",
      grupo: "",
      estado: "Activo",
    });

    setMostrarFormulario(true);
  };

  // ==========================================
  // GUARDAR
  // ==========================================

  const guardarDirector = async (e) => {
    e.preventDefault();

    if (!formulario.nombre_director.trim()) {
      Swal.fire(
        "Campo obligatorio",
        "Ingrese el nombre del director",
        "warning",
      );
      return;
    }

    if (!formulario.grupo.trim()) {
      Swal.fire("Campo obligatorio", "Ingrese el grupo", "warning");
      return;
    }

    try {
      if (editar) {
        await api.put(`/directores/${idEditar}`, {
          nombre_director: formulario.nombre_director,
          grupo: formulario.grupo,
          estado: formulario.estado,
        });

        Swal.fire({
          title: "Actualizado",
          text: "El director de grupo fue actualizado correctamente",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await api.post("/directores", {
          nombre_director: formulario.nombre_director,
          grupo: formulario.grupo,
          estado: formulario.estado,
        });

        Swal.fire({
          title: "Registrado",
          text: "El director de grupo fue agregado correctamente",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      setMostrarFormulario(false);

      setFormulario({
        nombre_director: "",
        grupo: "",
        estado: "Activo",
      });

      setEditar(false);
      setIdEditar(null);

      cargarDirectores();
    } catch (error) {
      console.log("Error guardando director:", error);

      Swal.fire(
        "Error",
        error.response?.data?.mensaje || "No se pudo guardar el director",
        "error",
      );
    }
  };

  // ==========================================
  // EDITAR
  // ==========================================

  const editarDirector = (director) => {
    setEditar(true);

    setIdEditar(director.id_director);

    setFormulario({
      nombre_director: director.nombre_director || "",
      grupo: director.grupo || "",
      estado: director.estado || "Activo",
    });

    setMostrarFormulario(true);
  };

  // ==========================================
  // ELIMINAR
  // ==========================================

  const cambiarEstadoDirector = async (director) => {
    const nuevoEstado = director.estado === "Activo" ? "Inactivo" : "Activo";

    const resultado = await Swal.fire({
      title:
        nuevoEstado === "Inactivo"
          ? "Â¿Desactivar director?"
          : "Â¿Activar director?",

      text:
        nuevoEstado === "Inactivo"
          ? `El director ${director.nombre_director} quedarÃ¡ inactivo. Su historial se conservarÃ¡.`
          : `El director ${director.nombre_director} volverÃ¡ a estar activo.`,

      icon: "warning",

      showCancelButton: true,

      confirmButtonText:
        nuevoEstado === "Inactivo" ? "SÃ­, desactivar" : "SÃ­, activar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: nuevoEstado === "Inactivo" ? "#dc3545" : "#198754",
    });

    if (!resultado.isConfirmed) {
      return;
    }

    try {
      await api.put(`/directores/${director.id_director}`, {
        nombre_director: director.nombre_director,
        grupo: director.grupo,
estado: nuevoEstado,
      });

      Swal.fire({
        title:
          nuevoEstado === "Inactivo"
            ? "Director desactivado"
            : "Director activado",

        text:
          nuevoEstado === "Inactivo"
            ? "El director quedÃ³ inactivo y su informaciÃ³n fue conservada."
            : "El director volviÃ³ a estar activo.",

        icon: "success",

        timer: 1500,

        showConfirmButton: false,
      });

      cargarDirectores();
    } catch (error) {
      console.log("Error cambiando estado:", error);

      Swal.fire(
        "Error",
        error.response?.data?.mensaje ||
          "No se pudo cambiar el estado del director",
        "error",
      );
    }
  };

  // ==========================================
  // CANCELAR
  // ==========================================

  const cancelarFormulario = () => {
    setMostrarFormulario(false);

    setEditar(false);

    setIdEditar(null);

    setFormulario({
      nombre_director: "",
      grupo: "",
    });
  };

  // ==========================================
  // VISTA
  // ==========================================

  return (
    <div className="usuarios-container">
      {/* ENCABEZADO */}

      <div className="usuario-header">
        <h2 className="fw-bold">Directores de grupo</h2>

        <p className="text-muted">
          AdministraciÃ³n de directores y grupos del colegio
        </p>
      </div>

      {/* BOTÃ“N */}

      <button className="btn btn-naranja mb-3" onClick={nuevoDirector}>
        + Agregar director
      </button>

      {/* TABLA */}

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>

              <th>Director</th>

              <th>Grupo</th>

              <th>Total estudiantes</th>

              <th>Estado</th>

              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {directores.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  No hay directores de grupo registrados.
                </td>
              </tr>
            ) : (
              directores.map((director) => (
                <tr key={director.id_director}>
                  <td>{director.id_director}</td>

                  <td>
                    <strong>{director.nombre_director}</strong>
                  </td>

                  <td>
                    <span className="badge bg-primary">{director.grupo}</span>
                  </td>

                  <td>{director.total_estudiantes}</td>

                  <td>
                    <span
                      className={`badge ${
                        director.estado === "Activo"
                          ? "badge bg-success"
                          : "badge bg-secondary"
                      }`}
                    >
                      {director.estado}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm me-2"
                      onClick={() => editarDirector(director)}
                      title="Editar"
                    >
                      <FaEdit />
                    </button>

                    <button
                      className={
                        director.estado === "Activo"
                          ? "btn btn-outline-danger btn-sm"
                          : "btn btn-outline-success btn-sm"
                      }
                      onClick={() => cambiarEstadoDirector(director)}
                      title={
                        director.estado === "Activo"
                          ? "Desactivar director"
                          : "Activar director"
                      }
                    >
                      <FaPowerOff />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}

      {mostrarFormulario && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">
              {/* CABECERA */}

              <div className="modal-header">
                <h5 className="modal-title">
                  {editar
                    ? "Editar director de grupo"
                    : "Nuevo director de grupo"}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={cancelarFormulario}
                ></button>
              </div>

              {/* FORMULARIO */}

              <form onSubmit={guardarDirector}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre del director</label>

                    <input
                      type="text"
                      className="form-control"
                      name="nombre_director"
                      value={formulario.nombre_director}
                      onChange={manejarCambio}
                      placeholder="Ej: YULY MILENA MONTOYA FLOREZ"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Grupo</label>

                    <select
                      className="form-control"
                      name="grupo"
                      value={formulario.grupo}
                      onChange={manejarCambio}
                    >
                      <option value="">Seleccione un grupo</option>

                      <option value="6-1">6-1</option>
                      <option value="6-2">6-2</option>
                      <option value="6-3">6-3</option>
                      <option value="6-4">6-4</option>

                      <option value="7-1">7-1</option>
                      <option value="7-2">7-2</option>
                      <option value="7-3">7-3</option>
                      <option value="7-4">7-4</option>
                      <option value="7-5">7-5</option>

                      <option value="8-1">8-1</option>
                      <option value="8-2">8-2</option>
                      <option value="8-3">8-3</option>
                      <option value="8-4">8-4</option>

                      <option value="9-1">9-1</option>
                      <option value="9-2">9-2</option>
                      <option value="9-3">9-3</option>
                      <option value="9-4">9-4</option>

                      <option value="10-1">10-1</option>
                      <option value="10-2">10-2</option>
                      <option value="10-3">10-3</option>

                      <option value="11-1">11-1</option>
                      <option value="11-2">11-2</option>
                      <option value="11-3">11-3</option>
                    </select>

                    <div className="mb-3">
                      <label className="form-label">Estado</label>

                      <select
                        className="form-control"
                        name="estado"
                        value={formulario.estado}
                        onChange={manejarCambio}
                      >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* BOTONES */}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelarFormulario}
                  >
                    Cancelar
                  </button>

                  <button type="submit" className="btn btn-primary">
                    {editar ? "Guardar cambios" : "Agregar director"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Directores;


