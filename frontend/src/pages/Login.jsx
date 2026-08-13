import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    correo: "",
    contraseña: "",
  });

  const [cargando, setCargando] = useState(false);

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const iniciarSesion = async (e) => {
    e.preventDefault();

    if (!formulario.correo || !formulario.contraseña) {
      Swal.fire(
        "Campos obligatorios",
        "Ingrese el correo y la contraseña",
        "warning"
      );
      return;
    }

    try {
      setCargando(true);

      const respuesta = await api.post("/usuarios/login", formulario);

      localStorage.setItem("token", respuesta.data.token);
      localStorage.setItem(
        "usuario",
        JSON.stringify(respuesta.data.usuario)
      );

      Swal.fire({
        title: "¡Bienvenido!",
        text: `Hola ${respuesta.data.usuario.nombre}`,
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });

      navigate("/");
    } catch (error) {
      console.log("Error iniciando sesión:", error);

      Swal.fire(
        "Error",
        error.response?.data?.mensaje ||
          "Correo o contraseña incorrectos",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "#f4f6f9",
      }}
    >
      <div
        className="card shadow"
        style={{
          width: "400px",
          borderRadius: "15px",
        }}
      >
        <div className="card-body p-4">

          <div className="text-center mb-4">

            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#fd7e14",
                margin: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "35px",
              }}
            >
              🏫
            </div>

            <h3 className="fw-bold mt-3">
              Colegio San Pedro Claver
            </h3>

            <p className="text-muted">
              Sistema Administrativo
            </p>

          </div>

          <form onSubmit={iniciarSesion}>

            <div className="mb-3">
              <label className="form-label">
                Correo electrónico
              </label>

              <input
                type="email"
                className="form-control"
                name="correo"
                placeholder="Ingrese su correo"
                value={formulario.correo}
                onChange={manejarCambio}
              />
            </div>

            <div className="mb-4">
              <label className="form-label">
                Contraseña
              </label>

              <input
                type="password"
                className="form-control"
                name="contraseña"
                placeholder="Ingrese su contraseña"
                value={formulario.contraseña}
                onChange={manejarCambio}
              />
            </div>

            <button
              type="submit"
              className="btn btn-naranja w-100"
              disabled={cargando}
            >
              {cargando
                ? "Ingresando..."
                : "Iniciar sesión"}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}

export default Login;