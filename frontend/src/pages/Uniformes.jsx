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

  const cargarUniformes = async () => {
    try {
      const respuesta = await api.get("/uniformes");

      setUniformes(respuesta.data);
    } catch (error) {
      console.log(error);
    }
  };

  const obtenerAlertas = () => {
    const alertas = uniformes.filter((item) => item.total_uniforme >= 3);

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

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [uniformeEditar, setUniformeEditar] = useState(null);

  const [estudiantes, setEstudiantes] = useState([]);

  const [formulario, setFormulario] = useState({
    id_estudiante: "",
    fecha: "",
    hora: "",
    motivo: "",
  });

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

  const guardarUniforme = async (e) => {
    e.preventDefault();

    try {
      await api.post("/uniformes", formulario);

      console.log("Guardado", formulario);

      Swal.fire({
        title: "¡Registrado!",
        text: "El reporte de uniforme fue creado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      setFormulario({
        id_estudiante: "",
        fecha: "",
        hora: "",
        motivo: "",
      });

      setMostrarFormulario(false);

      cargarUniformes();
    } catch (error) {
      console.log(error);

      Swal.fire("Error", "No se pudo registrar el reporte", "error");
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
      await api.put(`/uniformes/${uniformeEditar.id_uniforme}`, uniformeEditar);

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

  return (
    <div className="usuarios-container">
      <div className="usuario-header">
        <h2 className="fw-bold">Control de Uniforme</h2>

        <p className="text-muted">
          Registro de incumplimientos del uniforme escolar
        </p>
      </div>

      {mostrarFormulario && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo reporte de uniforme</h5>

                <button
                  className="btn-close"
                  onClick={() => setMostrarFormulario(false)}
                ></button>
              </div>

              <form onSubmit={guardarUniforme}>
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

                  <input
                    className="form-control mb-3"
                    type="date"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={manejarCambio}
                  />

                  <select
                    className="form-control mb-3"
                    name="motivo"
                    value={formulario.motivo}
                    onChange={manejarCambio}
                  >
                    <option value="">Seleccione motivo</option>

                    <option>Uniforme incorrecto</option>

                    <option>Falta de correa</option>

                    <option>Zapatos incorrectos</option>

                    <option>Medias incorrectas</option>

                    <option>Otro</option>
                  </select>
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

      <div className="tabla-usuarios-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>
            <button
              className="btn btn-naranja"
              onClick={() => setMostrarFormulario(true)}
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
                    onClick={() => eliminarUniforme(item.id_uniforme)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {uniformeEditar && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Editar uniforme</h5>

                <button
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
                  value={uniformeEditar.fecha.substring(0, 10)}
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
                  <option>Camisa incorrecta</option>

                  <option>Zapatos incorrectos</option>

                  <option>Medias incorrectas</option>

                  <option>Falta de correa</option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setUniformeEditar(null)}
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
                <h5>Reportes de uniforme</h5>

                <button
                  className="btn-close"
                  onClick={() => setReportesVer(null)}
                ></button>
              </div>

              <div className="modal-body">
                {uniformes

                  .filter((item) => item.id_estudiante === reportesVer)

                  .map((item) => (
                    <div className="border p-2 mb-2" key={item.id_uniforme}>
                      Fecha:
                      {item.fecha.substring(0, 10)}
                      <br />
                      Motivo:
                      {item.motivo}
                    </div>
                  ))}
                <div className="text-center mt-3">
                  <button
                    className="btn btn-naranja mt-3"
                    onClick={() => {
                      const estudiante = uniformes.find(
                        (item) => item.id_estudiante === reportesVer,
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
