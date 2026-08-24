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
    setFormulario({
      id_estudiante: item.id_estudiante,
      fecha: item.fecha.substring(0, 10),
      tipo: item.tipo,
      observacion: item.observacion || "",
    });

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
    const alertas = inasistencias.filter(
      (item) => item.total_inasistencias >= 3,
    );

    const estudiantesUnicos = [];

    alertas.forEach((item) => {
      const existe = estudiantesUnicos.find(
        (estudiante) => estudiante.id_estudiante === item.id_estudiante,
      );

      if (!existe) {
        estudiantesUnicos.push(item);
      }
    });

    return estudiantesUnicos;
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
          <h5>⚠️ Alertas de inasistencias</h5>

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
                      className="btn btn-azul btn-sm mt-3"
                      onClick={() => setReportesVer(item.id_estudiante)}
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

            <th>Grado</th>

            <th>Fecha</th>

            <th>Tipo</th>

            <th>Observación</th>

            <th>Estado</th>

            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {inasistencias.map((item) => (
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

      {mostrarFormulario && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editar ? "Editar inasistencia" : "Nueva inasistencia"}</h5>

                <button
                  className="btn-close"
                  onClick={() => setMostrarFormulario(false)}
                ></button>
              </div>

              <form onSubmit={guardarInasistencia}>
                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="🔎 Buscar estudiante por nombre..."
                    value={busquedaEstudiante}
                    onChange={(e) => {
                      setBusquedaEstudiante(e.target.value);
                      setFormulario({
                        ...formulario,
                        id_estudiante: "",
                      });
                    }}
                  />

                  <div
                    style={{
                      maxHeight: "300px",
                      overflowY:
                        estudiantes.filter((estudiante) =>
                          estudiante.nombres
                            ?.toLowerCase()
                            .includes(busquedaEstudiante.toLowerCase())
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
                          .includes(busquedaEstudiante.toLowerCase())
                      )
                      .slice(0, 20)
                      .map((estudiante) => (
                        <div
                          key={estudiante.id_estudiante}
                          onClick={() => {
                            setFormulario({
                              ...formulario,
                              id_estudiante: estudiante.id_estudiante,
                            });

                            setBusquedaEstudiante(
                              `${estudiante.nombres} - ${estudiante.grado}`
                            );
                          }}
                          style={{
                            padding: "10px",
                            cursor: "pointer",
                            borderBottom: "1px solid #eee",
                            background:
                              Number(formulario.id_estudiante) ===
                              Number(estudiante.id_estudiante)
                                ? "#f0f0f0"
                                : "white",
                          }}
                        >
                          {estudiante.nombres} - {estudiante.grado}
                        </div>
                      ))}

                    {estudiantes.length === 0 && (
                      <div className="text-center text-muted p-3">
                        No hay estudiantes disponibles.
                      </div>
                    )}
                  </div>

                  <input
                    className="form-control mb-3"
                    type="date"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={manejarCambio}
                  />

                  <select
                    className="form-control mb-3"
                    name="tipo"
                    value={formulario.tipo}
                    onChange={manejarCambio}
                  >
                    <option value="">Seleccione tipo</option>

                    <option>Con excusa</option>

                    <option>Sin excusa</option>

                    <option>Incapacidad</option>

                    <option>Permiso</option>
                  </select>

                  <textarea
                    className="form-control mb-3"
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
                    onClick={() => setMostrarFormulario(false)}
                  >
                    Cancelar
                  </button>

                  <button className="btn btn-primary" type="submit">
                    Guardar
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
          tipo="inasistencia"
          estudiante={estudianteCarta}
          total={estudianteCarta?.total_inasistencias}
          onCerrar={() => setMostrarCarta(false)}
          onGenerarPDF={() => {}}
        />
      )}
    </div>
  );
}

export default Inasistencias;
