import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import CartaReporte from "../components/CartaReporte";
import { FaSearch, FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoColegio from "../assets/logo-colegio.png";

function Reportes() {
  const [cartas, setCartas] = useState([]);
  const [cartaVer, setCartaVer] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const reportesPorPagina = 3;

  const cargarCartas = async () => {
    try {
      setCargando(true);
      const respuesta = await api.get("/cartas");
      setCartas(respuesta.data);
    } catch (error) {
      console.error("Error cargando reportes:", error);
      Swal.fire("Error", "No se pudieron cargar los reportes", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCartas();
  }, []);

  const eliminarCarta = async (id) => {
    const resultado = await Swal.fire({
      title: "¿Eliminar reporte?",
      text: "Este registro se eliminará de la base de datos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });

    if (!resultado.isConfirmed) return;

    try {
      await api.delete(`/cartas/${id}`);

      await Swal.fire({
        title: "Eliminado",
        text: "El reporte fue eliminado correctamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      cargarCartas();
    } catch (error) {
      console.error("Error eliminando reporte:", error);
      Swal.fire("Error", "No se pudo eliminar el reporte.", "error");
    }
  };

  const cartasFiltradas = cartas.filter((carta) => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return true;

    return (
      String(carta.nombres || "").toLowerCase().includes(texto) ||
      String(carta.documento || "").toLowerCase().includes(texto) ||
      String(carta.grado || "").toLowerCase().includes(texto)
    );
  });

  const totalPaginas = Math.ceil(
    cartasFiltradas.length / reportesPorPagina
  );

  const indiceInicial =
    (paginaActual - 1) * reportesPorPagina;

  const indiceFinal =
    indiceInicial + reportesPorPagina;

  const cartasPagina = cartasFiltradas.slice(
    indiceInicial,
    indiceFinal
  );

  const generarReporteGeneral = () => {
    const pdf = new jsPDF();

    const fecha = new Date().toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    pdf.addImage(logoColegio, "PNG", 15, 10, 25, 25);

    pdf.setTextColor(11, 45, 92);
    pdf.setFontSize(16);

    pdf.text("COLEGIO SAN PEDRO CLAVER", 105, 18, {
      align: "center",
    });

    pdf.setFontSize(13);

    pdf.text("Reporte general de cartas generadas", 105, 28, {
      align: "center",
    });

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);

    pdf.text(`Fecha de generación: ${fecha}`, 105, 36, {
      align: "center",
    });

    pdf.text(`Total de reportes: ${cartas.length}`, 105, 43, {
      align: "center",
    });

    const datos = cartas.map((carta, index) => [
      String(index + 1).padStart(4, "0"),
      carta.nombres,
      carta.documento,
      carta.grado,
      carta.tipo,
      carta.fecha_generacion
        ? new Date(carta.fecha_generacion).toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "Sin fecha",
    ]);

    autoTable(pdf, {
      startY: 50,
      head: [
        [
          "N° Reporte",
          "Estudiante",
          "Documento",
          "Grado",
          "Tipo",
          "Fecha",
        ],
      ],
      body: datos,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: "center",
      },
      headStyles: {
        fillColor: [11, 45, 92],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
        5: { cellWidth: 25 },
      },
    });

    const altoPagina = pdf.internal.pageSize.height;

    pdf.setFontSize(10);

    pdf.text("____________________________", 105, altoPagina - 35, {
      align: "center",
    });

    pdf.text("Firma Coordinación Académica", 105, altoPagina - 28, {
      align: "center",
    });

    pdf.text("Colegio San Pedro Claver", 105, altoPagina - 21, {
      align: "center",
    });

    pdf.save("Reporte_general_cartas.pdf");
  };

  return (
    <div className="usuarios-container">
      <div className="usuario-header">
        <h2 className="fw-bold">Historial de Reportes</h2>

        <p className="text-muted">
          Consulta, visualiza y administra los reportes generados.
        </p>
      </div>

      <div className="d-flex gap-2 mb-3">
        <div className="input-group">
          <span className="input-group-text">
            <FaSearch />
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

        <button
          className="btn btn-naranja"
          onClick={generarReporteGeneral}
        >
          Generar reporte general
        </button>
      </div>

      {busqueda && (
        <p className="text-muted">
          Mostrando {cartasFiltradas.length} de {cartas.length} reportes.
        </p>
      )}

      {cargando ? (
        <div className="alert alert-info">
          Cargando reportes...
        </div>
      ) : cartasFiltradas.length === 0 ? (
        <div className="alert alert-secondary">
          {busqueda
            ? "No se encontraron reportes para esa búsqueda."
            : "No hay reportes generados todavía."}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Reporte</th>
                <th>Estudiante</th>
                <th>Documento</th>
                <th>Grado</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cartasPagina.map((carta) => (
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
                      <span className="badge bg-danger">
                        Inasistencia
                      </span>
                    )}

                    {carta.tipo === "uniforme" && (
                      <span className="badge bg-primary">
                        Uniforme
                      </span>
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
                          }
                        )
                      : "Sin fecha"}
                  </td>

                  <td>
                    {carta.observacion === "Notificado por WhatsApp" ? (
                      <span className="badge bg-success">
                        Notificado por WhatsApp
                      </span>
                    ) : carta.observacion ? (
                      <span className="badge bg-secondary">
                        {carta.observacion}
                      </span>
                    ) : (
                      <span className="text-muted">
                        Sin observación
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setCartaVer(carta)}
                      >
                        Ver carta
                      </button>

                      <button
                        className="btn btn-outline-danger btn-sm"
                        title="Eliminar reporte"
                        onClick={() => eliminarCarta(carta.id_carta)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cartasFiltradas.length > 10 && totalPaginas > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
          <button
            className="btn btn-outline-primary"
            disabled={paginaActual === 1}
            onClick={() =>
              setPaginaActual((pagina) => pagina - 1)
            }
          >
            Anterior
          </button>

          <span className="fw-bold">
            Pagina {paginaActual} de {totalPaginas}
          </span>

          <button
            className="btn btn-outline-primary"
            disabled={paginaActual === totalPaginas}
            onClick={() =>
              setPaginaActual((pagina) => pagina + 1)
            }
          >
            Siguiente
          </button>
        </div>
      )}

      {cartaVer && (
        <CartaReporte
          tipo={cartaVer.tipo}
          estudiante={{
            id_estudiante: cartaVer.id_estudiante,
            nombres: cartaVer.nombres,
            documento: cartaVer.documento,
            grado: cartaVer.grado,
          }}
          total={0}
          onCerrar={() => setCartaVer(null)}
          onGenerarPDF={() => {}}
        />
      )}
    </div>
  );
}

export default Reportes;




