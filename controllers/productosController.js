const { Producto, ImagenProducto } = require("../models");
const sequelize = require("sequelize");
const fs = require("fs/promises");
const path = require("path");

// Obtener todos los productos activos (pública)
exports.getProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { disponible: true },
      order: [["creado_en", "DESC"]],
      include: [
        {
          model: ImagenProducto,
          as: "imagenes",
          attributes: ["id", "url", "orden"],
          order: [["orden", "ASC"]],
        },
      ],
    });
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener productos inactivos (protegida)
exports.getInactiveProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { disponible: false },
      order: [["creado_en", "DESC"]],
      include: [
        {
          model: ImagenProducto,
          as: "imagenes",
          attributes: ["id", "url", "orden"],
          order: [["orden", "ASC"]],
        },
      ],
    });
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos inactivos:", error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener un solo producto para editar (protegida)
exports.getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id, {
      include: [
        {
          model: ImagenProducto,
          as: "imagenes",
          attributes: ["id", "url", "orden"],
        },
      ],
    });

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    res.json(producto);
  } catch (error) {
    console.error("Error al obtener el producto por ID:", error);
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo producto (protegida)
exports.createProducto = async (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  const imagenes = req.files;
  const t = await Producto.sequelize.transaction();

  try {
    const nuevoProducto = await Producto.create(
      { nombre, descripcion, precio, disponible: true },
      { transaction: t }
    );
    const imagenesParaGuardar = imagenes.map((file, index) => ({
      productoId: nuevoProducto.id,
      url: `/uploads/bolsos/${file.filename}`,
      orden: index + 1,
    }));
    await ImagenProducto.bulkCreate(imagenesParaGuardar, { transaction: t });
    await t.commit();
    res.status(201).json({
      message: "Producto creado con éxito",
      productoId: nuevoProducto.id,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al crear el producto:", error);
    if (imagenes && imagenes.length > 0) {
      for (const file of imagenes) {
        await fs.unlink(
          path.join(__dirname, "../uploads/bolsos", file.filename)
        );
      }
    }
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

// ✅ updateProducto ahora SOLO actualiza los campos de texto
exports.updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio } = req.body;
  const t = await Producto.sequelize.transaction();

  try {
    const [rowsUpdated] = await Producto.update(
      { nombre, descripcion, precio },
      { where: { id }, transaction: t }
    );

    if (rowsUpdated === 0) {
      await t.rollback();
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    await t.commit();
    res.json({ message: "Producto actualizado con éxito." });
  } catch (error) {
    await t.rollback();
    console.error("Error al actualizar el producto:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

// Desactivar un producto (soft delete)
exports.deactivateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await Producto.update({ disponible: false }, { where: { id } });
    res.json({ message: "Producto desactivado con éxito." });
  } catch (error) {
    console.error("Error al desactivar el producto:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

// Activar un producto (protegida)
exports.activateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await Producto.update({ disponible: true }, { where: { id } });
    res.json({ message: "Producto activado con éxito." });
  } catch (error) {
    console.error("Error al activar el producto:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

// ✅ Nueva función para añadir imágenes a un producto existente (POST)
exports.addImagesToProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No se subieron imágenes." });
    }

    // 1. Encontrar el producto y sus imágenes existentes
    const producto = await Producto.findByPk(id, {
      include: [{ model: ImagenProducto, as: "imagenes" }],
    });

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    // 2. Determinar el orden inicial para las nuevas imágenes
    let currentOrder =
      producto.imagenes.length > 0
        ? Math.max(...producto.imagenes.map((img) => img.orden)) + 1
        : 0;

    // 3. Preparar las nuevas imágenes para ser guardadas en la base de datos
    const newImages = files.map((file) => {
      const imageUrl = `/uploads/bolsos/${file.filename}`;
      const image = {
        url: imageUrl,
        orden: currentOrder,
        producto_id: id,
      };
      currentOrder++;
      return image;
    });

    // 4. Crear las nuevas entradas en la tabla ImagenProducto
    await ImagenProducto.bulkCreate(newImages);

    // 5. Devolver una respuesta exitosa
    return res.status(200).json({
      message: "Imágenes añadidas exitosamente.",
      images: newImages,
    });
  } catch (error) {
    console.error("Error al añadir imágenes al producto:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor.", error: error.message });
  }
};

// Eliminar una imagen de un producto (protegida)
exports.deleteImage = async (req, res) => {
  const { id } = req.params;
  try {
    const imagen = await ImagenProducto.findByPk(id);
    if (!imagen) {
      return res.status(404).json({ message: "Imagen no encontrada." });
    }
    const imagePath = path.join(__dirname, "../", imagen.url);
    if (
      await fs
        .access(imagePath)
        .then(() => true)
        .catch(() => false)
    ) {
      await fs.unlink(imagePath);
    }
    await imagen.destroy();
    res.json({ message: "Imagen eliminada con éxito." });
  } catch (error) {
    console.error("Error al eliminar la imagen:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};
