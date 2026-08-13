import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/usuarios.css";

import Swal from "sweetalert2";

import { FaEdit, FaTrash, FaCheck } from "react-icons/fa";

function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);

  const [directores, setDirectores] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const [paginaActual, setPaginaActual] = useState(1);

  const estudiantesPorPagina = 10;

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [estudianteEditar, setEstudianteEditar] = useState(null);

  const [formulario, setFormulario] = useState({
    documento: "",
    nombres: "",
    grado: "",
    telefono_acudiente: "",
    nombre_acudiente: "",
    id_director: "",
    estado: "Activo",
  });

  const cargarEstudiantes = async () => {
    try {
      const respuesta = await api.get("/estudiantes");

      setEstudiantes(respuesta.data);
    } catch (error) {
      console.log(error);
    }
  };

  const cargarDirectores = async () => {
    try {
      const respuesta = await api.get("/directores");

      setDirectores(respuesta.data);
    } catch (error) {
      console.log(error);
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    if (name === "grado") {
      const directorEncontrado = directores.find(
        (director) => director.grupo === value,
      );

      setFormulario({
        ...formulario,
        grado: value,
        id_director: directorEncontrado ? directorEncontrado.id_director : "",
      });

      return;
    }

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const guardarEstudiante = async (e) => {
    e.preventDefault();

    if (
      !formulario.documento.trim() ||
      !formulario.nombres.trim() ||
      !formulario.grado
    ) {
      Swal.fire(
        "Campos obligatorios",
        "Debes ingresar documento, nombre y grado.",
        "warning",
      );

      return;
    }

    try {
      await api.post("/estudiantes", formulario);

      Swal.fire({
        title: "¡Registrado!",
        text: "El estudiante fue creado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      setFormulario({
        documento: "",
        nombres: "",
        grado: "",
        telefono_acudiente: "",
        nombre_acudiente: "",
        id_director: "",
        estado: "Activo",
      });

      setMostrarFormulario(false);

      cargarEstudiantes();
    } catch (error) {
      console.log(error);

      Swal.fire(
        "Error",
        error.response?.data?.mensaje || "No se pudo crear el estudiante",
        "error",
      );
    }
  };

  const guardarEdicion = async () => {
    if (
      !estudianteEditar.documento?.trim() ||
      !estudianteEditar.nombres?.trim() ||
      !estudianteEditar.grado
    ) {
      Swal.fire(
        "Campos obligatorios",
        "Documento, nombre y grado son obligatorios.",
        "warning",
      );

      return;
    }

    try {
      await api.put(
        `/estudiantes/${estudianteEditar.id_estudiante}`,
        estudianteEditar,
      );

      Swal.fire({
        title: "¡Actualizado!",

        text: "El estudiante fue actualizado correctamente.",

        icon: "success",

        confirmButtonText: "Aceptar",
      });

      setEstudianteEditar(null);

      cargarEstudiantes();
    } catch (error) {
      console.log(error);

      Swal.fire(
        "Error",
        error.response?.data?.mensaje || "No se pudo actualizar el estudiante",
        "error",
      );
    }
  };

  const eliminarEstudiante = async (id) => {
    const resultado = await Swal.fire({
      title: "¿Desactivar estudiante?",
      text: "El estudiante pasará a estado Inactivo y conservará todo su historial.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc6505",
    });

    if (!resultado.isConfirmed) {
      return;
    }

    try {
      await api.delete(`/estudiantes/${id}`);

      Swal.fire({
        title: "Estudiante desactivado",
        text: "El estudiante ahora está Inactivo y su historial fue conservado.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      cargarEstudiantes();
    } catch (error) {
      console.log(error);

      Swal.fire(
        "Error",
        error.response?.data?.mensaje || "No se pudo desactivar el estudiante",
        "error",
      );
    }
  };

  const activarEstudiante = async (id) => {
    const resultado = await Swal.fire({
      title: "¿Activar estudiante?",
      text: "El estudiante volverá a estar disponible en el sistema.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, activar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#198754",
    });

    if (!resultado.isConfirmed) {
      return;
    }

    try {
      await api.put(`/estudiantes/${id}/activar`);

      Swal.fire({
        title: "¡Activado!",
        text: "El estudiante volvió a estar activo.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      cargarEstudiantes();
    } catch (error) {
      console.log(error);

      Swal.fire(
        "Error",
        error.response?.data?.mensaje || "No se pudo activar el estudiante",
        "error",
      );
    }
  };

  const estudiantesFiltrados = estudiantes
    .filter((estudiante) => {
      const texto = busqueda.toLowerCase();

      const coincideTexto =
        estudiante.nombres.toLowerCase().includes(texto) ||
        estudiante.documento.toLowerCase().includes(texto) ||
        estudiante.grado.toLowerCase().includes(texto);

      const coincideEstado =
        filtroEstado === "Todos" || estudiante.estado === filtroEstado;

      return coincideTexto && coincideEstado;
    })
    .sort((a, b) => {
      const [gradoA, grupoA] = a.grado.split("-").map(Number);
      const [gradoB, grupoB] = b.grado.split("-").map(Number);

      if (gradoA !== gradoB) {
        return gradoA - gradoB;
      }

      return grupoA - grupoB;
    });

  const totalPaginas = Math.ceil(
    estudiantesFiltrados.length / estudiantesPorPagina,
  );

  const indiceInicial = (paginaActual - 1) * estudiantesPorPagina;

  const indiceFinal = indiceInicial + estudiantesPorPagina;

  const estudiantesPagina = estudiantesFiltrados.slice(
    indiceInicial,
    indiceFinal,
  );

  useEffect(() => {
    cargarEstudiantes();
    cargarDirectores();
  }, []);

  return (
    <div className="usuarios-container">
      <div className="usuario-header">
        <h2 className="fw-bold">Gestión de Estudiantes</h2>

        <p className="text-muted">
          Administra los estudiantes del Colegio San Pedro Claver
        </p>
      </div>

      <div className="tabla-usuarios-container">
        <button
          className="btn btn-naranja mb-3"
          onClick={() => {
            setFormulario({
              documento: "",
              nombres: "",
              grado: "",
              telefono_acudiente: "",
              nombre_acudiente: "",
              id_director: "",
              estado: "Activo",
            });

            setMostrarFormulario(true);
          }}
        >
          + Nuevo Estudiante
        </button>
        {mostrarFormulario && (
          <div className="modal d-block bg-dark bg-opacity-50">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Nuevo estudiante</h5>

                  <button
                    className="btn-close"
                    onClick={() => setMostrarFormulario(false)}
                  ></button>
                </div>

                <form onSubmit={guardarEstudiante}>
                  <div className="modal-body">
                    <input
                      className="form-control mb-3"
                      name="documento"
                      placeholder="Documento"
                      value={formulario.documento}
                      onChange={manejarCambio}
                    />

                    <input
                      className="form-control mb-3"
                      name="nombres"
                      placeholder="Nombre completo"
                      value={formulario.nombres}
                      onChange={manejarCambio}
                    />

                    <select
                      className="form-control mb-3"
                      name="grado"
                      value={formulario.grado}
                      onChange={manejarCambio}
                    >
                      <option value="">Seleccione el grupo</option>

                      {directores.map((director) => (
                        <option
                          key={director.id_director}
                          value={director.grupo}
                        >
                          {director.grupo}
                        </option>
                      ))}
                    </select>

                    {formulario.grado && (
                      <div className="alert alert-info mb-3">
                        <strong>Director de grupo:</strong>{" "}
                        {directores.find(
                          (director) => director.grupo === formulario.grado,
                        )?.nombre_director || "Sin director asignado"}
                      </div>
                    )}

                    <input
                      className="form-control mb-3"
                      name="nombre_acudiente"
                      placeholder="Nombre acudiente"
                      value={formulario.nombre_acudiente}
                      onChange={manejarCambio}
                    />

                    <input
                      className="form-control mb-3"
                      name="telefono_acudiente"
                      placeholder="Teléfono acudiente"
                      value={formulario.telefono_acudiente}
                      onChange={manejarCambio}
                    />
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setMostrarFormulario(false)}
                    >
                      Cancelar
                    </button>

                    <button className="btn btn-primary">Guardar</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-between mb-3">
          <input
            className="form-control"
            style={{ width: "300px" }}
            placeholder="🔍 Buscar estudiante..."
            value={busqueda}
            onChange={(e) => {setBusqueda(e.target.value); setPaginaActual(1);}}
          />

          <select
            className="form-control"
            style={{ width: "200px" }}
            value={filtroEstado}
            onChange={(e) => {setFiltroEstado(e.target.value); setpaginaActual(1);}}
          >
            <option value="Todos">Todos</option>

            <option value="Activo">Activos</option>

            <option value="Inactivo">Inactivos</option>
          </select>
        </div>

        <table className="table table-striped">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Nombres</th>
              <th>Grado</th>
              <th>Director</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {estudiantesPagina.map((estudiante) => (
              <tr key={estudiante.id_estudiante}>
                <td>{estudiante.documento}</td>

                <td>{estudiante.nombres}</td>

                <td>{estudiante.grado}</td>

                <td>{estudiante.nombre_director}</td>

                <td>
                  <span
                    className={`badge ${
                      estudiante.estado === "Activo"
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {estudiante.estado}
                  </span>
                </td>

                <td>
                  <button
                    className="btn btn-outline-primary me-2"
                    onClick={() => setEstudianteEditar(estudiante)}
                  >
                    <FaEdit />
                  </button>

                  {estudiante.estado === "Activo" ? (
                    <button
                      className="btn btn-outline-danger"
                      title="Desactivar estudiante"
                      onClick={() =>
                        eliminarEstudiante(estudiante.id_estudiante)
                      }
                    >
                      <FaTrash />
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-success"
                      title="Activar estudiante"
                      onClick={() =>
                        activarEstudiante(estudiante.id_estudiante)
                      }
                    >
                      <FaCheck />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted">
            Mostrando{" "}
            {estudiantesFiltrados.length === 0 ? 0 : indiceInicial + 1} -{" "}
            {Math.min(indiceFinal, estudiantesFiltrados.length)} de{" "}
            {estudiantesFiltrados.length} estudiantes
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary"
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual((pagina) => pagina - 1)}
            >
              ← Anterior
            </button>

            <span className="fw-bold">
              Página {paginaActual} de {totalPaginas || 1}
            </span>

            <button
              className="btn btn-outline-primary"
              disabled={paginaActual === totalPaginas || totalPaginas === 0}
              onClick={() => setPaginaActual((pagina) => pagina + 1)}
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
      {estudianteEditar && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Editar estudiante</h5>

                <button
                  className="btn-close"
                  onClick={() => setEstudianteEditar(null)}
                ></button>
              </div>

              <div className="modal-body">
                <input
                  className="form-control mb-3"
                  value={estudianteEditar.documento}
                  onChange={(e) =>
                    setEstudianteEditar({
                      ...estudianteEditar,
                      documento: e.target.value,
                    })
                  }
                />

                <input
                  className="form-control mb-3"
                  value={estudianteEditar.nombres}
                  onChange={(e) =>
                    setEstudianteEditar({
                      ...estudianteEditar,
                      nombres: e.target.value,
                    })
                  }
                />

                <select
                  className="form-control mb-3"
                  value={estudianteEditar.grado}
                  onChange={(e) => {
                    const nuevoGrado = e.target.value;

                    const directorEncontrado = directores.find(
                      (director) => director.grupo === nuevoGrado,
                    );

                    setEstudianteEditar({
                      ...estudianteEditar,
                      grado: nuevoGrado,
                      id_director: directorEncontrado
                        ? directorEncontrado.id_director
                        : "",
                      nombre_director: directorEncontrado
                        ? directorEncontrado.nombre_director
                        : "",
                    });
                  }}
                >
                  <option value="">Seleccione el grupo</option>

                  {directores.map((director) => (
                    <option key={director.id_director} value={director.grupo}>
                      {director.grupo}
                    </option>
                  ))}
                </select>

                {estudianteEditar.grado && (
                  <div className="alert alert-info mb-3">
                    <strong>Director de grupo:</strong>{" "}
                    {directores.find(
                      (director) => director.grupo === estudianteEditar.grado,
                    )?.nombre_director || "Sin director asignado"}
                  </div>
                )}

                <input
                  className="form-control mb-3"
                  value={estudianteEditar.nombre_acudiente}
                  onChange={(e) =>
                    setEstudianteEditar({
                      ...estudianteEditar,
                      nombre_acudiente: e.target.value,
                    })
                  }
                />

                <input
                  className="form-control mb-3"
                  value={estudianteEditar.telefono_acudiente}
                  onChange={(e) =>
                    setEstudianteEditar({
                      ...estudianteEditar,
                      telefono_acudiente: e.target.value,
                    })
                  }
                />

                <select
                  className="form-control mb-3"
                  value={estudianteEditar.estado}
                  onChange={(e) =>
                    setEstudianteEditar({
                      ...estudianteEditar,
                      estado: e.target.value,
                    })
                  }
                >
                  <option>Activo</option>

                  <option>Inactivo</option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEstudianteEditar(null)}
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

export default Estudiantes;
