import { useEffect, useState } from "react";

import api from "../services/api";

import Swal from "sweetalert2";

import { FaTrash, FaEdit } from "react-icons/fa";

import "../styles/usuarios.css";

import CartaReporte from "../components/CartaReporte";

function Inasistencias() {
  const [inasistencias, setInasistencias] = useState([]);

  const [mostrarCarta, setMostrarCarta] = useState(false);

  const [estudianteCarta, setEstudianteCarta] = useState(null);

  const [reportesVer, setReportesVer] = useState(null);

  const [estudiantes, setEstudiantes] = useState([]);

  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
  const [busquedaInasistencias, setBusquedaInasistencias] = useState("");

  const [paginaActual, setPaginaActual] = useState(1);

  const inasistenciasPorPagina = 10;

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [formulario, setFormulario] = useState({
    id_estudiante: "",
    fecha: "",
    tipo: "",
    observacion: "",
    estado: "Normal",
  });

  const [editar, setEditar] = useState(false);

  const [idEditar, setIdEditar] = useState(null);

  // ==========================================
  // BUSCADOR DE INASISTENCIAS
  // Busca por nombre, grado o documento
  // ==========================================
  const inasistenciasFiltradas = inasistencias.filter((item) => {
    const texto = busquedaInasistencias.toLowerCase().trim();

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
    inasistenciasFiltradas.length / inasistenciasPorPagina
  );

  const indiceInicial =
    (paginaActual - 1) * inasistenciasPorPagina;

  const indiceFinal =
    indiceInicial + inasistenciasPorPagina;

  const inasistenciasPagina = inasistenciasFiltradas.slice(
    indiceInicial,
    indiceFinal
  );

  const cargarInasistencias = async () => {
    try {
      const respuesta = await api.get("/inasistencias");

      setInasistencias(respuesta.data);
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

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,

      [e.target.name]: e.target.value,
    });
  };

  const guardarInasistencia = async (e) => {
    e.preventDefault();

    try {
      if (editar) {
        await api.put(`/inasistencias/${idEditar}`, formulario);
      } else {
        await api.post("/inasistencias", formulario);
      }

      Swal.fire(
        "Registrado",
        editar
          ? "Inasistencia actualizada correctamente"
          : "Inasistencia registrada correctamente",
        "success",
      );

      setFormulario({
        id_estudiante: "",
        fecha: "",
        tipo: "",
        observacion: "",
        estado: "Normal",
      });

      setMostrarFormulario(false);
      cargarInasistencias();
    } catch (error) {
      console.log(error);
    }
  };

  const editarInasistencia = (item) => {
    const estudiante = estudiantes.find(
      (e) =>
        Number(e.id_estudiante) ===
        Number(item.id_estudiante)
    );

    setFormulario({
      id_estudiante: item.id_estudiante,
      fecha: item.fecha
        ? String(item.fecha).substring(0, 10)
        : "",
      tipo: item.tipo || "",
      observacion: item.observacion || "",
      estado: item.estado || "Normal",
    });

    setBusquedaEstudiante(
      estudiante
        ? `${estudiante.nombres} - ${estudiante.documento} - ${estudiante.grado}`
        : item.nombres || ""
    );

    setIdEditar(item.id_inasistencia);

    setEditar(true);

    setMostrarFormulario(true);
  };
  useEffect(() => {
    cargarInasistencias();

    cargarEstudiantes();
  }, []);

  const eliminarInasistencia = async (id) => {
    try {
      await api.delete(`/inasistencias/${id}`);

      Swal.fire(
        "Eliminado",
        "La inasistencia fue eliminada correctamente",
        "success",
      );

      cargarInasistencias();
    } catch (error) {
      console.log(error);
    }
  };

  const obtenerAlertas = () => {
    // SOLO "Sin excusa" puede generar una alerta.
    const alertas = inasistencias.filter(
      (item) =>
        item.tipo === "Sin excusa" &&
        Number(item.total_inasistencias) >= 3 &&
        Math.floor(Number(item.total_inasistencias) / 3) >
          Number(item.total_cartas_inasistencia || 0)
    );

    const estudiantesUnicos = [];

    alertas.forEach((item) => {
      const existe = estudiantesUnicos.find(
        (estudiante) =>
          Number(estudiante.id_estudiante) === Number(item.id_estudiante)
      );

      if (!existe) {
        const estudiante = estudiantes.find(
          (e) =>
            Number(e.id_estudiante) === Number(item.id_estudiante)
        );

        estudiantesUnicos.push({
          ...item,
          telefono_acudiente: estudiante?.telefono_acudiente || "",
          nombre_acudiente: estudiante?.nombre_acudiente || "",
        });
      }
    });

    return estudiantesUnicos;
  };
  // ============================================================
  // NOTIFICAR ACUDIENTE POR WHATSAPP
  // ============================================================
  const notificarAcudienteWhatsApp = async (item) => {
    if (!item.telefono_acudiente) {
      Swal.fire(
        "Sin telefono",
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
      `del grado ${item.grado}, ha acumulado ${item.total_inasistencias} ` +
      `inasistencias. ` +
      `Agradecemos su atención y acompañamiento para fortalecer ` +
      `la asistencia del estudiante al Colegio San Pedro Claver.`;

    const url =
      `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    const ventanaWhatsApp = window.open("about:blank", "_blank");

    try {
      const respuestaNumero = await api.get("/cartas/numero");

      const numeroReporte = respuestaNumero.data.numero;

      await api.post("/cartas", {
        id_estudiante: item.id_estudiante,
        tipo: "inasistencia",
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

      setInasistencias((anteriores) =>
        anteriores.map((registro) =>
          Number(registro.id_estudiante) === Number(item.id_estudiante)
            ? {
                ...registro,
                total_cartas_inasistencia: Math.floor(
                  Number(registro.total_inasistencias) / 3
                ),
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
  return (
    <div className="usuarios-container">
      <h2 className="fw-bold">Gestión de Inasistencias</h2>

      <button
        className="btn btn-naranja mb-3"
        onClick={() => setMostrarFormulario(true)}
      >
        + Nueva Inasistencia
      </button>

      {obtenerAlertas().length > 0 && (
        <div className="alert alert-danger">
          <h5>Alertas de inasistencias</h5>

          <div className="alertas-container">
            {obtenerAlertas().map((item) => (
              <div key={item.id_estudiante} className="alerta-card">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <strong>{item.nombres}</strong>
                    <br />
                    Grado:
                    {item.grado}
                    <br />
                    Total inasistencias:
                    <span className="badge bg-danger ms-2">
                      {item.total_inasistencias}
                    </span>
                    <br />
                    <button
                      className="btn btn-azul btn-sm mt-3 me-2"
                      onClick={() => setReportesVer(item.id_estudiante)}
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
          BUSCADOR DE INASISTENCIAS
          ========================================== */}
      <div className="mb-3">
        <label className="form-label fw-bold">
          Buscar estudiante
        </label>

        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nombre, grado o documento..."
          value={busquedaInasistencias}
          onChange={(e) => {
            setBusquedaInasistencias(e.target.value);
            setPaginaActual(1);
          }}
        />
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Estudiante</th>

            <th>Grado</th>

            <th>Fecha</th>

            <th>Tipo</th>

            <th>Observación</th>

            <th>Estado</th>

            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {inasistenciasPagina.map((item) => (
            <tr key={item.id_inasistencia}>
              <td>{item.nombres}</td>

              <td>{item.grado}</td>

              <td>
                {new Date(item.fecha).toLocaleDateString("es-CO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </td>

              <td>{item.tipo}</td>

              <td>{item.observacion}</td>

              <td>
                <span
                  className={
                    item.estado === "Alerta"
                      ? "badge bg-danger"
                      : item.estado === "Seguimiento"
                        ? "badge bg-warning"
                        : "badge bg-success"
                  }
                >
                  {item.estado}
                </span>
              </td>

              <td>
                <button
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={() => editarInasistencia(item)}
                >
                  <FaEdit />
                </button>

                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => eliminarInasistencia(item.id_inasistencia)}
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
          {inasistenciasFiltradas.length === 0 ? 0 : indiceInicial + 1} -{" "}
          {Math.min(indiceFinal, inasistenciasFiltradas.length)} de{" "}
          {inasistenciasFiltradas.length} registros
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary"
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual((pagina) => pagina - 1)}
          >
            Anterior
          </button>

          <span className="fw-bold">
            Página {paginaActual} de {totalPaginas || 1}
          </span>

          <button
            className="btn btn-outline-primary"
            disabled={paginaActual === totalPaginas || totalPaginas === 0}
            onClick={() => setPaginaActual((pagina) => pagina + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>


      {mostrarFormulario && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5>
                  {editar
                    ? "Editar inasistencia"
                    : "Nueva inasistencia"}
                </h5>

                <button
                  className="btn-close"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setEditar(false);
                    setIdEditar(null);
                  }}
                ></button>
              </div>

              <form onSubmit={guardarInasistencia}>

                <div className="modal-body">

                  {/* BUSCAR ESTUDIANTE */}
                  <label className="form-label fw-bold">
                    Buscar estudiante
                  </label>

                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Escriba nombre o documento..."
                    value={busquedaEstudiante}
                    onChange={(e) => {
                      setBusquedaEstudiante(e.target.value);

                      setFormulario({
                        ...formulario,
                        id_estudiante: "",
                      });
                    }}
                  />

                  {busquedaEstudiante.trim() !== "" &&
                    !formulario.id_estudiante && (
                      <div
                        style={{
                          maxHeight: "300px",
                          overflowY:
                            estudiantes.filter((estudiante) => {
                              const texto =
                                busquedaEstudiante
                                  .toLowerCase()
                                  .trim();

                              const nombre =
                                estudiante.nombres
                                  ?.toLowerCase() || "";

                              const documento =
                                String(
                                  estudiante.documento || ""
                                ).toLowerCase();

                              return (
                                nombre.includes(texto) ||
                                documento.includes(texto)
                              );
                            }).length > 8
                              ? "auto"
                              : "hidden",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          marginBottom: "16px",
                        }}
                      >

                        {estudiantes
                          .filter((estudiante) => {
                            const texto =
                              busquedaEstudiante
                                .toLowerCase()
                                .trim();

                            const nombre =
                              estudiante.nombres
                                ?.toLowerCase() || "";

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
                                setFormulario({
                                  ...formulario,
                                  id_estudiante:
                                    estudiante.id_estudiante,
                                });

                                setBusquedaEstudiante(
                                  `${estudiante.nombres} - ${estudiante.documento} - ${estudiante.grado}`
                                );
                              }}
                              style={{
                                padding: "10px",
                                cursor: "pointer",
                                borderBottom:
                                  "1px solid #eee",
                              }}
                            >
                              <strong>
                                {estudiante.nombres}
                              </strong>

                              <br />

                              <small className="text-muted">
                                Documento:{" "}
                                {estudiante.documento}{" "}
                                | Grado:{" "}
                                {estudiante.grado}
                              </small>
                            </div>
                          ))}

                        {estudiantes.filter((estudiante) => {
                          const texto =
                            busquedaEstudiante
                              .toLowerCase()
                              .trim();

                          const nombre =
                            estudiante.nombres
                              ?.toLowerCase() || "";

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

                  {/* ESTUDIANTE SELECCIONADO */}
                  {formulario.id_estudiante && (
                    <div className="alert alert-success py-2">
                      <strong>
                        Estudiante seleccionado:
                      </strong>{" "}
                      {busquedaEstudiante}
                    </div>
                  )}

                  {/* FECHA */}
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

                  {/* MOTIVO DE INASISTENCIA */}
                  <label className="form-label fw-bold">
                    Motivo de inasistencia
                  </label>

                  <select
                    className="form-control mb-3"
                    name="tipo"
                    value={formulario.tipo}
                    onChange={manejarCambio}
                  >
                    <option value="">
                      Seleccione motivo de inasistencia
                    </option>

                    <option value="Con excusa">
                      Con excusa
                    </option>

                    <option value="Sin excusa">
                      Sin excusa
                    </option>

                    <option value="Incapacidad">
                      Incapacidad
                    </option>

                    <option value="Permiso">
                      Permiso
                    </option>
                  </select>

                  {/* DESCRIPCIÓN */}
                  <label className="form-label fw-bold">
                    Descripción
                  </label>

                  <textarea
                    className="form-control mb-3"
                    name="observacion"
                    placeholder="Escriba una descripción..."
                    value={formulario.observacion}
                    onChange={manejarCambio}
                    rows="3"
                  />

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setEditar(false);
                      setIdEditar(null);
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    className="btn btn-primary"
                    type="submit"
                  >
                    {editar
                      ? "Guardar cambios"
                      : "Guardar"}
                  </button>

                </div>

              </form>

            </div>
          </div>
        </div>
      )}
      {reportesVer && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Reportes de inasistencias</h5>

                <button
                  className="btn-close"
                  onClick={() => setReportesVer(null)}
                ></button>
              </div>

              <div className="modal-body">
                {inasistencias
                  .filter(
                    (item) =>
                      Number(item.id_estudiante) === Number(reportesVer),
                  )
                  .map((item) => (
                    <div className="border p-2 mb-2" key={item.id_inasistencia}>
                      <strong>Fecha:</strong> {item.fecha.substring(0, 10)}
                      <br />
                      <strong>Tipo:</strong> {item.tipo}
                      <br />
                      <strong>Observación:</strong>{" "}
                      {item.observacion || "Sin observación"}
                    </div>
                  ))}

                <div className="text-center mt-4">
                  <button
                    className="btn btn-naranja"
                    onClick={() => {
                      const estudiante = inasistencias.find(
                        (item) =>
                          Number(item.id_estudiante) === Number(reportesVer),
                      );

                      if (!estudiante) {
                        Swal.fire(
                          "Error",
                          "No se encontró el estudiante",
                          "error",
                        );

                        return;
                      }

                      setEstudianteCarta(estudiante);
                      setReportesVer(null);
                      setMostrarCarta(true);
                    }}
                  >
                    Generar carta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarCarta && (
        <CartaReporte
          tipo="inasistencia"
          estudiante={estudianteCarta}
          total={estudianteCarta?.total_inasistencias}
          onCerrar={() => {
            setMostrarCarta(false);
            cargarInasistencias();
          }}
          onGenerarPDF={() => {}}
        />
      )}
    </div>
  );
}

export default Inasistencias;
















