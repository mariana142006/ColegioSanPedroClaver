import Estudiantes from "./pages/Estudiantes";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";

import Dashboard from "./pages/Dashboard";
import Llegadas from "./pages/Llegadas";
import Usuarios from "./pages/Usuarios";
import Uniformes from "./pages/Uniformes";
import Inasistencias from "./pages/Inasistencias";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";
import Directores from "./pages/Directores";
import Cartas from "./pages/Cartas";
import Login from "./pages/Login";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ======================================
            LOGIN
            ====================================== */}

        <Route path="/login" element={<Login />} />


        {/* ======================================
            RUTAS PROTEGIDAS
            ====================================== */}

        <Route
          path="/"
          element={
            <ProtectedRoute
              rolesPermitidos={[
                "Administrador",
                "Coordinador",
                "Director",
              ]}
            >
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* USUARIOS - SOLO ADMINISTRADOR */}

        <Route
          path="/usuarios"
          element={
            <ProtectedRoute
              rolesPermitidos={["Administrador"]}
            >
              <Layout>
                <Usuarios />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* ESTUDIANTES */}

        <Route
          path="/estudiantes"
          element={
            <ProtectedRoute
              rolesPermitidos={[
                "Administrador",
                "Coordinador",
                "Director",
              ]}
            >
              <Layout>
                <Estudiantes />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* LLEGADAS TARDE */}

        <Route
          path="/llegadas"
          element={
            <ProtectedRoute
              rolesPermitidos={[
                "Administrador",
                "Coordinador",
                "Director",
              ]}
            >
              <Layout>
                <Llegadas />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* UNIFORMES */}

        <Route
          path="/uniformes"
          element={
            <ProtectedRoute
              rolesPermitidos={[
                "Administrador",
                "Coordinador",
                "Director",
              ]}
            >
              <Layout>
                <Uniformes />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* INASISTENCIAS */}

        <Route
          path="/inasistencias"
          element={
            <ProtectedRoute
              rolesPermitidos={[
                "Administrador",
                "Coordinador",
                "Director",
              ]}
            >
              <Layout>
                <Inasistencias />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* REPORTES */}

        <Route
          path="/reportes"
          element={
            <ProtectedRoute
              rolesPermitidos={[
                "Administrador",
                "Coordinador",
                "Director",
              ]}
            >
              <Layout>
                <Reportes />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* DIRECTORES - ADMINISTRADOR Y COORDINADOR */}

        <Route
          path="/directores"
          element={
            <ProtectedRoute
              rolesPermitidos={[
                "Administrador",
                "Coordinador",
              ]}
            >
              <Layout>
                <Directores />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* CONFIGURACIÓN - SOLO ADMINISTRADOR */}

        <Route
          path="/configuracion"
          element={
            <ProtectedRoute
              rolesPermitidos={["Administrador"]}
            >
              <Layout>
                <Configuracion />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* CARTAS */}

        <Route
          path="/cartas"
          element={
            <ProtectedRoute
              rolesPermitidos={[
                "Administrador",
                "Coordinador",
                "Director",
              ]}
            >
              <Layout>
                <Cartas />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* ======================================
            RUTA DESCONOCIDA
            ====================================== */}

        <Route
          path="*"
          element={
            <ProtectedRoute
              rolesPermitidos={[
                "Administrador",
                "Coordinador",
                "Director",
              ]}
            >
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
