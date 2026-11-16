const { Order, Producto } = require("../models");

exports.createOrder = async (req, res) => {
  try {
    const { cliente_nombre, cliente_whatsapp, productos } = req.body;

    let total = 0;
    const detallesProductos = [];

    // Validar productos y calcular total desde DB
    for (const item of productos) {
      const producto = await Producto.findByPk(item.id);
      if (!producto) {
        return res.status(404).json({ message: `Producto con ID ${item.id} no encontrado` });
      }
      const subtotal = parseFloat(producto.precio) * item.cantidad;
      total += subtotal;
      detallesProductos.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: item.cantidad,
        subtotal
      });
    }

    // Guardar orden
    const nuevaOrden = await Order.create({
      cliente_nombre,
      cliente_whatsapp,
      total,
      detalles: detallesProductos,
      estado: "pendiente"
    });

    // Formatear mensaje de WhatsApp
    let mensaje = `*Nueva Orden #${nuevaOrden.id}*\n\n`;
    mensaje += `*Cliente:* ${cliente_nombre}\n`;
    mensaje += `*WhatsApp:* ${cliente_whatsapp}\n\n`;
    mensaje += `*Productos:*\n`;
    detallesProductos.forEach(p => {
      mensaje += `- ${p.nombre} x${p.cantidad}: $${p.subtotal}\n`;
    });
    mensaje += `\n*Total: $${total}*`;

    const whatsappUrl = `https://wa.me/${process.env.WHATSAPP_NUMBER || '5491100000000'}?text=${encodeURIComponent(mensaje)}`;

    res.status(201).json({
      message: "Orden creada con éxito",
      orderId: nuevaOrden.id,
      whatsappUrl,
      whatsappMessage: mensaje
    });

  } catch (error) {
    console.error("Error al crear orden:", error);
    res.status(500).json({ message: "Error interno al procesar la orden" });
  }
};
