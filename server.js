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

// Todo el trafico entra por cloudflared desde 127.0.0.1, asi que sin esto el
// rate limit veria la misma IP para todos los visitantes y seria global: 10
// intentos de login de una persona bloquearian a todo el mundo. Con "loopback"
// se confia solo en el proxy local y se usa la IP real (X-Forwarded-For).
app.set("trust proxy", "loopback");

// No anunciar el framework en cada respuesta.
app.disable("x-powered-by");

// Cabeceras de seguridad basicas (no se usa helmet para no añadir dependencias).
// La CSP se deja fuera a proposito: hay que revisarla con calma o rompe estilos.
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  // Solo tiene efecto cuando la peticion llega por HTTPS (Cloudflare).
  res.setHeader("Strict-Transport-Security", "max-age=15552000");
  next();
});

// Configuración de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Las fotos van ANTES del limitador: si no, cada imagen consumiria el cupo de
// la API y un catalogo con varias fotos podria agotarlo (429 en las fotos).
const webpBajoDemanda = require("./utils/webp");
app.use(
  "/uploads",
  webpBajoDemanda,
  express.static(path.join(__dirname, "uploads"), { maxAge: "7d" })
);

// Rate Limiting de la API (solo peticiones a la API, no a las fotos).
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // antes 100: varios visitantes tras la misma IP publica lo agotaban
  message: "Demasiadas solicitudes desde esta IP, por favor intente de nuevo más tarde.",
});
app.use(limiter);

// Limitador aparte y mas estricto para el login (frena la fuerza bruta).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Demasiados intentos de inicio de sesión. Espera 15 minutos.",
});
app.use(`${API_BASE}/auth/login`, loginLimiter);

app.use(express.json());

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
