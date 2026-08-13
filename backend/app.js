const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
const usuariosRoutes = require("./routes/usuarios");
const rutasDirectores = require("./routes/directores");
const rutasEstudiantes = require("./routes/estudiantes");
const rutasLlegadas = require("./routes/llegadas");
const rutasUniformes = require("./routes/uniformes");
const rutasInasistencias = require("./routes/inasistencias");
const rutasCartas = require("./routes/cartas");
const rutasConfiguracion = require("./routes/configuracion");
const rutasDashboard = require("./routes/dashboard");


// Usar rutas

app.use("/api/usuarios", usuariosRoutes);

app.use("/api/inasistencias", rutasInasistencias);

app.use("/api/configuracion", rutasConfiguracion);

app.use("/api/directores", rutasDirectores);

app.use("/api/estudiantes", rutasEstudiantes);

app.use("/api/llegadas", rutasLlegadas);

app.use("/api/uniformes", rutasUniformes);

app.use("/api/cartas", rutasCartas);

app.use("/api/dashboard", rutasDashboard);

app.get("/", (req, res) => {
  res.send("API Colegio San Pedro Claver funcionando correctamente");
});

module.exports = app;
