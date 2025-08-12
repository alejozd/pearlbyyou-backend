const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const {
  getProductos,
  getInactiveProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deactivateProducto,
  activateProducto,
  deleteImage,
} = require("../controllers/productosController");

// Rutas protegidas que solo el admin puede usar
router.get("/inactivos", authMiddleware, getInactiveProductos); // ✅ Nueva ruta para productos inactivos
router.post("/", authMiddleware, upload.array("imagenes", 5), createProducto);
router.put("/:id", authMiddleware, upload.array("imagenes", 5), updateProducto);
router.put("/:id/desactivar", authMiddleware, deactivateProducto);
router.put("/:id/activar", authMiddleware, activateProducto); // ✅ Nueva ruta para activar
router.delete("/imagenes/:id", authMiddleware, deleteImage); // ✅ Nueva ruta para eliminar imagen

// Rutas públicas que cualquiera puede usar
router.get("/", getProductos);
router.get("/:id", getProductoById);

module.exports = router;
