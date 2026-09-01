import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import logoColegio from "../assets/logo-colegio.png";
import logoInasistencia from "../assets/logo-inasistencia.jpg";
import logoUniforme from "../assets/logo-uniforme.jpg";
import logoLlegadas from "../assets/logo-llegadas.png";

import api from "../services/api";

function CartaReporte({ tipo, estudiante, total, fechaLlegada, onCerrar, onGenerarPDF }) {
  const [configuracion, setConfiguracion] = useState(null);
  const [numeroReporte, setNumeroReporte] = useState("");
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const respuesta = await api.get("/configuracion");

        setConfiguracion(respuesta.data);
      } catch (error) {
        console.log(error);
      }
    };

    cargarConfiguracion();
  }, []);

  useEffect(() => {
    const cargarNumero = async () => {
      try {
        const respuesta = await api.get("/cartas/numero");

        setNumeroReporte(respuesta.data.numero);
      } catch (error) {
        console.log(error);
      }
    };

    cargarNumero();
  }, []);

  if (!estudiante) {
    return null;
  }

  const fechaBase =
    tipo === "llegada" && fechaLlegada
      ? new Date(`${fechaLlegada}T00:00:00`)
      : new Date();

  const fechaActual = fechaBase.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // ==========================================
  // DATOS DEL REPORTE
  // ==========================================

  let titulo = "";
  let descripcion = "";
  let logoReporte = "";
  let colorTitulo = "#dc6505";

  switch (tipo) {
    case "inasistencia":
      titulo = "REPORTE DE INASISTENCIAS";
      logoReporte = logoInasistencia;

      descripcion = `El estudiante acumula ${total} inasistencias registradas en el sistema institucional. Se solicita la presencia del acudiente para realizar el respectivo seguimiento.`;
      break;

    case "uniforme":
      titulo = "REPORTE DE UNIFORME";
      logoReporte = logoUniforme;

      descripcion = `El estudiante acumula ${total} reportes por incumplimiento del uniforme institucional. Se solicita la presencia del acudiente para realizar el respectivo seguimiento.`;
      break;

    case "llegada":
      titulo = "REPORTE DE LLEGADAS TARDES";
      logoReporte = logoLlegadas;

      descripcion = `El estudiante acumula ${total} llegadas tardes registradas durante el periodo correspondiente. Se solicita la presencia del acudiente para realizar el respectivo seguimiento.`;
      break;

    default:
      titulo = "REPORTE";
      logoReporte = logoColegio;

      descripcion = `El estudiante acumula ${total} reportes en el sistema institucional. Se solicita la presencia del acudiente para realizar el respectivo seguimiento.`;
      break;
  }

  // ==========================================
  // GUARDAR CARTA
  // ==========================================

  const guardarCarta = async (archivo) => {
    try {
      const respuesta = await api.post("/cartas", {
        id_estudiante: estudiante.id_estudiante,

        tipo,

        numero_reporte: numeroReporte,

        fecha_generacion:
          tipo === "llegada" && fechaLlegada
            ? fechaLlegada
            : new Date().toISOString().substring(0, 10),

        archivo_pdf: archivo,

        observacion: `Reporte generado por ${tipo}`,
      });

      console.log("Carta guardada:", respuesta.data);

      return true;
    } catch (error) {
      console.log("Error guardando carta:", error);

      return false;
    }
  };

  // ==========================================
  // MARCAR ALERTA COMO REVISADA
  // ==========================================

  const marcarAlertaRevisada = async () => {
    try {
      if (tipo !== "llegada") {
        return true;
      }

      const fecha = new Date().toISOString().substring(0, 10);

      await api.put("/llegadas/alerta/revisada", {
        id_estudiante: estudiante.id_estudiante,

        fecha,
      });

      return true;
    } catch (error) {
      console.log("Error marcando alerta como revisada:", error);

      return false;
    }
  };

  // ==========================================
  // GENERAR PDF
  // ==========================================

  const generarPDF = async () => {
    try {
      const carta = document.getElementById("carta-reporte");

      if (!carta) {
        throw new Error("No se encontrÃ³ la carta");
      }

      const canvas = await html2canvas(carta, {
        scale: 2,
      });

      const imagen = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const ancho = pdf.internal.pageSize.getWidth();

      const alto = (canvas.height * ancho) / canvas.width;

      pdf.addImage(imagen, "PNG", 0, 10, ancho, alto);

      const nombreArchivo = `${titulo}.pdf`;

      pdf.save(nombreArchivo);

      return nombreArchivo;
    } catch (error) {
      console.log("Error generando PDF:", error);

      throw error;
    }
  };

  // ==========================================
  // BOTÃ“N GENERAR CARTA
  // ==========================================

  const manejarGenerarCarta = async () => {
    if (generando) {
      return;
    }

    try {
      setGenerando(true);

      // 1. Generar PDF
      const archivo = await generarPDF();

      // 2. Guardar carta en BD
      const cartaGuardada = await guardarCarta(archivo);

      if (!cartaGuardada) {
        throw new Error("No se pudo guardar la carta");
      }

      // 3. Marcar alerta como revisada
      await marcarAlertaRevisada();

      // 4. Avisar al componente padre
      if (onGenerarPDF) {
        onGenerarPDF();
      }

      alert("Carta generada y guardada correctamente.");

      onCerrar();
    } catch (error) {
      console.log(error);

      alert("No se pudo generar la carta.");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          {/* ================================= */}
          {/* ENCABEZADO */}
          {/* ================================= */}

          <div className="modal-header">
            <h5>Vista previa de la carta</h5>

            <button
              className="btn-close"
              onClick={onCerrar}
              disabled={generando}
            ></button>
          </div>

          {/* ================================= */}
          {/* CARTA */}
          {/* ================================= */}

          <div className="modal-body" id="carta-reporte">
            <div
              className="d-flex justify-content-between align-items-center"
              style={{
                marginBottom: "15px",
              }}
            >
              <img
                src={logoColegio}
                alt="Logo Colegio"
                style={{
                  width: "65px",
                  height: "65px",
                  objectFit: "contain",
                }}
              />

              <div className="text-center">
                <h3
                  className="fw-bold"
                  style={{
                    color: colorTitulo,
                    fontSize: "18px",
                  }}
                >
                  {titulo}
                </h3>

                <h5
                  style={{
                    color: "#0b2d5c",
                    fontSize: "16px",
                  }}
                >
                  {configuracion?.nombre_colegio || "Colegio San Pedro Claver"}

                  <p
                    style={{
                      fontSize: "14px",
                    }}
                  >
                    Rector: {configuracion?.rector || ""}
                  </p>
                </h5>

                <p>
                  <strong>Reporte NÂ°:</strong> {numeroReporte}
                </p>
              </div>

              <img
                src={logoReporte}
                alt="Tipo reporte"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "contain",
                }}
              />
            </div>

            <hr />

            {/* ================================= */}
            {/* INFORMACIÃ“N ESTUDIANTE */}
            {/* ================================= */}

            <div
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              <p>
                <strong>Fecha:</strong> {fechaActual}
              </p>

              <p>
                <strong>Estudiante:</strong> {estudiante.nombres}
              </p>

              <p>
                <strong>Documento:</strong> {estudiante.documento}
              </p>

              <p>
                <strong>Grado:</strong> {estudiante.grado}
              </p>
            </div>

            <hr />

            {/* ================================= */}
            {/* DESCRIPCIÃ“N */}
            {/* ================================= */}

            <p
              style={{
                textAlign: "justify",
                fontSize: "13px",
                lineHeight: "1.5",
                marginTop: "40px",
                minHeight: "90px",
              }}
            >
              {descripcion}
            </p>

            {/* ================================= */}
            {/* FIRMAS */}
            {/* ================================= */}

            <div
              className="row text-center"
              style={{
                marginTop: "100px",
              }}
            >
              <div className="col">
                {configuracion?.coordinador || "Coordinador AcadÃ©mico"}
                <br />
                Firma CoordinaciÃ³n
              </div>

              <div className="col">
                ______________________
                <br />
                Firma Acudiente
              </div>
            </div>
          </div>

          {/* ================================= */}
          {/* BOTONES */}
          {/* ================================= */}

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onCerrar}
              disabled={generando}
            >
              Cerrar
            </button>

            <button
              className="btn btn-success"
              onClick={manejarGenerarCarta}
              disabled={generando || !numeroReporte}
            >
              {generando ? "Generando..." : "ðŸ“„ Generar carta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartaReporte;



