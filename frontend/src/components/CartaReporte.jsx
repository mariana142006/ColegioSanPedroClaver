import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import logoColegio from "../assets/logo-colegio.png";
import logoInasistencia from "../assets/logo-inasistencia.jpg";
import logoUniforme from "../assets/logo-uniforme.jpg";
import logoLlegadas from "../assets/logo-llegadas.png";

import api from "../services/api";

function CartaReporte({ tipo, estudiante, total, fechaLlegada, grupoAlerta, onCerrar, onGenerarPDF }) {
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

        grupo_alerta:
          tipo === "llegada" || tipo === "uniforme"
            ? Number(grupoAlerta)
            : null,

        tipo,

        numero_reporte: numeroReporte,

        fecha_generacion:
          tipo === "llegada" && fechaLlegada
            ? fechaLlegada
            : new Date().toISOString().substring(0, 10),

        archivo_pdf: archivo,

        observacion: "Carta generada",
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

        
        grupo_alerta:
          tipo === "llegada" || tipo === "uniforme"
            ? Number(grupoAlerta)
            : null,
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
        throw new Error("No se encontro la carta");
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

      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      return {
        nombreArchivo,
        pdfUrl,
      };
    } catch (error) {
      console.log("Error generando PDF:", error);

      throw error;
    }
  };
  // ==========================================
  //   // BOTON GENERAR CARTA
  // ==========================================

  const manejarGenerarCarta = async () => {
    if (generando) {
      return;
    }

    try {
      setGenerando(true);

      // 1. Generar PDF sin descargarlo
      const resultadoPDF = await generarPDF();

      // 2. Abrir el PDF en una nueva pestaña
      const ventanaPDF = window.open(resultadoPDF.pdfUrl, "_blank");

      // 3. Guardar carta en BD
      const cartaGuardada = await guardarCarta(resultadoPDF.nombreArchivo);

      if (!cartaGuardada) {
        throw new Error("No se pudo guardar la carta");
      }

      // 4. Marcar alerta como revisada
      await marcarAlertaRevisada();

      // 5. Avisar al componente padre
      if (onGenerarPDF) {
        onGenerarPDF();
      }

      // 6. Abrir WhatsApp con el acudiente
      if (!estudiante.telefono_acudiente) {
        alert(
          "La carta fue generada correctamente, pero el estudiante no tiene registrado un telefono de acudiente."
        );
      } else {
        let telefono = String(estudiante.telefono_acudiente).replace(/\D/g, "");

        if (telefono.length === 10 && telefono.startsWith("3")) {
          telefono = "57" + telefono;
        }

        const mensaje =
          `Cordial saludo, ${estudiante.nombre_acudiente || "senor(a) acudiente"}. ` +
          `Nos permitimos informarle que el estudiante ${estudiante.nombres}, ` +
          `del grado ${estudiante.grado}, tiene un reporte registrado en el sistema ` +
          `institucional. Adjuntamos la carta correspondiente para su conocimiento ` +
          `y seguimiento. ` +
          `Agradecemos su atencion y acompanamiento al estudiante.`;

        const url =
          `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

        window.open(url, "_blank");
      }

      alert(
        "Carta generada correctamente. Se abrio el PDF y WhatsApp para realizar la notificacion."
      );

      onCerrar();


    } catch (error) {
      console.log("Error:", error);

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
                  <strong>Reporte N°:</strong> {numeroReporte}
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
            {/* INFORMACION ESTUDIANTE */}
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
            {/* DESCRIPCION */}
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
                {configuracion?.coordinador || "Coordinador Academico"}
                <br />
                Firma Coordinacion
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
              {generando ? "Generando..." : "Notificar acudiente por WhatsApp"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartaReporte;












