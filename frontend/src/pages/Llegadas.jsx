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

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [llegadaEditar, setLlegadaEditar] = useState(null);

  const [totalLlegadas, setTotalLlegadas] = useState(0);

  const [configuracion, setConfiguracion] = useState(null);

  const [formulario, setFormulario] = useState({
    id_estudiante: "",
    fecha: "",
    hora: "",
    observacion: "",
  });

  const cargarLlegadas = async () => {
    try {
      const respuesta = await api.get("/llegadas");

      setLlegadas(respuesta.data);
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

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,

      [e.target.name]: e.target.value,
    });

    if (e.target.name === "id_estudiante") {
      consultarLlegadasEstudiante(e.target.value);
    }
  };

  const guardarLlegada = async (e) => {
    e.preventDefault();

    const horaMinima = configuracion?.hora_entrada || "06:20";

    if (formulario.hora < horaMinima) {
      Swal.fire({
        title: "Hora no vÃ¡lida",
        text: `Las llegadas tarde solo se registran desde las ${horaMinima}.`,
        icon: "warning",
        confirmButtonText: "Aceptar",
      });

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
        hora: "",
        observacion: "",
      });

      setMostrarFormulario(false);

      cargarLlegadas();
    } catch (error) {
      console.log(error);

      Swal.fire("Error", "No se pudo registrar la llegada", "error");
    }
  };

  const guardarEdicion = async () => {
    try {
      await api.put(`/llegadas/${llegadaEditar.id_llegada}`, llegadaEditar);

      Swal.fire({
        title: "Actualizado",

        text: "La llegada tarde fue modificada correctamente",

        icon: "success",
      });

      setLlegadaEditar(null);

      cargarLlegadas();
    } catch (error) {
      console.log(error);

      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  const eliminarLlegada = async (id) => {
    const resultado = await Swal.fire({
      title: "Â¿Eliminar registro?",

      text: "Esta acciÃ³n no se puede deshacer",

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "SÃ­, eliminar",

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
    }
  };

  const consultarLlegadasEstudiante = async (id_estudiante) => {
    setTotalLlegadas(0);
    try {
      const respuesta = await api.get(`/llegadas/estudiante/${id_estudiante}`);

      setTotalLlegadas(respuesta.data.total);
    } catch (error) {
      console.log(error);
    }
  };

  const obtenerAlertas = () => {
    const alertas = llegadas.filter((item) => item.total_llegadas >= 3);

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
      <div className="usuario-header">
        <h2 className="fw-bold">Llegadas tarde</h2>

        <p className="text-muted">Control de retardos de estudiantes</p>
      </div>

      <button
        className="btn btn-naranja mb-3"
        onClick={() => setMostrarFormulario(true)}
      >
        + Registrar llegada tarde
      </button>

      {mostrarFormulario && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Nueva llegada tarde</h5>

                <button
                  className="btn-close"
                  onClick={() => setMostrarFormulario(false)}
                ></button>
              </div>

              <form onSubmit={guardarLlegada}>
                <div className="modal-body">
                  <select
                    className="form-control mb-3"
                    name="id_estudiante"
                    value={formulario.id_estudiante}
                    onChange={manejarCambio}
                  >
                    <option value="">Seleccione estudiante</option>

                    {estudiantes.map((estudiante) => (
                      <option
                        key={estudiante.id_estudiante}
                        value={estudiante.id_estudiante}
                      >
                        {estudiante.nombres} - {estudiante.grado}
                      </option>
                    ))}
                  </select>

                  {totalLlegadas > 0 && (
                    <div className="alert alert-info">
                      Este estudiante tiene
                      <strong> {totalLlegadas} </strong>
                      llegada(s) tarde este mes.
                    </div>
                  )}

                  <input
                    className="form-control mb-3"
                    type="date"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={manejarCambio}
                  />

                  <input
                    className="form-control mb-3"
                    type="time"
                    name="hora"
                    value={formulario.hora}
                    onChange={manejarCambio}
                  />

                  <textarea
                    className="form-control"
                    name="observacion"
                    placeholder="ObservaciÃ³n"
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

                  <button className="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {obtenerAlertas().length > 0 && (
        <div className="alert alert-danger">
          <h5>âš ï¸ Alertas de llegadas tardes</h5>

          {obtenerAlertas().map((item) => (
            <div key={item.id_estudiante} className="mb-3 p-2 rounded">
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
                className="btn btn-azul btn-sm mt-2"
                onClick={() => setReportesVer(item.id_estudiante)}
              >
                Ver reportes
              </button>
            </div>
          ))}
        </div>
      )}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Estudiante</th>

            <th>Grado</th>

            <th>Fecha</th>

            <th>Hora</th>

            <th>ObservaciÃ³n</th>

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
                  ? new Date(llegada.fecha).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "Sin fecha"}
              </td>

              <td>{llegada.hora}</td>

              <td>{llegada.observacion}</td>

              <td>{llegada.total_mes}</td>

              <td>
                {llegada.genero_alerta === 1 ? (
                  <span className="badge bg-danger">Generar carta</span>
                ) : llegada.total_mes === 2 ? (
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
                  onClick={() => setLlegadaEditar(llegada)}
                >
                  <FaEdit />
                </button>

                <button
                  className="btn btn-outline-danger"
                  onClick={() => eliminarLlegada(llegada.id_llegada)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {llegadaEditar && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Editar llegada tarde</h5>

                <button
                  className="btn-close"
                  onClick={() => setLlegadaEditar(null)}
                ></button>
              </div>

              <div className="modal-body">
                <select
                  className="form-control mb-3"
                  value={llegadaEditar.id_estudiante}
                  onChange={(e) =>
                    setLlegadaEditar({
                      ...llegadaEditar,

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
                  value={llegadaEditar.fecha}
                  onChange={(e) =>
                    setLlegadaEditar({
                      ...llegadaEditar,

                      fecha: e.target.value,
                    })
                  }
                />

                <input
                  className="form-control mb-3"
                  type="time"
                  value={llegadaEditar.hora}
                  onChange={(e) =>
                    setLlegadaEditar({
                      ...llegadaEditar,

                      hora: e.target.value,
                    })
                  }
                />

                <textarea
                  className="form-control"
                  value={llegadaEditar.observacion}
                  onChange={(e) =>
                    setLlegadaEditar({
                      ...llegadaEditar,

                      observacion: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setLlegadaEditar(null)}
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

      {reportesVer && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Reportes de llegadas tardes</h5>

                <button
                  className="btn-close"
                  onClick={() => setReportesVer(null)}
                ></button>
              </div>

              <div className="modal-body">
                {llegadas

                  .filter((item) => item.id_estudiante === reportesVer)

                  .map((item) => (
                    <div className="border p-2 mb-2" key={item.id_llegada}>
                      Fecha:
                      {item.fecha.substring(0, 10)}
                      <br />
                      Hora:
                      {item.hora}
                      <br />
                      ObservaciÃ³n:
                      {item.observacion}
                    </div>
                  ))}
                <div className="text-center mt-4">
                  <button
                    className="btn btn-naranja"
                    onClick={() => {
                      const estudiante = llegadas.find(
                        (item) => item.id_estudiante === reportesVer,
                      );

                      setEstudianteCarta(estudiante);
                      setMostrarCarta(true);
                    }}
                  >
                    ðŸ“„ Generar carta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarCarta && (
        <CartaReporte
          tipo="llegada"
          estudiante={estudianteCarta}
          total={estudianteCarta?.total_llegadas}
          onCerrar={() => setMostrarCarta(false)}
          onGenerarPDF={() => {}}
        />
      )}
    </div>
  );
}

export default Llegadas;