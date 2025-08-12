const express = require("express");
const mysql = require("mysql2/promise"); // Usamos la versión de promesas para un código más limpio
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

// TODO: CAMBIAR ESTA CLAVE SECRETA. USA UNA VARIABLE DE ENTORNO EN PRODUCCIÓN.
const JWT_SECRET = process.env.JWT_SECRET;

// Configuración de la base de datos (asegúrate de que coincida con la tuya)
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

// Endpoint de login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Se requiere correo electrónico y contraseña" });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT id, email, password_hash FROM admins WHERE email = ?",
      [email]
    );
    connection.end();

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const admin = rows[0];

    // Comparar la contraseña ingresada con el hash de la base de datos
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Si la contraseña coincide, crear un token JWT
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: "1h" } // El token expira en 1 hora
    );

    // Enviar el token al cliente
    res.json({ token, message: "Inicio de sesión exitoso" });
  } catch (error) {
    console.error("Error durante el inicio de sesión:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
