const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

// Endpoint de login
router.post("/login", async (req, res) => {
  console.log("¡Ruta de login en authRoutes.js ejecutada!");
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Se requiere correo electrónico y contraseña" });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      "SELECT id, email, password_hash, role, is_active FROM admins WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      console.log("Credenciales incorrectas");
      connection.end();
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const admin = rows[0];

    if (!admin.is_active) {
      connection.end();
      return res.status(403).json({ message: "La cuenta está inactiva" });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      connection.end();
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // ✅ Nueva consulta para actualizar el campo last_login
    await connection.execute(
      "UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [admin.id]
    );

    connection.end();

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, message: "Inicio de sesión exitoso" });
  } catch (error) {
    console.error("Error durante el inicio de sesión:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
