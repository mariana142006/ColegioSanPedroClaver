const mysql = require("mysql2/promise");

async function probar() {
  try {
    const conexion = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3307,
      user: "sistema_colegio",
      password: "SanPedro123",
      database: "colegio_san_pedro_claver"
    });

    console.log("✅ Conexión exitosa");
    await conexion.end();
  } catch (error) {
    console.error(error);
  }
}

probar();