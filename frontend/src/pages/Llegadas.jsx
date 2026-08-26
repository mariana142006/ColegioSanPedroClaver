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
  const [estudiantes, setEstudiantes] = useState([]);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [llegadaEditar, setLlegadaEditar] = useState(null);
  const [totalLlegadas, setTotalLlegadas] = useState(0);
  const [configuracion, setConfiguracion] = useState(null);

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

      Swal.fire(
        "Error",
        "No se pudo registrar la llegada",
        "error"
      );
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
    const conteo = {};

    llegadas.forEach((item) => {
      const id = Number(item.id_estudiante);

      if (!id) return;

      if (!conteo[id]) {
        const estudiante = estudiantes.find(
          (e) => Number(e.id_estudiante) === id
        );

        conteo[id] = {
          id_estudiante: id,
          nombres: item.nombres,
          grado: item.grado,
          total_llegadas: 0,
          carta_generada: Number(item.carta_generada || 0),
          telefono_acudiente: estudiante?.telefono_acudiente || "",
          nombre_acudiente: estudiante?.nombre_acudiente || "",
        };
      }

      conteo[id].total_llegadas++;
    });

    return Object.values(conteo).filter(
      (item) =>
        Math.floor(Number(item.total_llegadas) / 3) >
        Number(item.carta_generada || 0)
    );
  };
  // ============================================================
  // NOTIFICAR ACUDIENTE POR WHATSAPP
  // ============================================================
  const notificarAcudienteWhatsApp = (item) => {
    if (!item.telefono_acudiente) {
      Swal.fire(
        "Sin teléfono",
        "Este estudiante no tiene registrado un número de acudiente.",
        "warning"
      );
      return;
    }

    let telefono = String(item.telefono_acudiente)
      .replace(/\D/g, "");

    // Si el número está guardado como celular colombiano de 10 dígitos
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

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");
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

                      setTotalLlegadas(0);
                    }}
                  />

                  {/* LISTA ESTUDIANTES */}
                  <div
                    style={{
                      maxHeight: "300px",
                      overflowY:
                        estudiantes.filter((estudiante) =>
                          estudiante.nombres
                            ?.toLowerCase()
                            .includes(
                              busquedaEstudiante.toLowerCase()
                            )
                        ).length > 8
                          ? "auto"
                          : "hidden",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      marginBottom: "16px",
                    }}
                  >

                    {estudiantes
                      .filter((estudiante) =>
                        estudiante.nombres
                          ?.toLowerCase()
                          .includes(
                            busquedaEstudiante.toLowerCase()
                          )
                      )
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

                            consultarLlegadasEstudiante(
                              estudiante.id_estudiante
                            );
                          }}
                          style={{
                            padding: "10px",
                            cursor: "pointer",
                            borderBottom:
                              "1px solid #eee",
                            background:
                              Number(
                                formulario.id_estudiante
                              ) ===
                              Number(
                                estudiante.id_estudiante
                              )
                                ? "#f0f0f0"
                                : "white",
                          }}
                        >
                          {estudiante.nombres} -{" "}
                          {estudiante.grado}
                        </div>
                      ))}

                    {estudiantes.length === 0 && (
                      <div className="text-center text-muted p-3">
                        No hay estudiantes disponibles.
                      </div>
                    )}

                  </div>

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
                  <input
                    className="form-control mb-3"
                    type="date"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={manejarCambio}
                  />

                  {/* OBSERVACION */}
                  <textarea
                    className="form-control"
                    name="observacion"
                    placeholder="Observación"
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
              key={item.id_estudiante}
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

              <button
                className="btn btn-success btn-sm mt-2"
                onClick={() =>
                  notificarAcudienteWhatsApp(item)
                }
              >
                Notificar acudiente por WhatsApp
              </button>
            </div>
          ))}

        </div>
      )}

      {/* ==========================================
          TABLA
      ========================================== */}
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

          {llegadas.map((llegada) => (
            <tr key={llegada.id_llegada}>

              <td>{llegada.nombres}</td>

              <td>{llegada.grado}</td>

              <td>
                {llegada.fecha
                  ? new Date(
                      llegada.fecha
                    ).toLocaleDateString(
                      "es-CO",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }
                    )
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

                {llegada.genero_alerta === 1 ? (
                  <span className="badge bg-danger">
                    Generar carta
                  </span>
                ) : llegada.total_mes === 2 ? (
                  <span className="badge bg-warning text-dark">
                    Seguimiento
                  </span>
                ) : (
                  <span className="badge bg-success">
                    Normal
                  </span>
                )}

              </td>

              <td>

                <button
                  className="btn btn-outline-primary me-2"
                  onClick={() =>
                    setLlegadaEditar(llegada)
                  }
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

                <select
                  className="form-control mb-3"
                  value={
                    llegadaEditar.id_estudiante
                  }
                  onChange={(e) =>
                    setLlegadaEditar({
                      ...llegadaEditar,
                      id_estudiante:
                        e.target.value,
                    })
                  }
                >

                  {estudiantes.map(
                    (estudiante) => (
                      <option
                        key={
                          estudiante.id_estudiante
                        }
                        value={
                          estudiante.id_estudiante
                        }
                      >
                        {estudiante.nombres} -{" "}
                        {estudiante.grado}
                      </option>
                    )
                  )}

                </select>

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
                      const estudiante =
                        llegadas.find(
                          (item) =>
                            Number(
                              item.id_estudiante
                            ) ===
                            Number(reportesVer)
                        );

                      setEstudianteCarta(
                        estudiante
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
          onCerrar={() => { setMostrarCarta(false); cargarLlegadas(); }}
          onGenerarPDF={() => {}}
        />
      )}

    </div>
  );
}

export default Llegadas;
