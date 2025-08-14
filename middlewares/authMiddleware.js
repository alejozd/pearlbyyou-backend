// backend/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const db = require("../models"); // ✅ Importa tus modelos desde el index
const Admin = db.Admin; // ✅ Accede al modelo Admin

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, JWT_SECRET);

      req.admin = await Admin.findByPk(decoded.id);

      if (!req.admin) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      }

      next();
    } catch (error) {
      console.error("Error al verificar el token:", error);
      return res.status(401).json({ message: "No autorizado, token fallido." });
    }
  } else {
    return res
      .status(401)
      .json({ message: "No autorizado, no se proporcionó token." });
  }
};

module.exports = authMiddleware;
