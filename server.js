require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const path = require("path");

// Importa las rutas de autenticación
const authRoutes = require("./routes/authRoutes");
// Usa solo la importación de tus rutas de productos existentes
const productosRoutes = require("./routes/productos");
const adminManagementRoutes = require("./routes/adminManagementRoutes");

const app = express();
const PORT = process.env.PORT || 3003;
const API_BASE = process.env.API_BASE || "/api/v1";

app.use(cors());
// express.json() reemplaza a body-parser.json()
app.use(express.json());

// Serve images from the 'uploads' folder.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Usar las rutas de autenticación con un prefijo
app.use(`${API_BASE}/auth`, authRoutes);

app.use("/api/admin-management", adminManagementRoutes);

// Usar tus rutas de productos existentes
app.use(`${API_BASE}/productos`, productosRoutes);

// Serve static files from the 'build' folder. Esta debe ser la última ruta.
app.use(express.static(path.join(__dirname, "frontend", "build")));

// Conectar a la DB e iniciar el servidor
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a MySQL exitosa");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
      console.log(`API: http://localhost:${PORT}${API_BASE}/productos`);
    });
  } catch (error) {
    console.error("Error al iniciar:", error);
  }
}

startServer();
