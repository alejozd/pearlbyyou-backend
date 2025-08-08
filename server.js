require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const productosRoutes = require("./routes/productos");

const PORT = process.env.PORT || 3003;
const API_BASE = process.env.API_BASE || "/api/v1";

const app = express();

app.use(cors());
app.use(express.json());

app.use(`${API_BASE}/productos`, productosRoutes);

// Conexión a BD y levantar servidor
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a MySQL exitosa");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Servidor backend corriendo en http://localhost:${PORT}`);
      console.log(`   API: http://localhost:${PORT}${API_BASE}/productos`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar:", error);
  }
}

startServer();
