import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { FaTrash } from "react-icons/fa";
import "../styles/usuarios.css";

function Cartas() {
  const [cartas, setCartas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarCartas = async () => {
    try {
      setCargando(true);

      const respuesta = await api.get("/cartas");

      setCartas(respuesta.data);
    } catch (error) {
      console.error("Error cargando cartas:", error);

      Swal.fire("Error", "No se pudieron cargar las cartas generadas", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCartas();
  }, []);

  const eliminarCarta = async (id) => {
    const resultado = await Swal.fire({
      title: "¿Eliminar carta?",
      text: "Este registro se eliminará de la base de datos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });

    if (!resultado.isConfirmed) {
      return;
    }

    try {
      await api.delete(`/cartas/${id}`);

      Swal.fire({
        title: "Eliminada",
        text: "La carta fue eliminada correctamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      cargarCartas();
    } catch (error) {
      console.error(error);

      Swal.fire("Error", "No se pudo eliminar la carta", "error");
    }
  };

  return (
    <div className="usuarios-container">
      <div className="usuario-header">
        <h2 className="fw-bold">Cartas generadas</h2>

        <p className="text-muted">
          Historial de cartas y reportes generados por el sistema
        </p>
      </div>

      {cargando ? (
        <div className="alert alert-info">Cargando cartas...</div>
      ) : cartas.length === 0 ? (
        <div className="alert alert-secondary">
          No hay cartas generadas todavía.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>N°</th>
                <th>Estudiante</th>
                <th>Documento</th>
                <th>Grado</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Archivo</th>
                <th>Observación</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cartas.map((carta) => (
                <tr key={carta.id_carta}>
                  <td>
                    <strong>{carta.numero_reporte}</strong>
                  </td>

                  <td>{carta.nombres}</td>

                  <td>{carta.documento}</td>

                  <td>{carta.grado}</td>

                  <td>
                    {carta.tipo === "llegada" && (
                      <span className="badge bg-warning text-dark">
                        Llegada tarde
                      </span>
                    )}

                    {carta.tipo === "inasistencia" && (
                      <span className="badge bg-danger">Inasistencia</span>
                    )}

                    {carta.tipo === "uniforme" && (
                      <span className="badge bg-primary">Uniforme</span>
                    )}
                  </td>

                  <td>
                    {carta.fecha_generacion
                      ? new Date(carta.fecha_generacion).toLocaleDateString(
                          "es-CO",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        )
                      : "Sin fecha"}
                  </td>

                  <td>{carta.archivo_pdf || "Sin archivo"}</td>

                  <td>{carta.observacion || "Sin observación"}</td>

                  <td>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => eliminarCarta(carta.id_carta)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Cartas;
