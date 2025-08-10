require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const productosRoutes = require("./routes/productos");
const path = require("path");

const PORT = process.env.PORT || 3003;
const API_BASE = process.env.API_BASE || "/api/v1";

const app = express();

app.use(cors());
app.use(express.json());

// Serve images from the 'uploads' folder. This should go first.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(`${API_BASE}/productos`, productosRoutes);

// Serve static files from the 'build' folder. This should be the last route.
app.use(express.static(path.join(__dirname, "frontend", "build")));

// Connect to the DB and start the server
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
