import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";

function Configuracion() {
  const [formulario, setFormulario] = useState({
    nombre_colegio: "",
    año_lectivo: "",
    hora_entrada: "",
    rector: "",
    coordinador: "",
    logo: "",
  });

  const cargarConfiguracion = async () => {
    try {
      const respuesta = await api.get("/configuracion");

      if (respuesta.data) {
        setFormulario(respuesta.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const guardarConfiguracion = async (e) => {
    e.preventDefault();

    try {
      await api.put("/configuracion", formulario);

      Swal.fire({
        title: "Guardado",
        text: "Configuración actualizada correctamente",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      console.log(error);

      Swal.fire("Error", "No se pudo guardar la configuración", "error");
    }
  };

  return (
    <div className="usuarios-container">
      <div className="usuario-header">
        <h2 className="fw-bold">Configuración del colegio</h2>

        <p className="text-muted">Administra los datos generales del sistema</p>
      </div>

      <div className="tabla-usuarios-container">
        <form onSubmit={guardarConfiguracion}>
          <input
            className="form-control mb-3"
            name="nombre_colegio"
            placeholder="Nombre del colegio"
            value={formulario.nombre_colegio}
            onChange={manejarCambio}
          />

          <input
            className="form-control mb-3"
            type="number"
            name="año_lectivo"
            placeholder="Año lectivo"
            value={formulario.año_lectivo}
            onChange={manejarCambio}
          />

          <label>Hora de entrada</label>

          <input
            className="form-control mb-3"
            type="time"
            name="hora_entrada"
            value={formulario.hora_entrada}
            onChange={manejarCambio}
          />

          <input
            className="form-control mb-3"
            name="rector"
            placeholder="Rector"
            value={formulario.rector}
            onChange={manejarCambio}
          />

          <input
            className="form-control mb-3"
            name="coordinador"
            placeholder="Coordinador"
            value={formulario.coordinador}
            onChange={manejarCambio}
          />

          

          {formulario.logo && (
            <div className="text-center mb-3">
              <img
                src={`/src/assets/${formulario.logo}`}
                alt="Logo colegio"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "contain",
                }}
              />
            </div>
          )}

          <button className="btn btn-naranja">Guardar configuración</button>
        </form>
      </div>
    </div>
  );
}

export default Configuracion;
