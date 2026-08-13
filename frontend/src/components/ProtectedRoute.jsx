import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, rolesPermitidos = [] }) {
  const token = localStorage.getItem("token");
  const usuarioGuardado = localStorage.getItem("usuario");

  // No hay sesión
  if (!token || !usuarioGuardado) {
    return <Navigate to="/login" replace />;
  }

  let usuario;

  try {
    usuario = JSON.parse(usuarioGuardado);
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    return <Navigate to="/login" replace />;
  }

  // El usuario no tiene el rol permitido
  if (
    rolesPermitidos.length > 0 &&
    !rolesPermitidos.includes(usuario.rol)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
