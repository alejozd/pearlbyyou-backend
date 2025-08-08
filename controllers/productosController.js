const { Producto } = require("../models");

exports.getProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { disponible: true },
      order: [["creado_en", "DESC"]],
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
