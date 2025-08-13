module.exports = (sequelize, DataTypes) => {
  const ImagenProducto = sequelize.define(
    "ImagenProducto",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "productos",
          key: "id",
        },
        field: "producto_id",
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      orden: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "imagenes_producto", // Nombre de la tabla
      timestamps: false, // No hay timestamps en esta tabla
    }
  );

  // Asociación con el modelo Producto
  ImagenProducto.associate = (models) => {
    ImagenProducto.belongsTo(models.Producto, {
      foreignKey: "producto_id",
    });
  };

  return ImagenProducto;
};
