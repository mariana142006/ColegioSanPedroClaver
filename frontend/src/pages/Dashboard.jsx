import { useEffect, useState } from "react";
import api from "../services/api";

import CardStats from "../components/ui/CardStats";

import {
  FaUsers,
  FaUserGraduate,
  FaClock,
  FaCalendarTimes,
} from "react-icons/fa";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function Dashboard() {
  // ==========================================
  // ESTADÍSTICAS
  // ==========================================

  const [estadisticas, setEstadisticas] = useState({
    usuarios: 0,
    estudiantes: 0,
    llegadas_tarde: 0,
    inasistencias: 0,
  });

  const [cargando, setCargando] = useState(true);

  // ==========================================
  // CARGAR ESTADÍSTICAS
  // ==========================================

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);

      const respuesta = await api.get("/dashboard");

      setEstadisticas(respuesta.data);
    } catch (error) {
      console.log("ERROR CARGANDO DASHBOARD:", error);
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // EJECUTAR AL ENTRAR
  // ==========================================

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  // ==========================================
  // GRÁFICA
  // ==========================================

  // ==========================================
  // MESES
  // ==========================================

  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // ==========================================
  // PREPARAR DATOS MENSUALES
  // ==========================================

  const datosMensuales = nombresMeses.map((_, index) => {
    const numeroMes = index + 1;

    const registro = estadisticas.mensual?.find(
      (item) => Number(item.mes) === numeroMes,
    );

    return {
      llegadas: registro ? Number(registro.llegadas_tarde) : 0,

      inasistencias: registro ? Number(registro.inasistencias) : 0,
    };
  });

  // ==========================================
  // GRÁFICA MENSUAL
  // ==========================================

  const datosGrafica = {
    labels: nombresMeses,

    datasets: [
      {
        label: "Llegadas tarde",

        data: datosMensuales.map((mes) => mes.llegadas),

        backgroundColor: "#fd7e14",

        borderRadius: 6,
      },

      {
        label: "Inasistencias",

        data: datosMensuales.map((mes) => mes.inasistencias),

        backgroundColor: "#dc3545",

        borderRadius: 6,
      },
    ],
  };

  const opcionesGrafica = {
    responsive: true,

    plugins: {
      legend: {
        position: "top",
      },

      title: {
        display: true,

        text: "Llegadas tarde e inasistencias por mes",
      },
    },

    scales: {
      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
        },
      },
    },
  };
  return (
    <div>
      {/* ENCABEZADO */}

      <h2 className="mb-2 fw-bold">Dashboard</h2>

      <p className="text-muted">Resumen general del Colegio San Pedro Claver</p>

      {/* TARJETAS */}

      <div className="row g-4 mt-2">
        {/* USUARIOS */}

        <div className="col-md-3">
          <CardStats
            titulo="Usuarios"
            cantidad={cargando ? "..." : estadisticas.usuarios}
            icono={<FaUsers />}
            color="#0d6efd"
          />
        </div>

        {/* ESTUDIANTES */}

        <div className="col-md-3">
          <CardStats
            titulo="Estudiantes"
            cantidad={cargando ? "..." : estadisticas.estudiantes}
            icono={<FaUserGraduate />}
            color="#198754"
          />
        </div>

        {/* LLEGADAS */}

        <div className="col-md-3">
          <CardStats
            titulo="Llegadas tarde"
            cantidad={cargando ? "..." : estadisticas.llegadas_tarde}
            icono={<FaClock />}
            color="#fd7e14"
          />
        </div>

        {/* INASISTENCIAS */}

        <div className="col-md-3">
          <CardStats
            titulo="Inasistencias"
            cantidad={cargando ? "..." : estadisticas.inasistencias}
            icono={<FaCalendarTimes />}
            color="#dc3545"
          />
        </div>
      </div>

      {/* GRÁFICA */}

      <div className="card shadow-sm border-0 mt-5">
        <div className="card-body">
          <Bar data={datosGrafica} options={opcionesGrafica} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
