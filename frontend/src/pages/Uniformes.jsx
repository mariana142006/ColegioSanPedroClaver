import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../styles/usuarios.css";
import CartaReporte from "../components/CartaReporte";

function Uniformes() {
  const [uniformes, setUniformes] = useState([]);

  const [paginaActual, setPaginaActual] = useState(1);

  const uniformesPorPagina = 10;
  const [reportesVer, setReportesVer] = useState(null);
  const [mostrarCarta, setMostrarCarta] = useState(false);
  const [estudianteCarta, setEstudianteCarta] = useState(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [uniformeEditar, setUniformeEditar] = useState(null);
  const [busquedaEstudianteEditar, setBusquedaEstudianteEditar] = useState("");
  const [estudiantes, setEstudiantes] = useState([]);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
  const [busquedaUniformes, setBusquedaUniformes] = useState("");

  const [formulario, setFormulario] = useState({
    id_estudiante: "",
    fecha: "",
    motivo: "",
  });

  // ==========================================
  // BUSCADOR DE UNIFORMES
  // Busca por nombre, grado o documento
  // ==========================================
  const uniformesFiltrados = uniformes.filter((item) => {
    const texto = busquedaUniformes.toLowerCase().trim();

    if (!texto) return true;

    const nombre = String(item.nombres || "").toLowerCase();
    const grado = String(item.grado || "").toLowerCase();
    const documento = String(item.documento || "").toLowerCase();

    return (
      nombre.includes(texto) ||
      grado.includes(texto) ||
      documento.includes(texto)
    );
  });

  // ==========================================
  // PAGINACIÓN DE RESULTADOS FILTRADOS
  // ==========================================
  const totalPaginas = Math.ceil(
    uniformesFiltrados.length / uniformesPorPagina
  );

  const indiceInicial =
    (paginaActual - 1) * uniformesPorPagina;

  const indiceFinal =
    indiceInicial + uniformesPorPagina;

  const uniformesPagina = uniformesFiltrados.slice(
    indiceInicial,
    indiceFinal
  );
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
    const estudiantesAlertas = {};

    uniformes.forEach((item) => {
      const id = Number(item.id_estudiante);

      if (!id) return;

      if (!estudiantesAlertas[id]) {
        const estudiante = estudiantes.find(
          (e) => Number(e.id_estudiante) === id
        );

        estudiantesAlertas[id] = {
          id_estudiante: id,
          nombres: item.nombres,
          documento: item.documento,
          grado: item.grado,
          total_uniforme: Number(item.total_uniforme) || 0,
          carta_generada: Number(item.carta_generada) || 0,
          telefono_acudiente: estudiante?.telefono_acudiente || "",
          nombre_acudiente: estudiante?.nombre_acudiente || "",
        };
      }
    });

    return Object.values(estudiantesAlertas).filter(
      (item) =>
        item.total_uniforme >= 3 &&
        item.carta_generada === 0
    );
  };

  // ============================================================
  // NOTIFICAR ACUDIENTE POR WHATSAPP
  // ============================================================
  const notificarAcudienteWhatsApp = async (item) => {
    if (!item.telefono_acudiente) {
      Swal.fire(
        "Sin teléfono",
        "Este estudiante no tiene registrado un número de acudiente.",
        "warning"
      );
      return;
    }

    let telefono = String(item.telefono_acudiente).replace(/\D/g, "");

    if (telefono.length === 10 && telefono.startsWith("3")) {
      telefono = "57" + telefono;
    }

    const mensaje =
      `Cordial saludo, ${item.nombre_acudiente || "señor(a) acudiente"}. ` +
      `Nos permitimos informarle que el estudiante ${item.nombres}, ` +
      `del grado ${item.grado}, ha acumulado ${item.total_uniforme} ` +
      `reportes relacionados con el uso inadecuado del uniforme. ` +
      `Agradecemos su atención y acompañamiento en el cumplimiento ` +
      `de las normas de presentación personal del Colegio San Pedro Claver.`;

    const url =
      `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    const ventanaWhatsApp = window.open("about:blank", "_blank");

    try {
      const respuestaNumero = await api.get("/cartas/numero");

      const numeroReporte = respuestaNumero.data.numero;

      await api.post("/cartas", {
        id_estudiante: item.id_estudiante,
        tipo: "uniforme",
        numero_reporte: numeroReporte,
        fecha_generacion: new Date().toISOString(),
        archivo_pdf: null,
        observacion: "Notificado por WhatsApp",
      });

      if (ventanaWhatsApp) {
        ventanaWhatsApp.location.href = url;
      } else {
        window.open(url, "_blank");
      }

      setUniformes((anteriores) =>
        anteriores.map((registro) =>
          Number(registro.id_estudiante) === Number(item.id_estudiante)
            ? {
                ...registro,
                carta_generada: 1,
              }
            : registro
        )
      );

      Swal.fire({
        title: "Notificación realizada",
        text: "Se notificó al acudiente por WhatsApp y el reporte fue registrado.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(
        "Error registrando notificación por WhatsApp:",
        error
      );

      if (ventanaWhatsApp) {
        ventanaWhatsApp.close();
      }

      Swal.fire(
        "Error",
        "No se pudo registrar la notificación en el sistema.",
        "error"
      );
    }
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
            <h5>Alertas de uniforme</h5>

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
                        className="btn btn-azul btn-sm mt-3 me-2"
                        onClick={() =>
                          setReportesVer(item.id_estudiante)
                        }
                      >
                        Ver reportes
                      </button>

                      <button
                        className="btn btn-success btn-sm mt-3"
                        onClick={() =>
                          notificarAcudienteWhatsApp(item)
                        }
                      >
                        Notificar acudiente por WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            BUSCADOR PRINCIPAL DE UNIFORMES
            ========================================== */}
        <div className="mb-3">
          <label className="form-label fw-bold">
            Buscar estudiante
          </label>

          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre, grado o documento..."
            value={busquedaUniformes}
            onChange={(e) => {
              setBusquedaUniformes(e.target.value);
              setPaginaActual(1);
            }}
          />
        </div>
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
            {uniformesPagina.map((item) => (
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
                    onClick={() => {
                      setUniformeEditar(item);

                      const estudianteActual = estudiantes.find(
                        (estudiante) =>
                          String(estudiante.id_estudiante) ===
                          String(item.id_estudiante)
                      );

                      if (estudianteActual) {
                        setBusquedaEstudianteEditar(
                          `${estudianteActual.nombres} - ${estudianteActual.documento} - ${estudianteActual.grado}`
                        );
                      } else {
                        setBusquedaEstudianteEditar("");
                      }
                    }}
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

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted">
            Mostrando{" "}
            {uniformesFiltrados.length === 0 ? 0 : indiceInicial + 1} -{" "}
            {Math.min(indiceFinal, uniformesFiltrados.length)} de{" "}
            {uniformesFiltrados.length} registros
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary"
              disabled={paginaActual === 1}
              onClick={() =>
                setPaginaActual((pagina) => pagina - 1)
              }
            >
              Anterior
            </button>

            <span className="fw-bold">
              Página {paginaActual} de {totalPaginas || 1}
            </span>

            <button
              className="btn btn-outline-primary"
              disabled={
                paginaActual === totalPaginas ||
                totalPaginas === 0
              }
              onClick={() =>
                setPaginaActual((pagina) => pagina + 1)
              }
            >
              Siguiente
            </button>
          </div>
        </div>
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
                  <input
                    type="text"
                    className="form-control mb-3"
                    name="motivo"
                    placeholder="Escriba la falta de uniforme"
                    value={formulario.motivo}
                    onChange={manejarCambio}
                  />
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

                <label className="form-label fw-bold">
                  Buscar estudiante
                </label>

                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Escriba nombre o documento..."
                  value={busquedaEstudianteEditar}
                  onChange={(e) => {
                    const valor = e.target.value;

                    setBusquedaEstudianteEditar(valor);

                    setUniformeEditar({
                      ...uniformeEditar,
                      id_estudiante: "",
                    });
                  }}
                />

                {busquedaEstudianteEditar.trim() &&
                  !uniformeEditar.id_estudiante && (
                    <div
                      style={{
                        maxHeight: "250px",
                        overflowY: "auto",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        marginBottom: "16px",
                        backgroundColor: "white",
                      }}
                    >
                      {estudiantes
                        .filter((estudiante) => {
                          const texto =
                            busquedaEstudianteEditar
                              .toLowerCase()
                              .trim();

                          const nombre =
                            estudiante.nombres?.toLowerCase() || "";

                          const documento =
                            String(
                              estudiante.documento || ""
                            ).toLowerCase();

                          return (
                            nombre.includes(texto) ||
                            documento.includes(texto)
                          );
                        })
                        .slice(0, 20)
                        .map((estudiante) => (
                          <div
                            key={estudiante.id_estudiante}
                            onClick={() => {
                              setUniformeEditar({
                                ...uniformeEditar,
                                id_estudiante:
                                  estudiante.id_estudiante,
                              });

                              setBusquedaEstudianteEditar(
                                `${estudiante.nombres} - ${estudiante.documento} - ${estudiante.grado}`
                              );
                            }}
                            style={{
                              padding: "10px",
                              cursor: "pointer",
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            <strong>
                              {estudiante.nombres}
                            </strong>

                            <br />

                            <small className="text-muted">
                              Documento: {estudiante.documento} | Grado:{" "}
                              {estudiante.grado}
                            </small>
                          </div>
                        ))}

                      {estudiantes.filter((estudiante) => {
                        const texto =
                          busquedaEstudianteEditar
                            .toLowerCase()
                            .trim();

                        const nombre =
                          estudiante.nombres?.toLowerCase() || "";

                        const documento =
                          String(
                            estudiante.documento || ""
                          ).toLowerCase();

                        return (
                          nombre.includes(texto) ||
                          documento.includes(texto)
                        );
                      }).length === 0 && (
                        <div className="text-center text-muted p-3">
                          No se encontró ningún estudiante.
                        </div>
                      )}
                    </div>
                  )}

                {uniformeEditar.id_estudiante && (
                  <div className="alert alert-success py-2">
                    <strong>
                      Estudiante seleccionado:
                    </strong>{" "}
                    {busquedaEstudianteEditar}
                  </div>
                )}

                <label className="form-label fw-bold">
                  Fecha
                </label>

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

                <label className="form-label fw-bold">
                  Falta de uniforme
                </label>

                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Escriba la falta de uniforme"
                  value={uniformeEditar.motivo}
                  onChange={(e) =>
                    setUniformeEditar({
                      ...uniformeEditar,
                      motivo: e.target.value,
                    })
                  }
                />

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
          onCerrar={() => {
            setMostrarCarta(false);
            cargarUniformes();
          }}
          onGenerarPDF={() => {}}
        />
      )}
    </div>
  );
}

export default Uniformes;






















