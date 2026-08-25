import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../styles/usuarios.css";
import CartaReporte from "../components/CartaReporte";

function Uniformes() {
  const [uniformes, setUniformes] = useState([]);
  const [reportesVer, setReportesVer] = useState(null);
  const [mostrarCarta, setMostrarCarta] = useState(false);
  const [estudianteCarta, setEstudianteCarta] = useState(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [uniformeEditar, setUniformeEditar] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");

  const [formulario, setFormulario] = useState({
    id_estudiante: "",
    fecha: "",
    motivo: "",
  });

  const cargarUniformes = async () => {
    try {
      const respuesta = await api.get("/uniformes");
      setUniformes(respuesta.data);
    } catch (error) {
      console.log(error);
    }
  };

  const cargarEstudiantes = async () => {
    try {
      const respuesta = await api.get("/estudiantes");
      setEstudiantes(respuesta.data);
    } catch (error) {
      console.log(error);
    }
  };

  const obtenerAlertas = () => {
    const conteo = {};

    uniformes.forEach((item) => {
      const id = Number(item.id_estudiante);

      if (!id) return;

      if (!conteo[id]) {
        conteo[id] = {
          id_estudiante: id,
          nombres: item.nombres,
          grado: item.grado,
          total_uniforme: 0,
        };
      }

      conteo[id].total_uniforme++;
    });

    return Object.values(conteo).filter(
      (item) => item.total_uniforme >= 3
    );
  };

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const abrirFormulario = () => {
    setFormulario({
      id_estudiante: "",
      fecha: "",
      motivo: "",
    });

    setBusquedaEstudiante("");
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);

    setFormulario({
      id_estudiante: "",
      fecha: "",
      motivo: "",
    });

    setBusquedaEstudiante("");
  };

  const guardarUniforme = async (e) => {
    e.preventDefault();

    if (!formulario.id_estudiante) {
      Swal.fire("Atención", "Debe seleccionar un estudiante.", "warning");
      return;
    }

    if (!formulario.fecha) {
      Swal.fire("Atención", "Debe seleccionar la fecha.", "warning");
      return;
    }


    if (!formulario.motivo) {
      Swal.fire("Atención", "Debe seleccionar la falta de uniforme.", "warning");
      return;
    }

    try {
      await api.post("/uniformes", formulario);

      Swal.fire({
        title: "¡Registrado!",
        text: "El reporte de uniforme fue creado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      cerrarFormulario();
      cargarUniformes();
    } catch (error) {
      console.log(error);

      Swal.fire(
        "Error",
        "No se pudo registrar el reporte de uniforme.",
        "error"
      );
    }
  };

  const eliminarUniforme = async (id) => {
    const resultado = await Swal.fire({
      title: "¿Eliminar reporte?",
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
      await api.delete(`/uniformes/${id}`);

      Swal.fire({
        title: "Eliminado",
        text: "Reporte de uniforme eliminado correctamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      cargarUniformes();
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "No se pudo eliminar el reporte", "error");
    }
  };

  const guardarEdicion = async () => {
    try {
      await api.put(
        `/uniformes/${uniformeEditar.id_uniforme}`,
        uniformeEditar
      );

      Swal.fire({
        title: "Actualizado",
        text: "Reporte de uniforme actualizado correctamente",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      setUniformeEditar(null);
      cargarUniformes();
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  useEffect(() => {
    cargarUniformes();
    cargarEstudiantes();
  }, []);

  const estudiantesFiltrados = estudiantes.filter((estudiante) =>
    estudiante.nombres
      ?.toLowerCase()
      .includes(busquedaEstudiante.toLowerCase())
  );

  return (
    <div className="usuarios-container">
      <div className="usuario-header">
        <h2 className="fw-bold">Control de Uniforme</h2>

        <p className="text-muted">
          Registro de incumplimientos del uniforme escolar
        </p>
      </div>

      <div className="tabla-usuarios-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>
            <button
              className="btn btn-naranja"
              onClick={abrirFormulario}
            >
              + Nuevo reporte
            </button>
          </h5>
        </div>

        <h5>Alertas de uniforme</h5>

        {obtenerAlertas().length > 0 && (
          <div className="alert alert-danger">
            <h5>⚠️ Alertas de uniforme</h5>

            <div className="row">
              {obtenerAlertas().map((item) => (
                <div
                  key={item.id_estudiante}
                  className="col-md-6 col-lg-4 mb-3"
                >
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <strong>{item.nombres}</strong>
                      <br />
                      Grado: {item.grado}
                      <br />
                      Total reportes:
                      <span className="badge bg-danger ms-2">
                        {item.total_uniforme}
                      </span>
                      <br />

                      <button
                        className="btn btn-azul btn-sm mt-3"
                        onClick={() =>
                          setReportesVer(item.id_estudiante)
                        }
                      >
                        Ver reportes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <table className="table table-striped">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Documento</th>
              <th>Grado</th>
              <th>Fecha</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {uniformes.map((item) => (
              <tr key={item.id_uniforme}>
                <td>{item.nombres}</td>
                <td>{item.documento}</td>
                <td>{item.grado}</td>

                <td>
                  {new Date(item.fecha).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </td>

                <td>{item.motivo}</td>

                <td>
                  {item.total_uniforme >= 3 ? (
                    <span className="badge bg-danger">Alerta</span>
                  ) : item.total_uniforme == 2 ? (
                    <span className="badge bg-warning text-dark">
                      Seguimiento
                    </span>
                  ) : (
                    <span className="badge bg-success">Normal</span>
                  )}
                </td>

                <td>
                  <button
                    className="btn btn-outline-primary me-2"
                    onClick={() => setUniformeEditar(item)}
                  >
                    <FaEdit />
                  </button>

                  <button
                    className="btn btn-outline-danger"
                    onClick={() =>
                      eliminarUniforme(item.id_uniforme)
                    }
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mostrarFormulario && (
        <div
          className="modal d-block bg-dark bg-opacity-50"
          style={{ zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Nuevo reporte de uniforme
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={cerrarFormulario}
                ></button>
              </div>

              <form onSubmit={guardarUniforme}>
                <div className="modal-body">

                  <label className="form-label fw-bold">
                    Buscar estudiante
                  </label>

                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Buscar estudiante por nombre..."
                    value={busquedaEstudiante}
                    onChange={(e) => {
                      setBusquedaEstudiante(e.target.value);

                      setFormulario({
                        ...formulario,
                        id_estudiante: "",
                      });
                    }}
                  />

                  {busquedaEstudiante && !formulario.id_estudiante && (
                    <div
                      style={{
                        maxHeight: "220px",
                        overflowY: "auto",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        marginBottom: "16px",
                      }}
                    >
                      {estudiantesFiltrados
                        .slice(0, 20)
                        .map((estudiante) => (
                          <div
                            key={estudiante.id_estudiante}
                            onClick={() => {
                              setFormulario({
                                ...formulario,
                                id_estudiante:
                                  estudiante.id_estudiante,
                              });

                              setBusquedaEstudiante(
                                estudiante.nombres +
                                  " - " +
                                  estudiante.grado
                              );
                            }}
                            style={{
                              padding: "10px",
                              cursor: "pointer",
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            {estudiante.nombres} - {estudiante.grado}
                          </div>
                        ))}

                      {estudiantesFiltrados.length === 0 && (
                        <div className="text-center text-muted p-3">
                          No se encontró ningún estudiante.
                        </div>
                      )}
                    </div>
                  )}

                  {formulario.id_estudiante && (
                    <div className="alert alert-success py-2">
                      <strong>Estudiante seleccionado:</strong>{" "}
                      {busquedaEstudiante}
                    </div>
                  )}

                  <label className="form-label fw-bold">
                    Fecha
                  </label>

                  <input
                    className="form-control mb-3"
                    type="date"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={manejarCambio}
                  />

                  <label className="form-label fw-bold">
                    Falta de uniforme
                  </label>

                  <select
                    className="form-control mb-3"
                    name="motivo"
                    value={formulario.motivo}
                    onChange={manejarCambio}
                  >
                    <option value="">
                      Seleccione la falta de uniforme
                    </option>

                    <option value="Camisa incorrecta">
                      Camisa incorrecta
                    </option>

                    <option value="Zapatos incorrectos">
                      Zapatos incorrectos
                    </option>

                    <option value="Medias incorrectas">
                      Medias incorrectas
                    </option>

                    <option value="Falta de correa">
                      Falta de correa
                    </option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cerrarFormulario}
                  >
                    Cancelar
                  </button>

                  <button
                    className="btn btn-primary"
                    type="submit"
                  >
                    Guardar reporte
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {uniformeEditar && (
        <div
          className="modal d-block bg-dark bg-opacity-50"
          style={{ zIndex: 1050 }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Editar uniforme</h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setUniformeEditar(null)}
                ></button>
              </div>

              <div className="modal-body">
                <select
                  className="form-control mb-3"
                  value={uniformeEditar.id_estudiante}
                  onChange={(e) =>
                    setUniformeEditar({
                      ...uniformeEditar,
                      id_estudiante: e.target.value,
                    })
                  }
                >
                  {estudiantes.map((estudiante) => (
                    <option
                      key={estudiante.id_estudiante}
                      value={estudiante.id_estudiante}
                    >
                      {estudiante.nombres} - {estudiante.grado}
                    </option>
                  ))}
                </select>

                <input
                  className="form-control mb-3"
                  type="date"
                  value={
                    uniformeEditar.fecha
                      ? uniformeEditar.fecha.substring(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setUniformeEditar({
                      ...uniformeEditar,
                      fecha: e.target.value,
                    })
                  }
                />

                <select
                  className="form-control mb-3"
                  value={uniformeEditar.motivo}
                  onChange={(e) =>
                    setUniformeEditar({
                      ...uniformeEditar,
                      motivo: e.target.value,
                    })
                  }
                >
                  <option value="Camisa incorrecta">
                    Camisa incorrecta
                  </option>

                  <option value="Zapatos incorrectos">
                    Zapatos incorrectos
                  </option>

                  <option value="Medias incorrectas">
                    Medias incorrectas
                  </option>

                  <option value="Falta de correa">
                    Falta de correa
                  </option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setUniformeEditar(null)}
                >
                  Cancelar
                </button>

                <button
                  className="btn btn-primary"
                  onClick={guardarEdicion}
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportesVer && (
        <div
          className="modal d-block bg-dark bg-opacity-50"
          style={{ zIndex: 1050 }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Reportes de uniforme</h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setReportesVer(null)}
                ></button>
              </div>

              <div className="modal-body">
                {uniformes
                  .filter(
                    (item) =>
                      Number(item.id_estudiante) ===
                      Number(reportesVer)
                  )
                  .map((item) => (
                    <div
                      className="border p-2 mb-2"
                      key={item.id_uniforme}
                    >
                      Fecha:{" "}
                      {item.fecha
                        ? item.fecha.substring(0, 10)
                        : ""}
                      <br />
                      Motivo: {item.motivo}
                    </div>
                  ))}

                <div className="text-center mt-3">
                  <button
                    className="btn btn-naranja mt-3"
                    onClick={() => {
                      const estudiante = uniformes.find(
                        (item) =>
                          Number(item.id_estudiante) ===
                          Number(reportesVer)
                      );

                      setEstudianteCarta(estudiante);
                      setMostrarCarta(true);
                    }}
                  >
                    📄 Generar carta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarCarta && (
        <CartaReporte
          tipo="uniforme"
          estudiante={estudianteCarta}
          total={estudianteCarta?.total_uniforme}
          onCerrar={() => setMostrarCarta(false)}
          onGenerarPDF={() => {}}
        />
      )}
    </div>
  );
}

export default Uniformes;
