require("dotenv").config();
const jwt = require("jsonwebtoken");

// TODO: CAMBIAR ESTA CLAVE SECRETA. DEBE SER LA MISMA QUE EN authRoutes.js
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
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
    req.admin = decoded; // Agregar la información del admin a la petición
    next(); // Continuar con la siguiente función (la ruta protegida)
  } catch (err) {
    console.error("Error al verificar el token:", err);
    return res.status(401).json({ message: "Token inválido o expirado." });
  }
};

module.exports = authMiddleware;

// TODO: CAMBIAR ESTA CLAVE SECRETA. DEBE SER LA MISMA QUE EN authRoutes.js
