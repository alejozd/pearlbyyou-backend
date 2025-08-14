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
  addImagesToProducto,
} = require("../controllers/productosController");

// Rutas protegidas que solo el admin puede usar
router.get("/inactivos", authMiddleware, getInactiveProductos);
router.post("/", authMiddleware, upload.array("imagenes", 5), createProducto);
// router.put("/:id", authMiddleware, updateProducto);
router.put("/:id", authMiddleware, upload.none(), updateProducto);
router.put("/:id/desactivar", authMiddleware, deactivateProducto);
router.put("/:id/activar", authMiddleware, activateProducto);
router.delete("/imagenes/:id", authMiddleware, deleteImage);
// ✅ NUEVA RUTA para subir imágenes a un producto existente
router.post(
  "/imagenes/:id",
  authMiddleware,
  upload.array("imagenes", 5),
  (req, res, next) => {
    // console.log(`Petición POST a /productos/imagenes/${req.params.id}`);
    next();
  },
  addImagesToProducto
);

// Rutas públicas que cualquiera puede usar
router.get("/", getProductos);
router.get("/:id", getProductoById);

module.exports = router;
