const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// @desc    Crear un nuevo administrador
// @route   POST /api/admin-management/
// @access  Private (Solo para Super Admin)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("super_admin"),
  async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Por favor, ingrese un correo y contraseña." });
    }

    try {
      const adminExists = await Admin.findOne({ email });

      if (adminExists) {
        return res
          .status(400)
          .json({ message: "Este correo ya está registrado." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newAdmin = await Admin.create({
        email,
        password: hashedPassword,
        role: "admin", // ✅ El rol por defecto para los nuevos administradores es 'admin'
      });

      if (newAdmin) {
        res.status(201).json({
          id: newAdmin.id,
          email: newAdmin.email,
          role: newAdmin.role,
          message: "Administrador creado con éxito.",
        });
      } else {
        res.status(400).json({ message: "Datos de administrador inválidos." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error al crear el administrador." });
    }
  }
);

// @desc    Obtener todos los administradores (excluyendo la contraseña)
// @route   GET /api/admin-management/
// @access  Private (Solo para Super Admin)
router.get(
  "/",
  authMiddleware,
  roleMiddleware("super_admin"),
  async (req, res) => {
    try {
      const admins = await Admin.find().select("-password");
      res.status(200).json(admins);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener los administradores." });
    }
  }
);

// ✅ Agrega más rutas aquí, como para eliminar un administrador
// router.delete('/:id', authMiddleware, roleMiddleware('super_admin'), ...);

module.exports = router;
