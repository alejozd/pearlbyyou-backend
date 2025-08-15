const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { Setting } = require("../models"); // Importa el modelo Setting

// @desc    Obtener todas las configuraciones (público)
// @route   GET /api/v1/settings
// @access  Public
router.get("/", async (req, res) => {
  try {
    const settings = await Setting.findAll();
    // Transforma el array de objetos en un objeto clave-valor para fácil consumo en el frontend
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    res.json(settingsMap);
  } catch (error) {
    console.error("Error al obtener configuraciones:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// @desc    Actualizar una configuración (protegida por Super Admin)
// @route   PUT /api/v1/settings/:key
// @access  Private (Solo para Super Admin)
router.put(
  "/:key",
  authMiddleware,
  roleMiddleware("super_admin"),
  async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;

      if (!value) {
        return res
          .status(400)
          .json({
            message: "El valor de la configuración no puede estar vacío.",
          });
      }

      const [updated] = await Setting.update(
        { value },
        {
          where: { key: key },
        }
      );

      if (updated === 0) {
        return res
          .status(404)
          .json({ message: "Configuración no encontrada." });
      }

      res.json({ message: `Configuración '${key}' actualizada con éxito.` });
    } catch (error) {
      console.error(
        `Error al actualizar configuración '${req.params.key}':`,
        error
      );
      res.status(500).json({ message: "Error interno del servidor." });
    }
  }
);

module.exports = router;
