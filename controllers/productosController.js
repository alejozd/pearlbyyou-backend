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
          attributes: ["id", "url", "orden"], // ✅ Agregamos el ID de la imagen
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

// ✅ Obtener productos inactivos (protegida)
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
          attributes: ["id", "url", "orden"], // ✅ Agregamos el ID de la imagen
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
      url: path.join("uploads", file.filename),
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
        await fs.unlink(path.join(__dirname, "../uploads/", file.filename));
      }
    }
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

// Actualizar un producto existente (protegida)
exports.updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio } = req.body;
  const imagenes = req.files;
  const t = await Producto.sequelize.transaction();

  console.log("Archivos recibidos para actualizar:", req.files);

  try {
    const [rowsUpdated] = await Producto.update(
      { nombre, descripcion, precio },
      { where: { id }, transaction: t }
    );

    if (rowsUpdated === 0) {
      await t.rollback();
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    if (imagenes && imagenes.length > 0) {
      const imagenesAntiguas = await ImagenProducto.findAll({
        where: { producto_id: id },
        transaction: t,
      });

      for (const imagen of imagenesAntiguas) {
        const imagePath = path.join(__dirname, "../", imagen.url);
        if (
          await fs
            .access(imagePath)
            .then(() => true)
            .catch(() => false)
        ) {
          await fs.unlink(imagePath);
        }
      }

      await ImagenProducto.destroy({
        where: { producto_id: id },
        transaction: t,
      });

      // ✅ AQUI está la clave: pasamos el 'id' del producto en la creación de nuevas imagenes
      const nuevasImagenes = imagenes.map((file, index) => {
        const imageUrl = `/uploads/bolsos/${file.filename}`;
        return {
          producto_id: id,
          url: imageUrl,
          orden: index + 1,
        };
      });

      await ImagenProducto.bulkCreate(nuevasImagenes, { transaction: t });
    }

    await t.commit();
    res.json({ message: "Producto actualizado con éxito." });
  } catch (error) {
    await t.rollback();
    console.error("Error al actualizar el producto:", error);
    if (imagenes && imagenes.length > 0) {
      for (const file of imagenes) {
        await fs.unlink(file.path);
      }
    }
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

// ✅ Activar un producto (protegida)
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

// ✅ Eliminar una imagen de un producto (protegida)
exports.deleteImage = async (req, res) => {
  const { id } = req.params;
  try {
    const imagen = await ImagenProducto.findByPk(id);
    if (!imagen) {
      return res.status(404).json({ message: "Imagen no encontrada." });
    }
    await fs.unlink(path.join(__dirname, "../", imagen.url));
    await imagen.destroy();
    res.json({ message: "Imagen eliminada con éxito." });
  } catch (error) {
    console.error("Error al eliminar la imagen:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};
