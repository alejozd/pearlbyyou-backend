const { Producto, ImagenProducto } = require("../models");
const sequelize = require("sequelize");
const fs = require("fs/promises");
const path = require("path");

// Obtener todos los productos (pública)
exports.getProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { disponible: true },
      order: [["creado_en", "DESC"]],
      include: [
        {
          model: ImagenProducto,
          as: "imagenes",
          attributes: ["url", "orden"],
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

// Obtener un solo producto para editar (protegida)
exports.getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id, {
      include: [
        {
          model: ImagenProducto,
          as: "imagenes",
          attributes: ["url", "orden"],
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

  // Iniciar una transacción para asegurar que la creación del producto y las imágenes sea atómica
  const t = await Producto.sequelize.transaction();

  try {
    // 1. Crear el producto
    const nuevoProducto = await Producto.create(
      {
        nombre,
        descripcion,
        precio,
        disponible: true,
      },
      { transaction: t }
    );

    // 2. Crear los registros de imágenes
    const imagenesParaGuardar = imagenes.map((file, index) => ({
      productoId: nuevoProducto.id,
      url: path.join("uploads", file.filename),
      orden: index + 1,
    }));

    await ImagenProducto.bulkCreate(imagenesParaGuardar, { transaction: t });

    await t.commit(); // ✅ Si todo sale bien, confirmar la transacción

    res
      .status(201)
      .json({
        message: "Producto creado con éxito",
        productoId: nuevoProducto.id,
      });
  } catch (error) {
    await t.rollback(); // ❌ Si algo falla, revertir los cambios
    console.error("Error al crear el producto:", error);
    // Eliminar los archivos si la transacción falla
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

  try {
    // 1. Actualizar los datos del producto
    const [rowsUpdated] = await Producto.update(
      { nombre, descripcion, precio },
      { where: { id }, transaction: t }
    );

    if (rowsUpdated === 0) {
      await t.rollback();
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    // 2. Si se subieron nuevas imágenes, actualizar las existentes
    if (imagenes && imagenes.length > 0) {
      // Eliminar las imágenes antiguas del sistema de archivos y la base de datos
      const imagenesAntiguas = await ImagenProducto.findAll({
        where: { productoId: id },
        transaction: t,
      });
      for (const imagen of imagenesAntiguas) {
        await fs.unlink(path.join(__dirname, "../", imagen.url));
      }
      await ImagenProducto.destroy({
        where: { productoId: id },
        transaction: t,
      });

      // Crear nuevos registros de imágenes
      const nuevasImagenes = imagenes.map((file, index) => ({
        productoId: id,
        url: path.join("uploads", file.filename),
        orden: index + 1,
      }));
      await ImagenProducto.bulkCreate(nuevasImagenes, { transaction: t });
    }

    await t.commit();
    res.json({ message: "Producto actualizado con éxito." });
  } catch (error) {
    await t.rollback();
    console.error("Error al actualizar el producto:", error);
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
