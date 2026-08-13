import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";

function Header() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (error) {
        console.log("Error leyendo usuario:", error);
      }
    }
  }, []);

  // ==========================================
  // NOMBRE SEGÚN EL ROL
  // ==========================================

  const obtenerNombre = () => {
    if (!usuario?.rol) {
      return "Usuario";
    }

    switch (usuario.rol) {
      case "Director":
        return "Carlin Janeth Peña Castro";

      case "Coordinador":
        return "Genara Maria Peña Castro";

      case "Administrador":
        return "Administrador Colegio";

      default:
        return usuario.nombre || "Usuario";
    }
  };

  // ==========================================
  // ROL MOSTRADO
  // ==========================================

  const obtenerRol = () => {
    if (!usuario?.rol) {
      return "Sin rol";
    }

    return usuario.rol;
  };

  return (
    <header className="bg-white shadow-sm px-4 py-3 d-flex justify-content-between align-items-center">
      {/* Título */}

      <div>
        <h4 className="mb-0">Panel Administrativo</h4>

        <small className="text-muted">Colegio San Pedro Claver</small>
      </div>

      {/* Usuario */}

      <div className="d-flex align-items-center gap-4">
        {/* Notificaciones */}

        {/* Información del usuario */}

        <div className="d-flex align-items-center">
          <FaUserCircle size={40} className="text-primary me-2" />

          <div>
            <strong>{obtenerNombre()}</strong>

            <br />

            <small className="text-muted">{obtenerRol()}</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
