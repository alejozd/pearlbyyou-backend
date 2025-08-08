require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const productosRoutes = require("./routes/productos");
const sequelize = require("./config/database");

const PORT = process.env.PORT || 3003;
const API_BASE = process.env.API_BASE || "/api";

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Rutas
app.use(`${API_BASE}/productos`, productosRoutes);

// Conexión a BD y levantar servidor
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a MySQL exitosa");

    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("✅ Modelos sincronizados");
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Servidor backend corriendo en http://localhost:${PORT}`);
      console.log(`   API: http://localhost:${PORT}${API_BASE}/productos`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar:", error);
  }
}

startServer();
