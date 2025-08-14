require("dotenv").config();
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// TODO: CAMBIAR ESTA CLAVE SECRETA. DEBE SER LA MISMA QUE EN authRoutes.js
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  // Obtener el token del encabezado de la petición
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "No se proporcionó token de autenticación." });
  }

  // El token generalmente viene como "Bearer TOKEN_AQUI", así que lo separamos
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Formato de token no válido." });
  }

  try {
    // Verificar el token y decodificar el payload
    const decoded = jwt.verify(token, JWT_SECRET);
    // ✅ BUSCAR al administrador en la base de datos usando el ID del token
    const admin = await Admin.findById(decoded.id).select("-password"); // O Admin.findByPk(decoded.id) si usas Sequelize/Sequelize.

    if (!admin) {
      return res.status(401).json({ message: "Administrador no encontrado." });
    }

    // ✅ Reemplazar req.admin con el objeto completo del administrador (incluye el rol)
    req.admin = admin;
    next(); // Continuar con la siguiente función (la ruta protegida)
  } catch (err) {
    console.error("Error al verificar el token:", err);
    return res.status(401).json({ message: "Token inválido o expirado." });
  }
};

module.exports = authMiddleware;

// TODO: CAMBIAR ESTA CLAVE SECRETA. DEBE SER LA MISMA QUE EN authRoutes.js
