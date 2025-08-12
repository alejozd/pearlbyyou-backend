const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// ✅ Importa todas las funciones del controlador
const {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deactivateProducto,
} = require("../controllers/productosController");

// Rutas protegidas que solo el admin puede usar
router.post("/", authMiddleware, upload.array("imagenes", 5), createProducto);

router.put("/:id", authMiddleware, upload.array("imagenes", 5), updateProducto);

router.put("/:id/desactivar", authMiddleware, deactivateProducto);

router.get("/:id", getProductoById); // ✅ Ruta para obtener un solo producto

// Rutas públicas que cualquiera puede usar
router.get("/", getProductos);

module.exports = router;
