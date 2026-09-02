import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/usuarios.css";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";
import CartaReporte from "../components/CartaReporte";

function Llegadas() {
  const [llegadas, setLlegadas] = useState([]);
  const [reportesVer, setReportesVer] = useState(null);
  const [mostrarCarta, setMostrarCarta] = useState(false);
  const [estudianteCarta, setEstudianteCarta] = useState(null);
  const [fechaCarta, setFechaCarta] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
  const [busquedaEstudianteEditar, setBusquedaEstudianteEditar] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [llegadaEditar, setLlegadaEditar] = useState(null);
  const [totalLlegadas, setTotalLlegadas] = useState(0);
  const [configuracion, setConfiguracion] = useState(null);
  const [busqueda, setBusqueda] = useState("");


  const [paginaActual, setPaginaActual] = useState(1);

  const llegadasPorPagina = 10;
  const [formulario, setFormulario] = useState({
    id_estudiante: "",
    fecha: "",
    observacion: "",
  });

  // ==========================================
  // CARGAR LLEGADAS
  // ==========================================
  const cargarLlegadas = async () => {
    try {
      const respuesta = await api.get("/llegadas");
      setLlegadas(respuesta.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // CARGAR ESTUDIANTES
  // ==========================================
  const cargarEstudiantes = async () => {
    try {
      const respuesta = await api.get("/estudiantes");
      setEstudiantes(respuesta.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // CARGAR CONFIGURACION
  // ==========================================
  const cargarConfiguracion = async () => {
    try {
      const respuesta = await api.get("/configuracion");
      setConfiguracion(respuesta.data);
    } catch (error) {
      console.log(error);
    }
  };


  const llegadasFiltradas = llegadas.filter((llegada) => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return true;

    return (
      String(llegada.nombres || "").toLowerCase().includes(texto) ||
      String(llegada.documento || "").toLowerCase().includes(texto) ||
      String(llegada.grado || "").toLowerCase().includes(texto)
    );
  });

  const totalPaginas = Math.ceil(
    llegadas.length / llegadasPorPagina,
  );

  const indiceInicial =
    (paginaActual - 1) * llegadasPorPagina;

  const indiceFinal =
    indiceInicial + llegadasPorPagina;

  const llegadasPagina = llegadasFiltradas.slice(
    indiceInicial,
    indiceFinal,
  );
  useEffect(() => {
    cargarLlegadas();
    cargarEstudiantes();
    cargarConfiguracion();
  }, []);

  // ==========================================
  // CAMBIOS DEL FORMULARIO
  // ==========================================
  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "id_estudiante") {
      consultarLlegadasEstudiante(e.target.value);
    }
  };

  // ==========================================
  // GUARDAR LLEGADA
  // ==========================================
  const guardarLlegada = async (e) => {
    e.preventDefault();

    if (!formulario.id_estudiante) {
      Swal.fire("Atención", "Seleccione un estudiante", "warning");
      return;
    }

    if (!formulario.fecha) {
      Swal.fire("Atención", "Seleccione la fecha", "warning");
      return;
    }

    try {
      await api.post("/llegadas", formulario);

      Swal.fire({
        title: "Registrado",
        text: "Llegada tarde registrada correctamente",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      setFormulario({
        id_estudiante: "",
        fecha: "",
        observacion: "",
      });

      setBusquedaEstudiante("");
      setTotalLlegadas(0);
      setMostrarFormulario(false);

      cargarLlegadas();
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "No se puede registrar",
        text:
          error.response?.data?.mensaje ||
          "No se pudo registrar la llegada",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
    }
  };

  // ==========================================
  // GUARDAR EDICION
  // LA HORA ORIGINAL NO SE MODIFICA
  // ==========================================
  const guardarEdicion = async () => {
    try {
      await api.put(
        `/llegadas/${llegadaEditar.id_llegada}`,
        llegadaEditar
      );

      Swal.fire({
        title: "Actualizado",
        text: "La llegada tarde fue modificada correctamente",
        icon: "success",
      });

      setLlegadaEditar(null);
      cargarLlegadas();
    } catch (error) {
      console.log(error);

      Swal.fire(
        "Error",
        "No se pudo actualizar",
        "error"
      );
    }
  };

  // ==========================================
  // ELIMINAR LLEGADA
  // ==========================================
  const eliminarLlegada = async (id) => {
    const resultado = await Swal.fire({
      title: "¿Eliminar registro?",
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
      await api.delete(`/llegadas/${id}`);

      Swal.fire({
        title: "Eliminado",
        text: "Registro eliminado correctamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      cargarLlegadas();
    } catch (error) {
      console.log(error);

      Swal.fire(
        "Error",
        "No se pudo eliminar el registro",
        "error"
      );
    }
  };

  // ==========================================
  // CONTAR LLEGADAS DEL ESTUDIANTE
  // ==========================================
  const consultarLlegadasEstudiante = async (id_estudiante) => {
    if (!id_estudiante) {
      setTotalLlegadas(0);
      return;
    }

    try {
      const respuesta = await api.get(
        `/llegadas/estudiante/${id_estudiante}`
      );

      setTotalLlegadas(respuesta.data.total);
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // OBTENER ALERTAS
  // ==========================================
  const obtenerAlertas = () => {
    const grupos = {};

    llegadas.forEach((item) => {
      const idEstudiante = Number(item.id_estudiante);
      const grupo = Number(item.grupo_alerta || 0);
      const generoAlerta = Number(item.genero_alerta || 0);

      if (!idEstudiante || !grupo || generoAlerta !== 1) {
        return;
      }

      const clave = `${idEstudiante}-${grupo}`;

      // El registro con genero_alerta = 1
      // es el tercer registro de ese grupo.
      // Cada grupo tiene su propia alerta.
      if (
        !grupos[clave] ||
        Number(item.id_llegada || 0) >
          Number(grupos[clave].id_llegada || 0)
      ) {
        grupos[clave] = {
          ...item,
          total_llegadas: Number(item.total_mes || 0),
        };
      }
    });

    return Object.values(grupos).filter((item) => {
      const cartaGenerada =
        Number(item.carta_generada || 0) > 0;

      const whatsappNotificado =
        Number(item.notificado_whatsapp || 0) > 0;

      // Carta y WhatsApp atienden la misma alerta.
      // Si ninguna de las dos acciones se ha realizado,
      // la alerta debe aparecer.
      return !cartaGenerada && !whatsappNotificado;
    });
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
      `del grado ${item.grado}, ha acumulado ${item.total_llegadas} ` +
      `llegadas tarde. ` +
      `Agradecemos su atención y acompañamiento en el cumplimiento ` +
      `de los horarios de ingreso al Colegio San Pedro Claver.`;

    const url =
      `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    const ventanaWhatsApp = window.open("about:blank", "_blank");

    try {
      const respuestaNumero = await api.get("/cartas/numero");

      const numeroReporte = respuestaNumero.data.numero;

      await api.post("/cartas", {
        id_estudiante: item.id_estudiante,
        grupo_alerta: item.grupo_alerta,
        tipo: "llegada",
        numero_reporte: numeroReporte,
        fecha_generacion: item.fecha
          ? String(item.fecha).substring(0, 10)
          : new Date().toISOString().split("T")[0],
        archivo_pdf: null,
        observacion: "Notificado por WhatsApp",
      });

      if (ventanaWhatsApp) {
        ventanaWhatsApp.location.href = url;
      } else {
        window.open(url, "_blank");
      }

      await cargarLlegadas();

      Swal.fire({
        title: "Notificación realizada",
        text: "Se notificó al acudiente por WhatsApp y la alerta fue registrada.",
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

      {/* ==========================================
          ENCABEZADO
      ========================================== */}
      <div className="usuario-header">
        <h2 className="fw-bold">Llegadas tarde</h2>

        <p className="text-muted">
          Control de retardos de estudiantes
        </p>
      </div>

      {/* ==========================================
          BOTON REGISTRAR
      ========================================== */}
      <button
        className="btn btn-naranja mb-3"
        onClick={() => setMostrarFormulario(true)}
      >
        + Registrar llegada tarde
      </button>

      {/* ==========================================
          MODAL NUEVA LLEGADA
      ========================================== */}
      {mostrarFormulario && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5>Nueva llegada tarde</h5>

                <button
                  className="btn-close"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setBusquedaEstudiante("");
                    setTotalLlegadas(0);
                  }}
                ></button>
              </div>

              <form onSubmit={guardarLlegada}>

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
                      const valor = e.target.value;

                      setBusquedaEstudiante(valor);

                      setFormulario({
                        ...formulario,
                        id_estudiante: "",
                      });

                      setTotalLlegadas(0);
                    }}
                  />

                  {/* LISTA ESTUDIANTES */}
                  {busquedaEstudiante.trim() && !formulario.id_estudiante && (
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
                            busquedaEstudiante.toLowerCase().trim();

                          const nombre =
                            estudiante.nombres?.toLowerCase() || "";

                          const documento =
                            String(estudiante.documento || "").toLowerCase();

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
                                estudiante.nombres +
                                  " - " +
                                  estudiante.documento +
                                  " - " +
                                  estudiante.grado
                              );

                              consultarLlegadasEstudiante(
                                estudiante.id_estudiante
                              );
                            }}
                            style={{
                              padding: "10px",
                              cursor: "pointer",
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            <strong>{estudiante.nombres}</strong>
                            <br />
                            <small className="text-muted">
                              Documento: {estudiante.documento} | Grado:{" "}
                              {estudiante.grado}
                            </small>
                          </div>
                        ))}

                      {estudiantes.filter((estudiante) => {
                        const texto =
                          busquedaEstudiante.toLowerCase().trim();

                        const nombre =
                          estudiante.nombres?.toLowerCase() || "";

                        const documento =
                          String(estudiante.documento || "").toLowerCase();

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

                  {/* TOTAL DEL MES */}
                  {totalLlegadas > 0 && (
                    <div className="alert alert-info">
                      Este estudiante tiene
                      <strong>
                        {" "}
                        {totalLlegadas}{" "}
                      </strong>
                      llegada(s) tarde este mes.
                    </div>
                  )}
                  {/* FECHA */}
                  <label className="form-label fw-bold">Fecha</label>
                  <input
                    className="form-control mb-3"
                    type="date"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={manejarCambio}
                  />

                  {/* MOTIVO DE LLEGADA TARDE */}
                  <label className="form-label fw-bold">Motivo de llegada tarde</label>
                  <textarea
                    className="form-control"
                    name="observacion"
                    placeholder="Escriba el motivo de la llegada tarde"
                    value={formulario.observacion}
                    onChange={manejarCambio}
                  />

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setBusquedaEstudiante("");
                      setTotalLlegadas(0);
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Guardar
                  </button>

                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          ALERTAS
      ========================================== */}
      {obtenerAlertas().length > 0 && (
        <div className="alert alert-danger">

          <h5>Alertas de llegadas tarde</h5>

          {obtenerAlertas().map((item) => (
            <div
              key={`${item.id_estudiante}-${item.grupo_alerta}`}
              className="mb-3 p-2 rounded"
            >
              <strong>{item.nombres}</strong>

              <br />

              Grado: {item.grado}

              <br />

              Total llegadas:

              <span className="badge bg-danger ms-2">
                {item.total_llegadas}
              </span>

              <br />

              <button
                className="btn btn-azul btn-sm mt-2 me-2"
                onClick={() =>
                  setReportesVer(item.id_estudiante)
                }
              >
                Ver reportes
              </button>
            </div>
          ))}

        </div>
      )}

      {/* ==========================================
          TABLA
      ========================================== */}
      <div className="input-group mb-3">
        <span className="input-group-text">
          Buscar
        </span>

        <input
          type="text"
          className="form-control"
          placeholder="Buscar por estudiante, documento o grado..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaActual(1);
          }}
        />
      </div>

      {busqueda.trim() && (
        <p className="text-muted">
          Mostrando {llegadasFiltradas.length} de {llegadas.length} registros.
        </p>
      )}
      <table className="table table-striped">

        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Grado</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Observación</th>
            <th>Total mes</th>
            <th>Alerta</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>

          {llegadasPagina.map((llegada) => (
            <tr key={llegada.id_llegada}>

              <td>{llegada.nombres}</td>

              <td>{llegada.grado}</td>

              <td>
                {llegada.fecha
  ? String(llegada.fecha).substring(0, 10).split("-").reverse().join("/")
  : "Sin fecha"}
              </td>

              {/* IMPORTANTE:
                  LA HORA SE MANTIENE EN LLEGADAS */}
              <td>{llegada.hora}</td>

              <td>
                {llegada.observacion}
              </td>

              <td>
                {llegada.total_mes}
              </td>

              <td>
                {(() => {
                  // ==========================================
                  // LOGICA POR GRUPOS DE 3
                  //
                  // 1,2,3 = GRUPO 1
                  // 4,5,6 = GRUPO 2
                  // 7,8,9 = GRUPO 3
                  //
                  // Cada grupo es independiente.
                  // ==========================================

                  const grupo = Number(llegada.grupo_alerta || 0);

                  const registrosGrupo = llegadas.filter(
                    (registro) =>
                      Number(registro.id_estudiante) ===
                        Number(llegada.id_estudiante) &&
                      Number(registro.grupo_alerta || 0) === grupo
                  ).length;

                  const cartaGenerada =
                    Number(llegada.carta_generada || 0) > 0;

                  const whatsappNotificado =
                    Number(llegada.notificado_whatsapp || 0) > 0;

                  // ==========================================
                  // GRUPO YA ATENDIDO
                  // ==========================================

                  if (cartaGenerada) {
                    return (
                      <span className="badge bg-success">
                        Carta generada
                      </span>
                    );
                  }

                  if (whatsappNotificado) {
                    return (
                      <span className="badge bg-success">
                        Notificado por WhatsApp
                      </span>
                    );
                  }

                  // ==========================================
                  // ESTADO DEL GRUPO
                  // ==========================================

                  if (registrosGrupo >= 3) {
                    return (
                      <span className="badge bg-danger">
                        Generar carta
                      </span>
                    );
                  }

                  if (registrosGrupo === 2) {
                    return (
                      <span className="badge bg-warning text-dark">
                        Seguimiento
                      </span>
                    );
                  }

                  return (
                    <span className="badge bg-secondary">
                      Normal
                    </span>
                  );
                })()}
              </td>


<td>

                <button
                  className="btn btn-outline-primary me-2"
                  onClick={() => {
                    setLlegadaEditar(llegada);
                    setBusquedaEstudianteEditar(
                      `${llegada.nombres} - ${llegada.documento} - ${llegada.grado}`
                    );
                  }}
                >
                  <FaEdit />
                </button>

                <button
                  className="btn btn-outline-danger"
                  onClick={() =>
                    eliminarLlegada(
                      llegada.id_llegada
                    )
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
          {llegadas.length === 0 ? 0 : indiceInicial + 1} -{" "}
          {Math.min(indiceFinal, llegadas.length)} de{" "}
          {llegadas.length} registros
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

      {/* ==========================================
          MODAL EDITAR
      ========================================== */}
      {llegadaEditar && (
        <div className="modal d-block bg-dark bg-opacity-50">

          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">

                <h5>
                  Editar llegada tarde
                </h5>

                <button
                  className="btn-close"
                  onClick={() =>
                    setLlegadaEditar(null)
                  }
                ></button>

              </div>

              <div className="modal-body">

                {/* BUSCAR ESTUDIANTE PARA EDITAR */}
                <label className="form-label fw-bold">
                  Buscar estudiante
                </label>

                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Escriba nombre o documento..."
                  value={busquedaEstudianteEditar}
                  onChange={(e) => {
                    setBusquedaEstudianteEditar(e.target.value);

                    setLlegadaEditar({
                      ...llegadaEditar,
                      id_estudiante: "",
                    });
                  }}
                />

                {/* LISTA DE ESTUDIANTES */}
                {busquedaEstudianteEditar.trim() &&
                  !llegadaEditar.id_estudiante && (
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
                              setLlegadaEditar({
                                ...llegadaEditar,
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
                              Documento:{" "}
                              {estudiante.documento} | Grado:{" "}
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

                {/* ESTUDIANTE SELECCIONADO */}
                {llegadaEditar.id_estudiante && (
                  <div className="alert alert-success py-2">
                    <strong>
                      Estudiante seleccionado:
                    </strong>{" "}
                    {busquedaEstudianteEditar}
                  </div>
                )}

                <label className="form-label fw-bold">Fecha</label>



                <input
                  className="form-control mb-3"
                  type="date"
                  value={
                    llegadaEditar.fecha
                      ? String(
                          llegadaEditar.fecha
                        ).substring(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setLlegadaEditar({
                      ...llegadaEditar,
                      fecha: e.target.value,
                    })
                  }
                />

                <label className="form-label fw-bold">Motivo de llegada tarde</label>



                <textarea
                  className="form-control"
                  value={
                    llegadaEditar.observacion || ""
                  }
                  onChange={(e) =>
                    setLlegadaEditar({
                      ...llegadaEditar,
                      observacion:
                        e.target.value,
                    })
                  }
                />

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setLlegadaEditar(null)
                  }
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

      {/* ==========================================
          MODAL REPORTES
      ========================================== */}
      {reportesVer && (
        <div className="modal d-block bg-dark bg-opacity-50">

          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">

                <h5>
                  Reportes de llegadas tarde
                </h5>

                <button
                  className="btn-close"
                  onClick={() =>
                    setReportesVer(null)
                  }
                ></button>

              </div>

              <div className="modal-body">

                {llegadas
                  .filter(
                    (item) =>
                      Number(
                        item.id_estudiante
                      ) ===
                      Number(reportesVer)
                  )
                  .map((item) => (
                    <div
                      className="border p-2 mb-2"
                      key={item.id_llegada}
                    >
                      Fecha:{" "}
                      {item.fecha
                        ? String(
                            item.fecha
                          ).substring(0, 10)
                        : "Sin fecha"}

                      <br />

                      Hora: {item.hora}

                      <br />

                      Observación:{" "}
                      {item.observacion}
                    </div>
                  ))}

                <div className="text-center mt-4">

                  <button
                    className="btn btn-naranja"
                    onClick={() => {
                      const estudiante = llegadas.find((item) => Number(item.id_estudiante) === Number(reportesVer) && Number(item.grupo_alerta || 0) === Math.max(...llegadas.filter((r) => Number(r.id_estudiante) === Number(reportesVer)).map((r) => Number(r.grupo_alerta || 0))));

                      setEstudianteCarta(
                        estudiante
                      );

                      setFechaCarta(
                        estudiante?.fecha
                          ? String(estudiante.fecha).substring(0, 10)
                          : null
                      );

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

      {/* ==========================================
          CARTA
      ========================================== */}
      {mostrarCarta && (
        <CartaReporte
          tipo="llegada"
          estudiante={estudianteCarta}
          total={estudianteCarta?.total_mes}
          grupoAlerta={estudianteCarta?.grupo_alerta}
          fechaLlegada={fechaCarta}
          onCerrar={() => { setMostrarCarta(false); cargarLlegadas(); }}
          onGenerarPDF={() => {}}
        />
      )}

    </div>
  );
}

export default Llegadas;







































