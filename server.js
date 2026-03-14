require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const sequelize = require("./config/database");
const path = require("path");
const errorHandler = require("./middlewares/errorMiddleware");

// Importa las rutas de autenticación
const authRoutes = require("./routes/authRoutes");
console.log("✔️ authRoutes.js cargado correctamente."); // ✅ Log de depuración

// Importa las rutas de productos
const productosRoutes = require("./routes/productos");
console.log("✔️ productosRoutes.js cargado correctamente."); // ✅ Log de depuración

// Importa las rutas de administración de usuarios
const adminManagementRoutes = require("./routes/adminManagementRoutes");
console.log("✔️ adminManagementRoutes.js cargado correctamente."); // ✅ Log de depuración

const settingsRoutes = require("./routes/settingsRoutes");
console.log("✔️ settingsRoutes.js cargado correctamente."); // ✅ Log de depuración

const orderRoutes = require("./routes/orderRoutes");
console.log("✔️ orderRoutes.js cargado correctamente."); // ✅ Log de depuración

const app = express();
const PORT = process.env.PORT || 3003;
const API_BASE = process.env.API_BASE || "/api/v1";

// Configuración de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita cada IP a 100 solicitudes por ventana
  message: "Demasiadas solicitudes desde esta IP, por favor intente de nuevo más tarde.",
});
app.use(limiter);

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Usar las rutas de autenticación con un prefijo
app.use(`${API_BASE}/auth`, authRoutes);

// Usar las rutas de administración de usuarios
app.use(`${API_BASE}/admin-management`, adminManagementRoutes);

// Usar tus rutas de productos existentes
app.use(`${API_BASE}/productos`, productosRoutes);

// Usar tus rutas de configuraciones
app.use(`${API_BASE}/settings`, settingsRoutes);

// Usar rutas de órdenes
app.use(`${API_BASE}/orders`, orderRoutes);

// Serve static files from the 'build' folder. Esta debe ser la última ruta.
app.use(express.static(path.join(__dirname, "frontend", "build")));

// Manejador global de errores
app.use(errorHandler);

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
