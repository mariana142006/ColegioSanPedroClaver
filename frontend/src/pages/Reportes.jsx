import { useEffect, useState } from "react";
import api from "../services/api";
import CartaReporte from "../components/CartaReporte";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoColegio from "../assets/logo-colegio.png";

function Reportes() {
  const [cartas, setCartas] = useState([]);

  const [cartaVer, setCartaVer] = useState(null);

  const cargarCartas = async () => {
    try {
      const respuesta = await api.get("/cartas");
      setCartas(respuesta.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    cargarCartas();
  }, []);

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

    pdf.text("COLEGIO SAN PEDRO CLAVER", 105, 18, { align: "center" });

    pdf.setFontSize(13);

    pdf.text("Reporte general de cartas generadas", 105, 28, {
      align: "center",
    });

    pdf.setFontSize(10);

    pdf.setTextColor(0, 0, 0);

    pdf.text(`Fecha de generación: ${fecha}`, 105, 36, { align: "center" });

    pdf.text(`Total de reportes: ${cartas.length}`, 105, 43, {
      align: "center",
    });

    const datos = cartas.map((carta, index) => [
      String(index + 1).padStart(4, "0"),
      carta.nombres,
      carta.documento,
      carta.grado,
      carta.tipo,
      new Date(carta.fecha_generacion).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    ]);

    autoTable(pdf, {
      startY: 50,

      head: [
        ["N° Reporte", "Estudiante", "Documento", "Grado", "Tipo", "Fecha"],
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
      <h2 className="fw-bold">Historial de Reportes</h2>

      <p className="text-muted">Cartas generadas por el sistema.</p>
      <button className="btn btn-naranja mb-3" onClick={generarReporteGeneral}>
        📄 Generar reporte general
      </button>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Reporte</th>
            <th>Estudiante</th>
            <th>Documento</th>
            <th>Grado</th>
            <th>Tipo</th>
            <th>Fecha</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {cartas.map((carta) => (
            <tr key={carta.id_carta}>
              <td>{carta.numero_reporte}</td>

              <td>{carta.nombres}</td>

              <td>{carta.documento}</td>

              <td>{carta.grado}</td>

              <td>{carta.tipo}</td>

              <td>
                {new Date(carta.fecha_generacion).toLocaleDateString("es-CO")}
              </td>

              <td>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    console.log("CARTA SELECCIONADA:");
                    setCartaVer(carta);
                  }}
                >
                  Ver carta
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
