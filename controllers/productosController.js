const { Producto, ImagenProducto } = require("../models"); // Importa el modelo de ImagenProducto

exports.getProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { disponible: true },
      order: [["creado_en", "DESC"]],
      include: [
        {
          model: ImagenProducto, // Incluye el modelo de ImagenProducto
          as: "imagenes", // Usa el alias que definas en la asociación
          attributes: ["url", "orden"], // Selecciona solo las columnas que necesitas
          order: [["orden", "ASC"]], // Opcional: ordena las imágenes
        },
      ],
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
