const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { Admin } = require("../models");

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const JWT_SECRET = process.env.JWT_SECRET;

// Endpoint de login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Debe ser un email válido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  ],
  validate,
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const admin = await Admin.findOne({ where: { email } });

      if (!admin) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
      }

      if (!admin.is_active) {
        return res.status(403).json({ message: "La cuenta está inactiva" });
      }

      const isMatch = await bcrypt.compare(password, admin.password_hash);

      if (!isMatch) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
      }

      // Actualizar last_login
      await admin.update({ last_login: new Date() });

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
  }
);

module.exports = router;
