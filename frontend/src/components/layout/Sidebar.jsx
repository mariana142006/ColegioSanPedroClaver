import { NavLink, useNavigate } from "react-router-dom";

import {
  FaHome,
  FaUsers,
  FaUserGraduate,
  FaClock,
  FaTshirt,
  FaCalendarTimes,
  FaChartBar,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

function Sidebar() {
  const navigate = useNavigate();

  // ==========================================
  // OBTENER USUARIO ACTUAL
  // ==========================================

  const usuarioGuardado = localStorage.getItem("usuario");

  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  const rol = usuario?.rol;

  // ==========================================
  // MENÚ COMPLETO
  // ==========================================

  const menu = [
    {
      nombre: "Dashboard",
      ruta: "/",
      icono: <FaHome />,
      roles: ["Administrador", "Coordinador", "Director"],
    },

    {
      nombre: "Usuarios",
      ruta: "/usuarios",
      icono: <FaUsers />,
      roles: ["Administrador"],
    },

    {
      nombre: "Estudiantes",
      ruta: "/estudiantes",
      icono: <FaUserGraduate />,
      roles: ["Administrador", "Coordinador", "Director"],
    },

    {
      nombre: "Llegadas tarde",
      ruta: "/llegadas",
      icono: <FaClock />,
      roles: ["Administrador", "Coordinador", "Director"],
    },

    {
      nombre: "Uniformes",
      ruta: "/uniformes",
      icono: <FaTshirt />,
      roles: ["Administrador", "Coordinador", "Director"],
    },

    {
      nombre: "Inasistencias",
      ruta: "/inasistencias",
      icono: <FaCalendarTimes />,
      roles: ["Administrador", "Coordinador", "Director"],
    },

    {
      nombre: "Reportes",
      ruta: "/reportes",
      icono: <FaChartBar />,
      roles: ["Administrador", "Coordinador", "Director"],
    },

    {
      nombre: "Directores de grupo",
      ruta: "/directores",
      icono: <FaUsers />,
      roles: ["Administrador", "Coordinador"],
    },

    {
      nombre: "Configuración",
      ruta: "/configuracion",
      icono: <FaCog />,
      roles: ["Administrador"],
    },
  ];

  // ==========================================
  // FILTRAR MENÚ SEGÚN EL ROL
  // ==========================================

  const menuPermitido = menu.filter((item) => item.roles.includes(rol));

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    navigate("/login");
  };

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <aside
      className="text-white d-flex flex-column p-3"
      style={{
        width: "260px",
        height: "100vh",
        background: "#0b2d5c",
        overflowY: "auto",
      }}
    >
      {/* ENCABEZADO */}

      <div className="text-center mb-4">
        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "#ffffff",
            margin: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "30px",
          }}
        >
          <img
            src="/logo-colegio.png"
            alt="Logo Colegio San Pedro Claver"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        <h5 className="mt-3 mb-1">Colegio San Pedro Claver</h5>

        <small>Sistema Administrativo</small>
      </div>

      {/* MENÚ */}

      <nav
        className="flex-grow-1"
        style={{
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {menuPermitido.map((item, index) => (
          <NavLink
            key={index}
            to={item.ruta}
            className="text-decoration-none text-white d-flex align-items-center mb-2 p-2 rounded"
            style={({ isActive }) => ({
              background: isActive ? "#fd7e14" : "transparent",
            })}
          >
            <span className="me-3">{item.icono}</span>

            {item.nombre}
          </NavLink>
        ))}
      </nav>

      {/* USUARIO */}

      <div className="border-top pt-3">
        <div className="mb-2">👤 {usuario?.nombre || "Usuario"}</div>

        <div
          className="mb-2"
          style={{
            fontSize: "13px",
            opacity: 0.8,
          }}
        >
          Rol: {usuario?.rol || "Sin rol"}
        </div>

        <button className="btn btn-outline-light w-100" onClick={cerrarSesion}>
          <FaSignOutAlt className="me-2" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

