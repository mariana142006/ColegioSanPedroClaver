import { useEffect, useState } from "react";
import api from "../services/api";

function PruebaEstudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarEstudiantes = async () => {
      try {
        const respuesta = await api.get("/estudiantes");

        console.log("ESTUDIANTES:", respuesta.data);

        setEstudiantes(respuesta.data);
      } catch (error) {
        console.error("ERROR:", error);

        setError(
          error.response?.data?.mensaje ||
            "No se pudieron cargar los estudiantes"
        );
      }
    };

    cargarEstudiantes();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Prueba de estudiantes</h2>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <p>
        Total cargados: <strong>{estudiantes.length}</strong>
      </p>

      {estudiantes.slice(0, 10).map((estudiante) => (
        <div
          key={estudiante.id_estudiante}
          className="border p-2 mb-2"
        >
          <strong>{estudiante.nombres}</strong>
          <br />
          Documento: {estudiante.documento}
          <br />
          Grupo: {estudiante.grado}
          <br />
          Director: {estudiante.nombre_director}
        </div>
      ))}
    </div>
  );
}

export default PruebaEstudiantes;