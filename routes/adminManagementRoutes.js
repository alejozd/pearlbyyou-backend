const express = require("express");
const router = express.Router();
const db = require("../models"); // ✅ Importa el objeto 'db'
const Admin = db.Admin; // ✅ Obtén el modelo Admin desde 'db'
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// @desc    Obtener todos los administradores (excluyendo la contraseña)
// @route   GET /api/admin-management/
// @access  Private (Solo para Super Admin)
router.get(
  "/",
  authMiddleware,
  roleMiddleware("super_admin"),
  async (req, res) => {
    try {
      // ✅ Usa 'findAll' de Sequelize con 'attributes' para excluir el campo
      const admins = await Admin.findAll({
        attributes: { exclude: ["password_hash"] },
      });
      res.status(200).json(admins);
    } catch (error) {
      console.error("Error al obtener administradores:", error);
      res
        .status(500)
        .json({ message: "Error al obtener los administradores." });
    }
  }
);

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
      // ✅ Usa 'findOne' de Sequelize para buscar
      const adminExists = await Admin.findOne({ where: { email: email } });

      if (adminExists) {
        return res
          .status(400)
          .json({ message: "Este correo ya está registrado." });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt); // ✅ Almacena en password_hash

      // ✅ Usa 'create' de Sequelize con el campo correcto
      const newAdmin = await Admin.create({
        email,
        password_hash,
        role: "admin",
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
      console.error("Error al crear el administrador:", error);
      res.status(500).json({ message: "Error al crear el administrador." });
    }
  }
);

// @desc    Activar/Desactivar un administrador
// @route   PATCH /api/v1/admin-management/:id/status
// @access  Private (Solo para Super Admin)
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("super_admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      const admin = await Admin.findByPk(id);

      if (!admin) {
        return res
          .status(404)
          .json({ message: "Administrador no encontrado." });
      }

      // No permitir que un super_admin se desactive a sí mismo
      if (req.admin.id === parseInt(id, 10) && !is_active) {
        return res
          .status(403)
          .json({ message: "No puedes desactivar tu propia cuenta." });
      }

      await admin.update({ is_active });

      res
        .status(200)
        .json({
          message: `Administrador ${
            is_active ? "activado" : "desactivado"
          } con éxito.`,
        });
    } catch (error) {
      console.error("Error al cambiar el estado del administrador:", error);
      res
        .status(500)
        .json({ message: "Error al cambiar el estado del administrador." });
    }
  }
);

module.exports = router;
