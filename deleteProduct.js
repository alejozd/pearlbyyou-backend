const { Producto, ImagenProducto } = require("../models");
const fs = require("fs/promises");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const productId = 99999; // ❌ Reemplaza esto con el ID del producto que quieres borrar

async function deleteProduct(id) {
  if (!id || isNaN(id)) {
    console.error("❌ Por favor, proporciona un ID de producto válido.");
    return;
  }

  const t = await Producto.sequelize.transaction();
  try {
    // 1. Encontrar las imágenes del producto
    const imagenes = await ImagenProducto.findAll({
      where: { productoId: id },
    });

    // 2. Eliminar los archivos de imagen del disco
    for (const imagen of imagenes) {
      const filePath = path.join(__dirname, "../", imagen.url);
      try {
        await fs.unlink(filePath);
        // console.log(`✅ Archivo eliminado: ${filePath}`);
      } catch (fileError) {
        if (fileError.code === "ENOENT") {
          // console.log(`⚠️ Archivo no encontrado, continuando: ${filePath}`);
        } else {
          throw fileError;
        }
      }
    }

    // 3. Eliminar los registros de imágenes de la base de datos
    await ImagenProducto.destroy({ where: { productoId: id }, transaction: t });

    // 4. Eliminar el producto de la base de datos
    const deletedCount = await Producto.destroy({
      where: { id },
      transaction: t,
    });

    await t.commit();
    // console.log("✔️ Operación de borrado completada con éxito.");
  } catch (error) {
    await t.rollback();
    console.error("❌ Error al borrar el producto:", error);
  } finally {
    await Producto.sequelize.close();
  }
}

deleteProduct(productId);
